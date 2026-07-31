'use client';
import { useEffect, useState } from 'react';

/**
 * Debounce a rapidly-changing value.
 * Used by the global search to avoid hammering the backend on every keystroke.
 */
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
