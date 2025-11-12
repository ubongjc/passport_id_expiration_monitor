/**
 * Reminder Configuration API
 * GET /api/reminders/config - Get user's reminder settings
 * POST /api/reminders/config - Update reminder settings
 *
 * Allows users to fully customize:
 * - Early reminder timing (e.g., 1 year, 6 months, 3 months before)
 * - Urgent period frequency (e.g., weekly in last 30 days)
 * - Critical period frequency (e.g., daily in last 7 days)
 * - Notification channels (email, push, SMS)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateUser, logAudit } from '@/lib/auth';
import { updateReminderConfig, getUserReminderConfig } from '@/lib/reminders';
import { z } from 'zod';
import { DocumentKind, ReminderFrequency } from '@prisma/client';

const reminderConfigSchema = z.object({
  documentKind: z.enum(['PASSPORT', 'NATIONAL_ID', 'DRIVERS_LICENSE', 'RESIDENCE_PERMIT', 'VISA']).optional(),

  // Early reminders (days before expiry)
  earlyReminderDays: z.array(z.number().positive()).optional(),

  // Urgent period (e.g., last 30 days)
  urgentPeriodDays: z.number().positive().optional(),
  urgentFrequency: z.enum(['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY']).optional(),

  // Critical period (e.g., last 7 days)
  criticalPeriodDays: z.number().positive().optional(),
  criticalFrequency: z.enum(['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY']).optional(),

  // Notification channels
  emailEnabled: z.boolean().optional(),
  pushEnabled: z.boolean().optional(),
  smsEnabled: z.boolean().optional(),
});

/**
 * GET /api/reminders/config
 * Get reminder configuration
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getOrCreateUser();
    const { searchParams } = new URL(req.url);
    const documentKind = searchParams.get('documentKind') as DocumentKind | null;

    const config = await getUserReminderConfig(user.id, documentKind ?? undefined);

    if (!config) {
      // Return default config
      return NextResponse.json({
        config: {
          documentKind: null,
          earlyReminderDays: [365, 180, 90],
          urgentPeriodDays: 30,
          urgentFrequency: 'WEEKLY',
          criticalPeriodDays: 7,
          criticalFrequency: 'DAILY',
          emailEnabled: true,
          pushEnabled: true,
          smsEnabled: false,
        },
      });
    }

    return NextResponse.json({ config });

  } catch (error) {
    console.error('Failed to get reminder config:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reminders/config
 * Update reminder configuration
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getOrCreateUser();
    const body = await req.json();
    const data = reminderConfigSchema.parse(body);

    // Validate that critical period is shorter than urgent period
    if (data.criticalPeriodDays && data.urgentPeriodDays) {
      if (data.criticalPeriodDays >= data.urgentPeriodDays) {
        return NextResponse.json(
          { error: 'Critical period must be shorter than urgent period' },
          { status: 400 }
        );
      }
    }

    // Update configuration
    const config = await updateReminderConfig(user.id, {
      documentKind: data.documentKind as DocumentKind | undefined,
      earlyReminderDays: data.earlyReminderDays,
      urgentPeriodDays: data.urgentPeriodDays,
      urgentFrequency: data.urgentFrequency as ReminderFrequency | undefined,
      criticalPeriodDays: data.criticalPeriodDays,
      criticalFrequency: data.criticalFrequency as ReminderFrequency | undefined,
      emailEnabled: data.emailEnabled,
      pushEnabled: data.pushEnabled,
      smsEnabled: data.smsEnabled,
    });

    // Log configuration change
    await logAudit({
      userId: user.id,
      action: 'REMINDER_CONFIGURED',
      resource: `ReminderConfig:${config.id}`,
      metadata: data,
    });

    return NextResponse.json({ config });

  } catch (error) {
    console.error('Failed to update reminder config:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
