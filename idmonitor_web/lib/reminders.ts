/**
 * Reminder Scheduling System
 *
 * Implements flexible, user-configurable reminder schedules:
 * - Early warnings (e.g., 1 year, 6 months, 3 months before expiry)
 * - Increasing frequency as expiry approaches
 * - User-controlled notification channels
 */

import { prisma } from './db';
import { DocumentKind, ReminderFrequency, ReminderType } from '@prisma/client';
import { addDays, differenceInDays, isBefore } from 'date-fns';

/**
 * Generate all reminders for a document based on user's config
 */
export async function scheduleRemindersForDocument(
  documentId: string,
  userId: string,
  expiryDate: Date,
  documentKind: DocumentKind
) {
  // Get user's reminder config for this document type
  let config = await prisma.reminderConfig.findFirst({
    where: {
      userId,
      OR: [{ documentKind }, { documentKind: null }], // Specific or global config
    },
    orderBy: {
      documentKind: 'desc', // Prefer specific over global
    },
  });

  // If no config exists, create default
  if (!config) {
    config = await prisma.reminderConfig.create({
      data: {
        userId,
        earlyReminderDays: [365, 180, 90],
        urgentPeriodDays: 30,
        urgentFrequency: 'WEEKLY',
        criticalPeriodDays: 7,
        criticalFrequency: 'DAILY',
      },
    });
  }

  const today = new Date();
  const daysUntilExpiry = differenceInDays(expiryDate, today);

  // Delete existing scheduled reminders for this document
  await prisma.scheduledReminder.deleteMany({
    where: { documentId, sentAt: null },
  });

  const reminders: Array<{
    userId: string;
    documentId: string;
    scheduledFor: Date;
    reminderType: ReminderType;
    message: string;
  }> = [];

  // 1. Schedule early warning reminders
  for (const days of config.earlyReminderDays) {
    const reminderDate = addDays(expiryDate, -days);

    if (isBefore(today, reminderDate)) {
      reminders.push({
        userId,
        documentId,
        scheduledFor: reminderDate,
        reminderType: 'EARLY_WARNING',
        message: `Your ${documentKind} expires in ${days} days (${expiryDate.toLocaleDateString()})`,
      });
    }
  }

  // 2. Schedule urgent period reminders (increasing frequency)
  if (daysUntilExpiry <= config.urgentPeriodDays && daysUntilExpiry > config.criticalPeriodDays) {
    const urgentReminders = generateFrequencyReminders(
      today,
      expiryDate,
      config.urgentFrequency,
      config.criticalPeriodDays,
      'URGENT_REMINDER',
      documentKind
    );
    reminders.push(...urgentReminders.map((r) => ({ ...r, userId, documentId })));
  }

  // 3. Schedule critical period reminders (most frequent)
  if (daysUntilExpiry <= config.criticalPeriodDays && daysUntilExpiry > 0) {
    const criticalReminders = generateFrequencyReminders(
      today,
      expiryDate,
      config.criticalFrequency,
      0,
      'CRITICAL_ALERT',
      documentKind
    );
    reminders.push(...criticalReminders.map((r) => ({ ...r, userId, documentId })));
  }

  // 4. Post-expiry notification
  if (daysUntilExpiry < 0) {
    reminders.push({
      userId,
      documentId,
      scheduledFor: new Date(),
      reminderType: 'EXPIRED_NOTICE',
      message: `URGENT: Your ${documentKind} has expired! Please renew immediately.`,
    });
  }

  // Batch insert all reminders
  if (reminders.length > 0) {
    await prisma.scheduledReminder.createMany({
      data: reminders,
    });
  }

  return reminders.length;
}

/**
 * Generate reminders at specified frequency
 */
function generateFrequencyReminders(
  startDate: Date,
  endDate: Date,
  frequency: ReminderFrequency,
  stopBeforeDays: number,
  reminderType: ReminderType,
  documentKind: DocumentKind
): Array<{
  scheduledFor: Date;
  reminderType: ReminderType;
  message: string;
}> {
  const reminders: Array<{
    scheduledFor: Date;
    reminderType: ReminderType;
    message: string;
  }> = [];

  const intervalDays = getIntervalDays(frequency);
  const stopDate = addDays(endDate, -stopBeforeDays);

  let currentDate = new Date(startDate);

  while (isBefore(currentDate, stopDate)) {
    const daysUntilExpiry = differenceInDays(endDate, currentDate);

    reminders.push({
      scheduledFor: new Date(currentDate),
      reminderType,
      message: `Your ${documentKind} expires in ${daysUntilExpiry} days (${endDate.toLocaleDateString()})`,
    });

    currentDate = addDays(currentDate, intervalDays);
  }

  return reminders;
}

