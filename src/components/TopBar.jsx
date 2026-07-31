"use client";
import { Search, Bell, Sun, Moon, Menu } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getSavedUser } from "@/lib/api";
import { useTheme } from "@/hooks/useTheme";
import { useUI } from "@/components/ui-context";
import GlobalSearch from "@/components/GlobalSearch";

/**
 * Responsive top bar.
 *
 * MOBILE (< lg)
 *   The sticky bar holds controls only: hamburger, search, theme, profile.
 *   Title, subtitle and page actions render BELOW it, full width.
 *
 *   Why: the subtitle carries a status badge ("Pending Payment · Created 18h
 *   ago"). Inside the header it sat in a `truncate` container competing with
 *   four icons, so the badge was clipped off entirely. Below the bar it has
 *   the full width and can wrap, so nothing is lost. It also scrolls away
 *   while the controls stay pinned.
 *
 * DESKTOP (lg+)
 *   Unchanged — title, subtitle and actions all sit inline in the bar.
 */
export default function TopBar({ title, subtitle, actions }) {
  const [user, setUser] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const { openSidebar } = useUI();

  useEffect(() => {
    setUser(getSavedUser());
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const initials = (user?.full_name || "A")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-ink-100 bg-ink-50/80 backdrop-blur dark:border-ink-800 dark:bg-ink-950/80">
        <div className="flex items-center gap-2 px-4 py-3 sm:gap-4 sm:px-6 lg:gap-6 lg:px-8 lg:py-4">
          {/* Hamburger — disappears once the sidebar docks at lg */}
          <button
            onClick={openSidebar}
            aria-label="Open menu"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-ink-200 bg-white text-ink-700 hover:bg-ink-50 lg:hidden dark:border-ink-800 dark:bg-ink-900 dark:text-ink-100 dark:hover:bg-ink-800"
          >
            <Menu className="h-4 w-4" />
          </button>

          {/* Title in the bar — lg and up only */}
          <div className="hidden min-w-0 flex-1 lg:block">
            {title && (
              <h1 className="truncate text-xl font-semibold leading-tight text-ink-900 dark:text-ink-100">
                {title}
              </h1>
            )}
            {subtitle && (
              <div className="mt-0.5 truncate text-sm text-ink-500 dark:text-ink-400">
                {subtitle}
              </div>
            )}
          </div>

          {/* Below lg the title lives outside the bar, so this just pushes
              the controls to the right edge. */}
          <div className="flex-1 lg:hidden" />

          {/* Full search field — md and up */}
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden h-10 w-72 max-w-xs items-center rounded-xl border border-ink-200 bg-white px-3 text-left transition hover:bg-ink-50 md:flex dark:border-ink-800 dark:bg-ink-900 dark:hover:bg-ink-800"
          >
            <Search className="h-4 w-4 text-ink-400" />
            <span className="flex-1 px-2 text-sm text-ink-400">
              Search shipments, riders…
            </span>
            <span className="kbd">⌘K</span>
          </button>

          {/* Search icon — below md */}
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-ink-200 bg-white hover:bg-ink-50 md:hidden dark:border-ink-800 dark:bg-ink-900 dark:hover:bg-ink-800"
          >
            <Search className="h-4 w-4 text-ink-700 dark:text-ink-100" />
          </button>

          <button
            onClick={toggle}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-ink-200 bg-white transition hover:bg-ink-50 dark:border-ink-800 dark:bg-ink-900 dark:hover:bg-ink-800"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-ink-700" />
            )}
          </button>

          <Link
            href="/notifications"
            aria-label="Notifications"
            className="relative hidden h-10 w-10 shrink-0 place-items-center rounded-xl border border-ink-200 bg-white hover:bg-ink-50 sm:grid dark:border-ink-800 dark:bg-ink-900 dark:hover:bg-ink-800"
          >
            <Bell className="h-4 w-4 text-ink-700 dark:text-ink-100" />
            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-rose-500 dark:border-ink-950" />
          </Link>

          <Link
            href="/profile"
            className="flex shrink-0 items-center gap-3 rounded-xl border border-ink-200 bg-white py-1.5 pl-2 pr-2 hover:bg-ink-50 lg:pr-4 dark:border-ink-800 dark:bg-ink-900 dark:hover:bg-ink-800"
          >
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-600 to-brand-500 text-xs font-semibold text-white">
              {initials}
            </div>
            <div className="hidden lg:block">
              <div className="text-sm font-medium leading-none text-ink-900 dark:text-ink-100">
                {user?.full_name || "Admin"}
              </div>
              <div className="mt-0.5 text-[11px] capitalize text-ink-500 dark:text-ink-400">
                {user?.role || "admin"}
              </div>
            </div>
          </Link>

          {/* Page actions — inline on desktop only */}
          {actions && (
            <div className="hidden shrink-0 items-center gap-2 lg:flex">
              {actions}
            </div>
          )}
        </div>
      </header>

      {/*
        Mobile title block. Sits outside the sticky header so it scrolls away
        with the page, and crucially has NO `truncate` — the status badge and
        "Created 18h ago" wrap onto a second line instead of being cut off.
      */}
      {(title || subtitle || actions) && (
        <div className="px-4 pt-4 sm:px-6 lg:hidden">
          {title && (
            <h1 className="break-words text-lg font-semibold leading-snug text-ink-900 dark:text-ink-100">
              {title}
            </h1>
          )}
          {subtitle && (
            <div className="mt-1.5 text-xs leading-relaxed text-ink-500 dark:text-ink-400">
              {subtitle}
            </div>
          )}
          {actions && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}

      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
