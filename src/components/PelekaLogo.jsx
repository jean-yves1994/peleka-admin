'use client';
import Image from 'next/image';

/**
 * Peleka brand mark.
 *
 * The artwork is navy (#08295D) with orange accents, which disappears against
 * a dark background. Rather than shipping a second white variant or inverting
 * it (which would kill the orange), the mark sits on a white chip in dark mode
 * only — legible in both themes, and it reads as deliberate.
 *
 * Save the supplied artwork to:  public/peleka-logo.png
 */
export default function PelekaLogo({ size = 92, className = '' }) {
  return (
    <span
      className={`inline-grid place-items-center rounded-2xl transition-colors dark:bg-white dark:p-3 dark:shadow-lg dark:ring-1 dark:ring-white/10 ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src="/peleka-logo.png"
        alt="Peleka — your order, we deliver"
        width={size * 2}
        height={size * 2}
        priority
        className="h-full w-full object-contain"
      />
    </span>
  );
}
