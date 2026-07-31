'use client';
import { createContext, useContext } from 'react';

/**
 * Shared UI state for the dashboard shell.
 *
 * TopBar is rendered deep inside each page, but the sidebar drawer state lives
 * in the dashboard layout. This context lets the hamburger button open the
 * drawer without prop-drilling `openSidebar` through every page component.
 *
 * The defaults are no-ops so that a component rendered outside the provider
 * (e.g. in a test) doesn't crash — it just does nothing.
 */
export const UIContext = createContext({
  sidebarOpen: false,
  openSidebar: () => {},
  closeSidebar: () => {},
});

export const useUI = () => useContext(UIContext);
