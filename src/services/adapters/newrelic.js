/**
 * NewRelic adapter for the monitoring service.
 *
 * Installation:
 *   Add the NewRelic Browser agent script to index.html <head>
 *   OR use: npm install @newrelic/browser-agent
 *
 * Usage in main.jsx:
 *   import { initNewRelic } from './services/adapters/newrelic';
 *   initNewRelic();
 *
 * Required env vars:
 *   VITE_NEWRELIC_ACCOUNT_ID
 *   VITE_NEWRELIC_APPLICATION_ID
 *   VITE_NEWRELIC_LICENSE_KEY
 */

import { registerMonitoringAdapter } from "../monitoring";

export function initNewRelic() {
  const accountId = import.meta.env.VITE_NEWRELIC_ACCOUNT_ID;
  const applicationId = import.meta.env.VITE_NEWRELIC_APPLICATION_ID;

  if (!accountId || !applicationId) return;

  // NewRelic Browser Agent exposes itself on window.newrelic when the script is loaded
  const nr = window.newrelic;
  if (!nr) return;

  registerMonitoringAdapter({
    name: "newrelic",
    captureException: (error, context) => {
      nr.noticeError(error, context?.extra);
    },
    captureMessage: (message, level, context) => {
      nr.addPageAction(message, { level, ...context?.extra });
    },
    setUser: (user) => {
      if (user) {
        nr.setCustomAttribute("userId", user.id);
        nr.setCustomAttribute("userRole", user.role);
      }
    },
    addBreadcrumb: (breadcrumb) => {
      nr.addPageAction(breadcrumb.message, {
        category: breadcrumb.category,
        ...breadcrumb.data,
      });
    },
    trackEvent: (name, data) => {
      nr.addPageAction(name, data);
    },
    flushLogs: (logs) => {
      logs.forEach((log) => {
        nr.addPageAction(`log:${log.level}`, {
          message: log.message,
          correlationId: log.correlationId,
          timestamp: log.timestamp,
        });
      });
    },
  });
}
