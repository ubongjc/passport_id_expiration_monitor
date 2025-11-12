import * as Sentry from '@sentry/nextjs';

/**
 * Sentry Edge Runtime Configuration
 * Monitors middleware and edge functions
 */

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  environment: process.env.NODE_ENV,

  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,

  beforeSend(event, hint) {
    // Remove sensitive headers
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
    }

    return event;
  },
});
