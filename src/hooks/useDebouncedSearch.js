import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Keeps a local search input in sync while debouncing the value sent to the server.
 * Clearing the field (empty string) updates immediately so results reset without waiting.
 */
export function useDebouncedSearch(updateFilters, delay = 400) {
  const [searchInput, setSearchInput] = useState('');
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const onSearchChange = useCallback(
    value => {
      const next = value ?? '';
      setSearchInput(next);
      clearTimeout(timerRef.current);
      if (!String(next).trim()) {
        updateFilters({ search: '' });
        return;
      }
      timerRef.current = setTimeout(() => {
        updateFilters({ search: String(next).trim() });
      }, delay);
    },
    [updateFilters, delay],
  );

  const resetSearch = useCallback(() => {
    clearTimeout(timerRef.current);
    setSearchInput('');
  }, []);

  return { searchInput, setSearchInput, onSearchChange, resetSearch };
}
