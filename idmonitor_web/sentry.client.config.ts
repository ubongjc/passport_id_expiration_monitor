import * as Sentry from '@sentry/nextjs';

/**
 * Sentry Client-Side Configuration
 * Monitors errors and performance in the browser
 */

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Capture 100% of errors
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Integrations
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true, // Mask all text for privacy
      blockAllMedia: true, // Block all media for privacy
    }),
  ],

  // Environment
  environment: process.env.NODE_ENV,

  // Release tracking
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,

  // Privacy: Don't send PII
  beforeSend(event, hint) {
    // Remove any potentially sensitive data
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers;
    }

    // Don't log encryption-related errors with sensitive data
    if (event.message?.includes('encryption') || event.message?.includes('decrypt')) {
      return null; // Drop the event
    }

    return event;
  },

  // Performance monitoring
  profilesSampleRate: 1.0,

  // Ignore certain errors
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
  ],
});
