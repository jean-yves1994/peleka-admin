'use client';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, pageSize, total, onChange }) {
  const totalPages = Math.max(1, Math.ceil((total || 0) / (pageSize || 20)));
  const disablePrev = page <= 1;
  const disableNext = page >= totalPages;
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-ink-100 dark:border-ink-800">
      <div className="text-xs text-ink-500 dark:text-ink-400">
        Showing <span className="font-medium text-ink-800 dark:text-ink-100">{Math.min((page - 1) * pageSize + 1, total)}</span>–
        <span className="font-medium text-ink-800 dark:text-ink-100">{Math.min(page * pageSize, total)}</span> of{' '}
        <span className="font-medium text-ink-800 dark:text-ink-100">{total}</span>
      </div>
      <div className="flex items-center gap-2">
        <button disabled={disablePrev} onClick={() => onChange(page - 1)}
          className={`w-8 h-8 rounded-lg grid place-items-center border border-ink-200 dark:border-ink-800 ${disablePrev ? 'opacity-40' : 'hover:bg-ink-100 dark:hover:bg-ink-800'}`}>
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm text-ink-700 dark:text-ink-100">{page} / {totalPages}</span>
        <button disabled={disableNext} onClick={() => onChange(page + 1)}
          className={`w-8 h-8 rounded-lg grid place-items-center border border-ink-200 dark:border-ink-800 ${disableNext ? 'opacity-40' : 'hover:bg-ink-100 dark:hover:bg-ink-800'}`}>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
