export default function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="card p-12 text-center">
      {Icon && (
        <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300 grid place-items-center mb-4">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h3 className="text-base font-semibold text-ink-900 dark:text-ink-100">{title}</h3>
      {subtitle && <p className="mt-1 text-sm text-ink-500 dark:text-ink-400 max-w-sm mx-auto">{subtitle}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
