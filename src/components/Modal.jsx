'use client';
import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);
  if (!open) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-ink-900/50 backdrop-blur-sm" onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
           className={`w-full ${sizes[size]} bg-white dark:bg-ink-900 rounded-2xl shadow-2xl border border-ink-100 dark:border-ink-800`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100 dark:border-ink-800">
          <h3 className="font-semibold text-ink-900 dark:text-ink-100">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 grid place-items-center">
            <X className="w-4 h-4 text-ink-700 dark:text-ink-100"/>
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && (
          <div className="px-6 py-4 bg-ink-50 dark:bg-ink-950 rounded-b-2xl border-t border-ink-100 dark:border-ink-800 flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
