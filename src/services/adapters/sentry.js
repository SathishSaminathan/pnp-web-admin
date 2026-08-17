/**
 * Sentry adapter for the monitoring service.
 *
 * Installation:
 *   npm install @sentry/react
 *
 * Usage in main.jsx:
 *   import { initSentry } from './services/adapters/sentry';
 *   initSentry();
 *
 * This file is a template — uncomment and configure when Sentry is added.
 */

import { registerMonitoringAdapter } from "../monitoring";

export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return;

  // Dynamic import to avoid bundling Sentry when not configured
  import("@sentry/react")
    .then((Sentry) => {
      Sentry.init({
        dsn,
        environment: import.meta.env.VITE_APP_ENV || "production",
        tracesSampleRate:
          Number(import.meta.env.VITE_SENTRY_TRACES_RATE) || 0.1,
        replaysSessionSampleRate: 0,
        replaysOnErrorSampleRate: 1.0,
        integrations: [Sentry.browserTracingIntegration()],
        beforeSend(event) {
          // Scrub sensitive data from breadcrumbs
          if (event.breadcrumbs) {
            event.breadcrumbs = event.breadcrumbs.map((bc) => {
              if (bc.data?.url) {
                // Remove query params that might contain tokens
                try {
                  const url = new URL(bc.data.url);
                  url.searchParams.delete("token");
                  url.searchParams.delete("key");
                  bc.data.url = url.toString();
                } catch {
                  // Not a valid URL, leave as-is
                }
              }
              return bc;
            });
          }
          return event;
        },
      });

      // Register as monitoring adapter
      registerMonitoringAdapter({
        name: "sentry",
        captureException: (error, context) =>
          Sentry.captureException(error, context),
        captureMessage: (message, level, context) =>
          Sentry.captureMessage(message, { level, ...context }),
        setUser: (user) => Sentry.setUser(user),
        addBreadcrumb: (breadcrumb) => Sentry.addBreadcrumb(breadcrumb),
        trackEvent: (name, data) =>
          Sentry.captureMessage(name, { level: "info", extra: data }),
        flushLogs: () => {
          /* Sentry handles its own flushing */
        },
      });
    })
    .catch(() => {
      // Sentry not installed — skip silently
    });
}
