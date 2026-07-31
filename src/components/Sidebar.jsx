'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Package, Users, UserCircle, MapPin, DollarSign,
  AlertCircle, BarChart3, Bell, Settings, Truck, LogOut, X,
} from 'lucide-react';
import { clearTokens } from '@/lib/api';

const NAV = [
  { section: 'Overview',   items: [{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }] },
  { section: 'Operations', items: [
    { href: '/shipments',       label: 'Shipments', icon: Package },
    { href: '/riders',          label: 'Riders',    icon: Users },
    { href: '/riders/live-map', label: 'Live map',  icon: MapPin },
    { href: '/customers',       label: 'Customers', icon: UserCircle },
  ] },
  { section: 'Business',   items: [
    { href: '/pricing',    label: 'Pricing',    icon: DollarSign },
    { href: '/complaints', label: 'Complaints', icon: AlertCircle },
    { href: '/reports',    label: 'Reports',    icon: BarChart3 },
  ] },
  { section: 'Account',    items: [
    { href: '/notifications', label: 'Notifications', icon: Bell },
    { href: '/profile',       label: 'Profile',       icon: Settings },
  ] },
];

/**
 * Off-canvas drawer below `lg`, permanently docked from `lg` up.
 *
 * The previous version was `fixed w-64` at every breakpoint, so on a phone it
 * covered most of the screen with no way to dismiss it.
 */
export default function Sidebar({ open = false, onClose = () => {} }) {
  const pathname = usePathname();
  const router = useRouter();
  const signOut = () => { clearTokens(); router.replace('/login'); };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-ink-100 bg-white
                  transition-transform duration-200 ease-out dark:border-ink-800 dark:bg-ink-900
                  lg:translate-x-0
                  ${open ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <div className="flex items-center gap-3 px-6 py-5">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-500 text-white shadow-pop">
          <Truck className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-base font-semibold leading-none text-ink-900 dark:text-ink-100">
            Peleka
          </div>
          <div className="mt-0.5 text-[11px] text-ink-500 dark:text-ink-400">
            Kigali · Admin console
          </div>
        </div>

        {/* Close button — drawer only, hidden once the sidebar docks */}
        <button
          onClick={onClose}
          aria-label="Close menu"
          className="grid h-9 w-9 place-items-center rounded-lg text-ink-500 hover:bg-ink-100 lg:hidden dark:hover:bg-ink-800"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {NAV.map((group) => (
          <div key={group.section} className="mb-6">
            <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-ink-400 dark:text-ink-500">
              {group.section}
            </div>
            {group.items.map(({ href, label, icon: Icon }) => {
              const active =
                pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className={`group mb-0.5 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition
                    ${active
                      ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-pop'
                      : 'text-ink-700 hover:bg-ink-100 dark:text-ink-100 dark:hover:bg-ink-800'}`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 ${
                      active
                        ? 'text-white'
                        : 'text-ink-500 group-hover:text-brand-600 dark:text-ink-400 dark:group-hover:text-brand-400'
                    }`}
                  />
                  <span className="truncate">{label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="px-3 pb-4">
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-ink-700 transition hover:bg-rose-50 hover:text-rose-700 dark:text-ink-100 dark:hover:bg-rose-900/30 dark:hover:text-rose-300"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </aside>
  );
}
