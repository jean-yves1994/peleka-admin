'use client';

/**
 * Illustration slides for the login card's right panel.
 *
 * Built as inline SVG rather than raster images so they stay crisp at any
 * size, inherit brand colour, and add no asset weight.
 *
 * Each scene sits on an organic "blob" backdrop, mirroring the reference
 * design where the artwork floats on a soft colour shape.
 *
 * Purely decorative — hidden from assistive tech.
 */

const BLOB_PATH =
  'M148 22 C196 6 262 14 292 52 C322 90 318 150 296 190 C274 230 234 254 190 258 C146 262 98 246 66 214 C34 182 18 132 30 90 C42 48 100 38 148 22 Z';

function Blob({ className = '' }) {
  return (
    <path
      d={BLOB_PATH}
      className={className}
      transform="translate(-6 -4)"
    />
  );
}

/** Slide 1 — courier on a motorcycle, matching the Peleka logo mark. */
function SceneCourier() {
  return (
    <svg viewBox="0 0 340 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
      <Blob className="fill-brand-200 dark:fill-brand-500/25" />

      {/* Speed lines */}
      <g className="stroke-brand-500/50 dark:stroke-brand-300/40" strokeWidth="4" strokeLinecap="round">
        <line x1="40" y1="150" x2="72" y2="150" />
        <line x1="28" y1="166" x2="66" y2="166" />
        <line x1="42" y1="182" x2="70" y2="182" />
      </g>

      <g transform="translate(84 78)">
        {/* Cargo box — orange, as on the logo */}
        <rect x="0" y="36" width="52" height="42" rx="6" fill="#FF8508" />
        <rect x="22" y="36" width="8" height="42" fill="#08295D" fillOpacity="0.3" />
        <rect x="0" y="52" width="52" height="7" fill="#08295D" fillOpacity="0.3" />

        {/* Rider */}
        <circle cx="112" cy="30" r="19" className="fill-white dark:fill-ink-100" />
        <path d="M96 30 A 16 16 0 0 1 128 30 Z" fill="#0789D1" />
        <path
          d="M70 84 C 74 60, 86 46, 104 44 L 120 44 C 130 46, 136 54, 138 62 L 146 76"
          className="stroke-brand-700 dark:stroke-brand-300"
          strokeWidth="15"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M124 60 L 152 74"
          className="stroke-brand-700 dark:stroke-brand-300"
          strokeWidth="11"
          strokeLinecap="round"
        />
        <path
          d="M86 86 L 96 104 L 118 104"
          className="stroke-brand-700 dark:stroke-brand-300"
          strokeWidth="11"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Frame */}
        <path
          d="M40 118 L 74 118 L 96 96 L 132 96 L 152 78"
          fill="none"
          className="stroke-[#08295D] dark:stroke-white"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M144 74 L 166 70"
          className="stroke-[#08295D] dark:stroke-white"
          strokeWidth="7"
          strokeLinecap="round"
        />

        {/* Wheels */}
        <circle cx="36" cy="122" r="26" className="stroke-[#08295D] fill-white dark:stroke-white dark:fill-ink-800" strokeWidth="7" />
        <circle cx="36" cy="122" r="8" className="fill-[#08295D] dark:fill-white" />
        <circle cx="152" cy="122" r="26" className="stroke-[#08295D] fill-white dark:stroke-white dark:fill-ink-800" strokeWidth="7" />
        <circle cx="152" cy="122" r="8" className="fill-[#08295D] dark:fill-white" />
      </g>
    </svg>
  );
}

