/**
 * Datadog adapter for the monitoring service.
 *
 * Installation:
 *   npm install @datadog/browser-rum @datadog/browser-logs
 *
 * Usage in main.jsx:
 *   import { initDatadog } from './services/adapters/datadog';
 *   initDatadog();
 *
 * Required env vars:
 *   VITE_DATADOG_CLIENT_TOKEN
 *   VITE_DATADOG_APPLICATION_ID
 *   VITE_DATADOG_SITE (default: datadoghq.com)
 */

import { registerMonitoringAdapter } from "../monitoring";

export function initDatadog() {
  const clientToken = import.meta.env.VITE_DATADOG_CLIENT_TOKEN;
  const applicationId = import.meta.env.VITE_DATADOG_APPLICATION_ID;

  if (!clientToken || !applicationId) return;

  const site = import.meta.env.VITE_DATADOG_SITE || "datadoghq.com";
  const env = import.meta.env.VITE_APP_ENV || "production";
  const service = "meralot-merchants-admin";

  Promise.all([import("@datadog/browser-rum"), import("@datadog/browser-logs")])
    .then(([{ datadogRum }, { datadogLogs }]) => {
      datadogRum.init({
        applicationId,
        clientToken,
        site,
        service,
        env,
        sessionSampleRate: 100,
        sessionReplaySampleRate: 10,
        trackUserInteractions: true,
        trackResources: true,
        trackLongTasks: true,
        defaultPrivacyLevel: "mask-user-input",
      });

      datadogLogs.init({
        clientToken,
        site,
        service,
        env,
        forwardErrorsToLogs: true,
        sessionSampleRate: 100,
      });

      registerMonitoringAdapter({
        name: "datadog",
        captureException: (error, context) => {
          datadogRum.addError(error, context?.extra);
        },
        captureMessage: (message, level, context) => {
          datadogLogs.logger[level]?.(message, context?.extra);
        },
        setUser: (user) => {
          if (user) {
            datadogRum.setUser({
              id: user.id,
              email: user.email,
              name: user.role,
            });
          } else {
            datadogRum.clearUser();
          }
        },
        addBreadcrumb: (breadcrumb) => {
          datadogRum.addAction(breadcrumb.message, {
            category: breadcrumb.category,
            ...breadcrumb.data,
          });
        },
        trackEvent: (name, data) => {
          datadogRum.addAction(name, data);
        },
        flushLogs: (logs) => {
          logs.forEach((log) => {
            const level = log.level?.toLowerCase() || "info";
            datadogLogs.logger[level]?.(log.message, log);
          });
        },
      });
    })
    .catch(() => {
      // Datadog not installed — skip silently
    });
}
