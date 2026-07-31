export default function StatCard({ label, value, sub, icon: Icon, tone = 'brand', trend }) {
  const tones = {
    brand:   { bg: 'bg-brand-50 dark:bg-brand-900/30',     fg: 'text-brand-700 dark:text-brand-300' },
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/30', fg: 'text-emerald-700 dark:text-emerald-300' },
    amber:   { bg: 'bg-amber-50 dark:bg-amber-900/30',     fg: 'text-amber-700 dark:text-amber-300' },
    rose:    { bg: 'bg-rose-50 dark:bg-rose-900/30',       fg: 'text-rose-700 dark:text-rose-300' },
    sky:     { bg: 'bg-sky-50 dark:bg-sky-900/30',         fg: 'text-sky-700 dark:text-sky-300' },
    slate:   { bg: 'bg-slate-100 dark:bg-slate-800',       fg: 'text-slate-700 dark:text-slate-300' },
  };
  const t = tones[tone] || tones.brand;

  return (
    <div className="card p-4 sm:p-5">
      {/*
        The old layout was a single flex row: text left, 44px icon pinned right.
        On a narrow card that left the label ~60px, so it wrapped onto two lines
        and collided with the icon. Now the icon sits ABOVE the text on mobile
        and moves back beside it from `sm` up, where there's room.
      */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="order-2 min-w-0 sm:order-1">
          <div className="text-[11px] font-medium uppercase leading-tight tracking-wider text-ink-500 sm:text-xs dark:text-ink-400">
            {label}
          </div>
          <div className="mt-1.5 truncate text-xl font-semibold text-ink-900 sm:mt-2 sm:text-2xl dark:text-ink-100">
            {value}
          </div>
          {sub && (
            <div className="mt-1 text-[11px] leading-snug text-ink-500 sm:text-xs dark:text-ink-400">
              {sub}
            </div>
          )}
          {trend !== undefined && (
            <div className={`mt-2 text-xs font-medium ${Number(trend) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {Number(trend) >= 0 ? '▲' : '▼'} {Math.abs(Number(trend))}%
            </div>
          )}
        </div>

        {Icon && (
          <div className={`order-1 grid h-9 w-9 shrink-0 place-items-center rounded-xl sm:order-2 sm:h-11 sm:w-11 ${t.bg} ${t.fg}`}>
            <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        )}
      </div>
    </div>
  );
}
