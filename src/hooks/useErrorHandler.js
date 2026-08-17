import { useState, useCallback } from "react";

/**
 * Hook to propagate async errors to the nearest error boundary.
 *
 * React error boundaries only catch errors during rendering.
 * This hook re-throws async errors (from API calls, event handlers, etc.)
 * inside a setState updater, which triggers the boundary.
 *
 * Usage:
 *   const throwError = useErrorHandler();
 *
 *   const handleSubmit = async () => {
 *     try {
 *       await apiCall();
 *     } catch (error) {
 *       throwError(error);
 *     }
 *   };
 */
export const useErrorHandler = () => {
  const [, setError] = useState();

  return useCallback((error) => {
    setError(() => {
      throw error instanceof Error ? error : new Error(String(error));
    });
  }, []);
};

export default useErrorHandler;
