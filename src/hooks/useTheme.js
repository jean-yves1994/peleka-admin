'use client';
import { useEffect, useState, useCallback } from 'react';

/**
 * useTheme — light/dark toggle persisted in localStorage.
 * Reads the initial value from <html class="dark"> set by the no-flash script.
 */
export function useTheme() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  }, []);

  const apply = useCallback((next) => {
    const root = document.documentElement;
    if (next === 'dark') root.classList.add('dark'); else root.classList.remove('dark');
    localStorage.setItem('peleka_theme', next);
    setTheme(next);
  }, []);

  const toggle = useCallback(() => apply(theme === 'dark' ? 'light' : 'dark'), [theme, apply]);
  return { theme, toggle, setTheme: apply };
}
