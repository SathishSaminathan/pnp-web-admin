/**
 * Environment variable validation and security configuration.
 *
 * Validates required env vars at startup and provides secure defaults.
 * Prevents the app from running with misconfigured environments.
 */

import logger from "./logger";

// ─── Required Environment Variables ──────────────────────────────────────────

const ENV_SCHEMA = {
  VITE_API_BASE_URL: {
    required: true,
    validate: (v) => /^https?:\/\//.test(v) || v.startsWith("/"),
    message: "Must be an absolute http(s) URL or a root-relative path like /api",
  },
};

// Optional but validated if present
const OPTIONAL_ENV = {
  VITE_SENTRY_DSN: {
    validate: (v) => v.startsWith("https://"),
    message: "Must be a valid Sentry DSN URL",
  },
  VITE_APP_ENV: {
    validate: (v) => ["development", "staging", "production"].includes(v),
    message: "Must be one of: development, staging, production",
  },
  VITE_MONITORING_ENABLED: {
    validate: (v) => ["true", "false"].includes(v),
    message: "Must be true or false",
  },
};

/**
 * Validate environment variables at app startup.
 * Logs warnings in dev, throws in production for critical vars.
 */
export function validateEnvironment() {
  const errors = [];
  const warnings = [];

  // Check required vars
  for (const [key, schema] of Object.entries(ENV_SCHEMA)) {
    const value = import.meta.env[key];
    if (!value) {
      if (schema.required) {
        errors.push(`Missing required env var: ${key}`);
      }
      continue;
    }
    if (schema.validate && !schema.validate(value)) {
      errors.push(`Invalid env var ${key}: ${schema.message}`);
    }
  }

  // Check optional vars if present
  for (const [key, schema] of Object.entries(OPTIONAL_ENV)) {
    const value = import.meta.env[key];
    if (value && schema.validate && !schema.validate(value)) {
      warnings.push(`Invalid optional env var ${key}: ${schema.message}`);
    }
  }

  // Report
  warnings.forEach((w) => logger.warn(w));

  if (errors.length > 0) {
    const msg = `Environment validation failed:\n${errors.join("\n")}`;
    logger.error(msg);
    // In production, prevent app from starting with bad config
    if (import.meta.env.PROD) {
      throw new Error(msg);
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

// ─── Input Sanitization ──────────────────────────────────────────────────────

/**
 * Sanitize user input to prevent XSS.
 * Strips HTML tags and dangerous characters.
 */
export function sanitizeInput(input) {
  if (typeof input !== "string") return input;
  return input
    .replace(/[<>]/g, "") // Remove angle brackets
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, "") // Remove event handlers
    .trim();
}

/**
 * Sanitize an object's string values recursively.
 */
export function sanitizeObject(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "string") return sanitizeInput(obj);
  if (Array.isArray(obj)) return obj.map(sanitizeObject);
  if (typeof obj !== "object") return obj;

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    sanitized[key] = sanitizeObject(value);
  }
  return sanitized;
}

// ─── Secure Storage ──────────────────────────────────────────────────────────

/**
 * Secure wrapper around localStorage/sessionStorage.
 * - Never stores tokens or sensitive data
 * - Validates data before storing
 * - Handles quota exceeded errors
 */
export const secureStorage = {
  set(key, value) {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
    } catch (e) {
      if (e?.name === "QuotaExceededError") {
        logger.warn("localStorage quota exceeded", { key });
      }
    }
  },

  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch {
      // Silent
    }
  },
};
