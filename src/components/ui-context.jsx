'use client';
import { createContext, useContext } from 'react';

/**
 * Shared UI state for the dashboard shell.
 *
 * TopBar is rendered deep inside each page, but the sidebar drawer state lives
 * in the dashboard layout. This context lets the hamburger button open the
 * drawer without prop-drilling `openSidebar` through every page component.
 *
 * Defaults are no-ops so a component rendered outside the provider doesn't
 * crash — it just does nothing.
 */
export const UIContext = createContext({
  sidebarOpen: false,
  openSidebar: () => {},
  closeSidebar: () => {},
});

export const useUI = () => useContext(UIContext);
