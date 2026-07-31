'use client';
import { ChevronRight } from 'lucide-react';

/**
 * One data set, two layouts.
 *
 *   >= md  -> normal table
 *   <  md  -> stacked cards
 *
 * A 7-column shipments table can't be made to fit a 390px phone. Horizontal
 * scrolling technically "works" but you can't scan it, and the row you need is
 * always off-screen. Cards keep every field readable.
 *
 * columns: [{
 *   key, label, render: (row) => JSX,
 *   primary: bool,       // card heading on mobile
 *   secondary: bool,     // under the heading, unlabelled
 *   align: 'right',
 *   hideOnMobile: bool,  // keep low-value columns off the card
 *   className,           // extra <td> classes (desktop)
 * }]
 */
export default function DataTable({
  columns = [],
  rows = [],
  keyField = 'id',
  onRowClick,
  empty = null,
  footer = null,
  mobileCard,
}) {
  if (!rows.length && empty) return empty;

  const primary = columns.find((c) => c.primary) ?? columns[0];
  const secondary = columns.filter((c) => c.secondary);
  const rest = columns.filter((c) => !c.primary && !c.secondary && !c.hideOnMobile);

  return (
    <>
      {/* ---- Desktop ---- */}
      <div className="hidden overflow-x-auto md:block">
        <table className="table w-full">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key} className={c.align === 'right' ? 'text-right' : ''}>
                  {c.label}
                </th>
              ))}
              {onRowClick && <th className="w-8" />}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row[keyField]}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={onRowClick ? 'cursor-pointer' : ''}
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={`${c.align === 'right' ? 'text-right' : ''} ${c.className ?? ''}`}
                  >
                    {c.render ? c.render(row) : row[c.key]}
                  </td>
                ))}
                {onRowClick && (
                  <td className="text-right">
                    <ChevronRight className="inline h-4 w-4 text-ink-400" />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---- Mobile ---- */}
      <div className="divide-y divide-ink-100 md:hidden dark:divide-ink-800">
        {rows.map((row) => {
          if (mobileCard) {
            return <div key={row[keyField]} className="p-4">{mobileCard(row)}</div>;
          }
          return (
            <div
              key={row[keyField]}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={`p-4 ${onRowClick ? 'cursor-pointer active:bg-ink-50 dark:active:bg-ink-800/60' : ''}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-ink-900 dark:text-ink-100">
                    {primary?.render ? primary.render(row) : row[primary?.key]}
                  </div>
                  {secondary.map((c) => (
                    <div key={c.key} className="mt-0.5 text-xs text-ink-500 dark:text-ink-400">
                      {c.render ? c.render(row) : row[c.key]}
                    </div>
                  ))}
                </div>
                {onRowClick && <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" />}
              </div>

              {rest.length > 0 && (
                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
                  {rest.map((c) => (
                    <div key={c.key} className="min-w-0">
                      <dt className="text-[10px] font-medium uppercase tracking-wider text-ink-400 dark:text-ink-500">
                        {c.label}
                      </dt>
                      <dd className="mt-0.5 truncate text-xs text-ink-800 dark:text-ink-100">
                        {c.render ? c.render(row) : (row[c.key] ?? '—')}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          );
        })}
      </div>

      {footer}
    </>
  );
}

/** Filter bar that stacks on mobile instead of squashing controls into a row. */
export function FilterBar({ children }) {
  return (
    <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:flex-wrap sm:items-end">
      {children}
    </div>
  );
}
