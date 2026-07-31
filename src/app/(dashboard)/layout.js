'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { UIContext } from '@/components/ui-context';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const t = typeof window !== 'undefined' && localStorage.getItem('peleka_access_token');
    if (!t) { router.replace('/login'); return; }
    setReady(true);
  }, [router]);

  // Close the drawer on navigation. Without this, tapping a nav item on a
  // phone leaves the overlay sitting on top of the page you just opened.
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  // Stop the page scrolling behind the open drawer.
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  // Esc closes the drawer.
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setSidebarOpen(false); };
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

        {/* Backdrop — mobile/tablet only */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-ink-900/50 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* `lg:ml-64` instead of a hard `ml-64` — that margin was pushing all
            content off-screen on phones. */}
        <main className="min-h-screen lg:ml-64">{children}</main>
      </div>
    </UIContext.Provider>
  );
}
