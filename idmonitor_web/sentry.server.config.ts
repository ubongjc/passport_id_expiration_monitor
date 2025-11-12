import * as Sentry from '@sentry/nextjs';

/**
 * Sentry Server-Side Configuration
 * Monitors API errors and server-side issues
 */

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Adjust sampling in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Environment
  environment: process.env.NODE_ENV,

  // Release tracking
  release: process.env.VERCEL_GIT_COMMIT_SHA,

  // Privacy: Never log sensitive data
  beforeSend(event, hint) {
    // Remove potentially sensitive headers
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
      delete event.request.headers['x-clerk-auth-token'];
    }

    // Never log database queries with sensitive data
    if (event.message?.toLowerCase().includes('prisma')) {
      // Redact SQL queries
      if (event.extra) {
        delete event.extra.query;
        delete event.extra.params;
      }
    }

    // Drop encryption-related errors (contain sensitive data)
    if (event.message?.includes('encryption') || event.message?.includes('decrypt')) {
      return null;
    }

    return event;
  },

  // Server-specific integrations
  integrations: [
    // Add custom integrations here
  ],

  // Performance monitoring
  profilesSampleRate: 1.0,

  // Ignore certain errors
  ignoreErrors: [
    'ECONNRESET',
    'ETIMEDOUT',
  ],
});