/**
 * Convert frequency enum to days
 */
function getIntervalDays(frequency: ReminderFrequency): number {
  switch (frequency) {
    case 'DAILY':
      return 1;
    case 'WEEKLY':
      return 7;
    case 'BIWEEKLY':
      return 14;
    case 'MONTHLY':
      return 30;
    default:
      return 7;
  }
}

/**
 * Process due reminders (called by cron job)
 */
export async function processDueReminders() {
  const now = new Date();

  // Find all unsent reminders that are due
  const dueReminders = await prisma.scheduledReminder.findMany({
    where: {
      scheduledFor: { lte: now },
      sentAt: null,
    },
    take: 100, // Process in batches
  });

  console.log(`Processing ${dueReminders.length} due reminders`);

  for (const reminder of dueReminders) {
    try {
      await sendReminder(reminder);

      await prisma.scheduledReminder.update({
        where: { id: reminder.id },
        data: { sentAt: new Date() },
      });
    } catch (error) {
      console.error(`Failed to send reminder ${reminder.id}:`, error);
    }
  }

  return dueReminders.length;
}

/**
 * Send a reminder via configured channels
 */
async function sendReminder(reminder: {
  id: string;
  userId: string;
  documentId: string;
  message: string;
  reminderType: ReminderType;
}) {
  // Get user's notification preferences
  const user = await prisma.user.findUnique({
    where: { id: reminder.userId },
    include: {
      reminderConfigs: true,
    },
  });

  if (!user) {
    throw new Error(`User ${reminder.userId} not found`);
  }

  const config = user.reminderConfigs[0];

  // TODO: Integrate with actual notification services
  const notifications: Promise<void>[] = [];

  if (config?.emailEnabled) {
    notifications.push(sendEmailNotification(user.email, reminder.message));
  }

  if (config?.pushEnabled) {
    notifications.push(sendPushNotification(reminder.userId, reminder.message));
  }

  if (config?.smsEnabled) {
    notifications.push(sendSMSNotification(reminder.userId, reminder.message));
  }

  await Promise.allSettled(notifications);
}

// Placeholder notification functions
// TODO: Integrate with SendGrid, Twilio, Firebase, etc.

async function sendEmailNotification(email: string, message: string) {
  console.log(`[EMAIL] Sending to ${email}: ${message}`);
  // Implement email sending
}

async function sendPushNotification(userId: string, message: string) {
  console.log(`[PUSH] Sending to ${userId}: ${message}`);
  // Implement push notification
}

async function sendSMSNotification(userId: string, message: string) {
  console.log(`[SMS] Sending to ${userId}: ${message}`);
  // Implement SMS sending
}

/**
 * Get user's reminder configuration
 */
export async function getUserReminderConfig(userId: string, documentKind?: DocumentKind) {
  return prisma.reminderConfig.findFirst({
    where: {
      userId,
      OR: documentKind ? [{ documentKind }, { documentKind: null }] : [{ documentKind: null }],
    },
    orderBy: {
      documentKind: 'desc',
    },
  });
}

/**
 * Update or create reminder configuration
 */
export async function updateReminderConfig(
  userId: string,
  config: {
    documentKind?: DocumentKind;
    earlyReminderDays?: number[];
    urgentPeriodDays?: number;
    urgentFrequency?: ReminderFrequency;
    criticalPeriodDays?: number;
    criticalFrequency?: ReminderFrequency;
    emailEnabled?: boolean;
    pushEnabled?: boolean;
    smsEnabled?: boolean;
  }
) {
  const existing = await prisma.reminderConfig.findFirst({
    where: {
      userId,
      documentKind: config.documentKind ?? null,
    },
  });

  if (existing) {
    return prisma.reminderConfig.update({
      where: { id: existing.id },
      data: config,
    });
  }

  return prisma.reminderConfig.create({
    data: {
      userId,
      ...config,
    },
  });
}
