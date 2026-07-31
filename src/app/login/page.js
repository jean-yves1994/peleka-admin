"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Sun, Moon } from "lucide-react";
import PelekaLogo from "@/components/PelekaLogo";
import CourierScene, { SLIDES } from "@/components/CourierScene";
import { api, setTokens, saveUser } from "@/lib/api";
import { useTheme } from "@/hooks/useTheme";

/**
 * Admin login — centred card on a tinted page.
 *
 * Layout follows the reference: one floating white card, form on the left,
 * an inset illustration panel on the right with a rotating caption carousel.
 * Below `lg` the illustration panel is dropped and the form fills the card.
 *
 * The login route sits outside the (dashboard) group, so it has no sidebar
 * and carries its own theme toggle.
 */
export default function LoginPage() {
  const router = useRouter();
  const { theme, toggle } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [slide, setSlide] = useState(0);

  // Auto-advance the carousel; pauses while the tab is hidden.
  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  const submit = useCallback(
    async (e) => {
      e.preventDefault();
      setErr("");
      setLoading(true);
      try {
        const r = await api.post("/api/auth/login", { email, password });
        const role = r.data.user.role;
        if (role !== "admin" && role !== "dispatcher") {
          throw new Error(
            "This dashboard is for admin and dispatcher accounts only.",
          );
        }
        setTokens(r.data);
        saveUser(r.data.user);
        router.replace("/dashboard");
      } catch (e) {
        setErr(e.message || "Could not sign you in. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [email, password, router],
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#EEF2F7] p-4 sm:p-6 lg:p-10 dark:bg-ink-950">
      {/* Theme toggle floats outside the card */}
      <button
        onClick={toggle}
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        className="fixed right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-xl border border-ink-200 bg-white transition hover:bg-ink-50 sm:right-6 sm:top-6 dark:border-ink-800 dark:bg-ink-900 dark:hover:bg-ink-800"
      >
        {theme === "dark" ? (
          <Sun className="h-4 w-4 text-amber-400" />
        ) : (
          <Moon className="h-4 w-4 text-ink-700" />
        )}
      </button>

      {/* The card */}
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-[0_20px_60px_-15px_rgba(15,23,42,0.15)] dark:bg-ink-900 dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)]">
        <div className="grid gap-0 p-6 sm:p-8 lg:grid-cols-2 lg:gap-10 lg:p-10">
          {/* ───────── Left: form ───────── */}
          <div className="flex flex-col justify-center px-0 py-4 sm:px-6 lg:px-8 lg:py-10">
            <div className="mx-auto w-full max-w-sm">
              {/* Logo, centred as in the reference */}
              <div className="flex justify-center">
                <PelekaLogo size={92} />
              </div>

              <h1 className="mt-8 text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl dark:text-ink-100">
                Login
              </h1>
              <p className="mt-1.5 text-sm text-ink-500 dark:text-ink-400">
                Please sign in to continue
              </p>

              <form onSubmit={submit} className="mt-7 space-y-3.5">
                {/* Placeholder-only fields, matching the reference */}
                <div>
                  <label htmlFor="email" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-ink-100 bg-ink-50/70 px-4 py-3.5 text-sm text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20 dark:border-ink-700 dark:bg-ink-800/60 dark:text-ink-100 dark:placeholder:text-ink-500 dark:focus:bg-ink-800"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="sr-only">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-ink-100 bg-ink-50/70 px-4 py-3.5 pr-12 text-sm text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20 dark:border-ink-700 dark:bg-ink-800/60 dark:text-ink-100 dark:placeholder:text-ink-500 dark:focus:bg-ink-800"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-2.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-ink-400 transition hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-ink-700 dark:hover:text-ink-100"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Right-aligned, directly under the field */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-xs text-ink-500 transition hover:text-brand-700 dark:text-ink-400 dark:hover:text-brand-400"
                  >
                    Forgot Password ?
                  </button>
                </div>

                {err && (
                  <div
                    role="alert"
                    className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-900/25 dark:text-rose-300"
                  >
                    {err}
                  </div>
                )}

                {/* Dark purple primary action */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-brand-700 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-700/25 transition hover:bg-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:shadow-brand-900/40 dark:focus:ring-offset-ink-900"
                >
                  {loading ? "Signing in…" : "Login"}
                </button>
              </form>

              <p className="mt-4 text-center text-[11px] text-ink-500 dark:text-ink-500">
                Dashboard for admin & dispatcher accounts only.
              </p>
            </div>
          </div>

          {/* ───────── Right: inset illustration panel (lg+) ───────── */}
          <div className="hidden lg:block">
            <div className="flex h-full flex-col items-center justify-center rounded-2xl bg-[#F4F7FB] px-8 py-10 dark:bg-ink-950/60">
              <div className="h-64 w-full max-w-sm">
                <CourierScene index={slide} />
              </div>

              <p className="mt-6 max-w-xs whitespace-pre-line text-center text-sm leading-relaxed text-ink-600 dark:text-ink-300">
                {SLIDES[slide].caption}
              </p>

              {/* Carousel dots */}
              <div className="mt-5 flex items-center gap-2">
                {SLIDES.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => setSlide(i)}
                    aria-label={`Show slide ${i + 1}`}
                    aria-current={i === slide}
                    className={`h-2 rounded-full transition-all ${
                      i === slide
                        ? "w-6 bg-brand-700 dark:bg-brand-400"
                        : "w-2 bg-ink-300 hover:bg-ink-400 dark:bg-ink-700 dark:hover:bg-ink-600"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
