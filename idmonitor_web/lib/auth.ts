/**
 * Authentication Utilities
 * Helpers for user auth, role checking, and audit logging
 */

import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from './db';
import { AuditAction } from '@prisma/client';

/**
 * Get authenticated user or throw
 */
export async function requireAuth() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  return userId;
}

/**
 * Get or create user in our database
 * Links Clerk user to our User model
 */
export async function getOrCreateUser() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    throw new Error('Unauthorized');
  }

  const email = clerkUser.emailAddresses[0]?.emailAddress;

  if (!email) {
    throw new Error('No email found for user');
  }

  // Find or create user
  let user = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        email,
      },
    });

    // Log user creation
    await logAudit({
      userId: user.id,
      action: 'USER_SIGNUP',
      resource: `User:${user.id}`,
    });
  }

  return user;
}

/**
 * Log audit event for security compliance
 */
export async function logAudit(params: {
  userId: string;
  action: AuditAction;
  resource: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        resource: params.resource,
        metadata: params.metadata as any,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
    // Don't throw - audit logging failures shouldn't break functionality
  }
}

/**
 * Check if user has premium subscription
 */
export async function hasPremiumAccess(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionTier: true, subscriptionStatus: true },
  });

  if (!user) return false;

  return (
    (user.subscriptionTier === 'PREMIUM' || user.subscriptionTier === 'FAMILY') &&
    user.subscriptionStatus === 'active'
  );
}

/**
 * Rate limiting check
 * TODO: Integrate with Redis for distributed rate limiting
 */
export async function checkRateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 60000
): Promise<boolean> {
  try {
    const windowStart = new Date(Date.now() - windowMs);

    const record = await prisma.rateLimit.findUnique({
      where: { identifier },
    });

    if (!record) {
      await prisma.rateLimit.create({
        data: { identifier, requestCount: 1 },
      });
      return true;
    }

    if (record.windowStart < windowStart) {
      // Reset window
      await prisma.rateLimit.update({
        where: { identifier },
        data: { requestCount: 1, windowStart: new Date() },
      });
      return true;
    }

    if (record.requestCount >= limit) {
      return false;
    }

    await prisma.rateLimit.update({
      where: { identifier },
      data: { requestCount: { increment: 1 } },
    });

    return true;
  } catch (error) {
    console.error('Rate limit check failed:', error);
    return true; // Fail open
  }
}
