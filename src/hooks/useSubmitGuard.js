import { useCallback, useRef, useState } from "react";

/**
 * Hook to prevent double/rapid form submissions.
 *
 * Usage:
 *   const { execute, isSubmitting } = useSubmitGuard();
 *   const handleSubmit = () => execute(async () => { ... });
 *
 * Features:
 * - Blocks concurrent submissions
 * - Auto-resets after completion/failure
 * - Configurable cooldown period
 */
export function useSubmitGuard(cooldownMs = 1000) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const lastSubmitRef = useRef(0);

  const execute = useCallback(
    async (fn) => {
      const now = Date.now();
      if (isSubmitting || now - lastSubmitRef.current < cooldownMs) {
        return;
      }

      setIsSubmitting(true);
      lastSubmitRef.current = now;

      try {
        const result = await fn();
        return result;
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, cooldownMs],
  );

  return { execute, isSubmitting };
}

export default useSubmitGuard;
