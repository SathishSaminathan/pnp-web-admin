import { useEffect, useRef, useCallback } from 'react';

const IDLE_EVENTS = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll', 'click'];

/**
 * Listens for user activity and calls `onTimeout` when idle for `timeoutMinutes`.
 * Set `enabled` to false to disable entirely (e.g. when logged out).
 */
const useIdleTimeout = ({ enabled, timeoutMinutes, onTimeout }) => {
    const timerRef   = useRef(null);
    const callbackRef = useRef(onTimeout);
    callbackRef.current = onTimeout;

    const resetTimer = useCallback(() => {
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(
            () => callbackRef.current?.(),
            timeoutMinutes * 60 * 1000
        );
    }, [timeoutMinutes]);

    useEffect(() => {
        if (!enabled) {
            clearTimeout(timerRef.current);
            return;
        }

        resetTimer();
        IDLE_EVENTS.forEach(ev => window.addEventListener(ev, resetTimer, { passive: true }));

        return () => {
            clearTimeout(timerRef.current);
            IDLE_EVENTS.forEach(ev => window.removeEventListener(ev, resetTimer));
        };
    }, [enabled, resetTimer]);
};

export default useIdleTimeout;
