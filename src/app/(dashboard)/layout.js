'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { UIContext } from '@/components/ui-context';

/**
 * Dashboard shell.
 *
 * Owns the sidebar drawer state and hands it to TopBar via UIContext, so the
 * hamburger button can open the drawer from anywhere inside a page.
 *
 * The key responsive change is `lg:ml-64` on <main>. The old hard `ml-64`
 * applied at every width, which pushed all content off-screen on a phone.
 */
export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const t =
      typeof window !== 'undefined' && localStorage.getItem('peleka_access_token');
    if (!t) {
      router.replace('/login');
      return;
    }
    setReady(true);
  }, [router]);

  // Close the drawer on navigation. Without this, tapping a nav item leaves
  // the overlay sitting on top of the page you just opened.
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Stop the page scrolling behind the open drawer.
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  // Esc closes the drawer.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!ready) return null;

  return (
    <UIContext.Provider
      value={{
        sidebarOpen,
        openSidebar: () => setSidebarOpen(true),
        closeSidebar: () => setSidebarOpen(false),
      }}
    >
      <div className="min-h-screen">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Backdrop — below lg only */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-ink-900/50 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        <main className="min-h-screen lg:ml-64">{children}</main>
      </div>
    </UIContext.Provider>
  );
}