/** Slide 2 — live tracking on a map. */
function SceneTracking() {
  return (
    <svg viewBox="0 0 340 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
      <Blob className="fill-sky-200 dark:fill-sky-500/20" />

      {/* Phone */}
      <g transform="translate(104 46)">
        <rect x="0" y="0" width="132" height="196" rx="20" className="fill-[#08295D] dark:fill-ink-800" />
        <rect x="8" y="8" width="116" height="180" rx="14" className="fill-white dark:fill-ink-900" />

        {/* Map grid */}
        <g className="stroke-ink-200 dark:stroke-ink-700" strokeWidth="2">
          <line x1="8" y1="56" x2="124" y2="56" />
          <line x1="8" y1="104" x2="124" y2="104" />
          <line x1="8" y1="152" x2="124" y2="152" />
          <line x1="44" y1="8" x2="44" y2="188" />
          <line x1="88" y1="8" x2="88" y2="188" />
        </g>

        {/* Route */}
        <path
          d="M30 160 C 46 132, 60 128, 74 106 C 88 84, 84 62, 100 44"
          fill="none"
          className="stroke-brand-600 dark:stroke-brand-400"
          strokeWidth="4"
          strokeDasharray="6 7"
          strokeLinecap="round"
        />

        {/* Origin */}
        <circle cx="30" cy="160" r="9" className="fill-brand-600 dark:fill-brand-400" />
        <circle cx="30" cy="160" r="3.5" fill="white" />

        {/* Destination pin */}
        <g transform="translate(100 44)">
          <path
            d="M0 -14 C 7 -14, 13 -8, 13 -1 C 13 8, 0 18, 0 18 C 0 18, -13 8, -13 -1 C -13 -8, -7 -14, 0 -14 Z"
            fill="#FF8508"
          />
          <circle cy="-1" r="4.5" fill="white" />
        </g>
      </g>

      {/* Floating status chip */}
      <g transform="translate(196 150)">
        <rect x="0" y="0" width="104" height="34" rx="17" className="fill-white dark:fill-ink-800" />
        <circle cx="20" cy="17" r="6" fill="#10b981" />
        <rect x="34" y="11" width="52" height="5" rx="2.5" className="fill-ink-300 dark:fill-ink-600" />
        <rect x="34" y="21" width="34" height="5" rx="2.5" className="fill-ink-200 dark:fill-ink-700" />
      </g>
    </svg>
  );
}

/** Slide 3 — Mobile Money payment. */
function ScenePayment() {
  return (
    <svg viewBox="0 0 340 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
      <Blob className="fill-orange-200 dark:fill-orange-500/20" />

      {/* Card back */}
      <g transform="translate(64 92)">
        <rect x="0" y="0" width="186" height="112" rx="16" className="fill-[#08295D] dark:fill-ink-800" />
        <rect x="0" y="24" width="186" height="20" className="fill-black/20" />
        <rect x="18" y="62" width="60" height="8" rx="4" className="fill-white/40" />
        <rect x="18" y="80" width="38" height="8" rx="4" className="fill-white/25" />
        <circle cx="150" cy="80" r="16" fill="#FF8508" />
        <circle cx="168" cy="80" r="16" className="fill-white/70" />
      </g>

      {/* Floating coins */}
      <g transform="translate(212 48)">
        <circle r="26" fill="#FF8508" />
        <circle r="26" className="fill-white/20" />
        <text
          x="0"
          y="7"
          textAnchor="middle"
          className="fill-white"
          style={{ font: '700 15px system-ui, sans-serif' }}
        >
          RWF
        </text>
      </g>

      {/* Confirmation tick */}
      <g transform="translate(72 56)">
        <circle r="22" fill="#10b981" />
        <path
          d="M-9 1 L -3 7 L 10 -7"
          fill="none"
          stroke="white"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

export const SLIDES = [
  {
    id: 'courier',
    Scene: SceneCourier,
    caption: 'Dispatch riders across Kigali and\ntrack every parcel in real time',
  },
  {
    id: 'tracking',
    Scene: SceneTracking,
    caption: 'Follow each delivery live, from\npickup through to the doorstep',
  },
  {
    id: 'payment',
    Scene: ScenePayment,
    caption: 'Mobile Money payments in RWF,\nconfirmed before dispatch',
  },
];

export default function CourierScene({ index = 0 }) {
  const { Scene } = SLIDES[index % SLIDES.length];
  return (
    <div className="h-full w-full" aria-hidden="true">
      <Scene />
    </div>
  );
}
