import "./globals.css";

export const metadata = {
  title: "Peleka Admin — Kigali",
  description: "Peleka Courier — Admin Dashboard for Kigali City",
};

// Runs before React hydrates to avoid flash-of-wrong-theme
const themeInitScript = `
(function () {
  try {
    var saved = localStorage.getItem('peleka_theme');
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var isDark = saved ? saved === 'dark' : prefersDark;
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  } catch (e) {}
})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
