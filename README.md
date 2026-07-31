# 🖥️ Peleka Admin — Dashboard (v1.1 · Kigali edition)

A production-quality admin dashboard for the **Peleka Courier** platform, tailored for **Kigali City**, with:

- 🌙 **Dark mode** — persisted preference, no-flash init, theme toggle in top bar + Appearance tab in profile
- ✋ **Reason-driven suspend modal** — the tailwind dialog replaces the old browser prompt with a categorised reason picker + audit-log note
- 🇷🇼 **Kigali defaults** — currency RWF, live map centered on Kigali city center (`-1.9441, 30.0619`), route override defaults for Kigali → Musanze / Huye / Rubavu / Rusizi
- 📚 **Pricing section explained** — see the bottom of this document

Design inspired by the [School Management System dashboard by Udit Mahajan on Dribbble](https://dribbble.com/shots/24704045-School-Management-System-Admin-s-Dashboard) — clean cards, KPI tiles, bar charts, violet accents. Adapted for a courier operation with dark-mode support built in from the ground up.

---

## ✨ What's new in v1.1

| Change | Where | Details |
| ------ | ----- | ------- |
| 🌙 Dark mode | Everywhere | Tailwind `darkMode: 'class'`, no-flash init script, `useTheme()` hook, toggle in `TopBar` + Appearance tab in `Profile` |
| ✋ Suspend modal | `/riders` | 7 preset reasons (documents_expired, complaints, no_show, unprofessional, policy_violation, inactive, other) + optional notes; full reason is sent to the audit log & rider notification |
| 🇷🇼 Kigali defaults | Live map + Pricing | Map centered on Kigali, currency defaults to RWF, route override examples updated to Rwandan cities |
| 🎨 Google Maps dark theme | `/riders/live-map` | Map style automatically switches to dark when the theme is dark |
| 📖 Pricing help banners | `/pricing` | Each tab now shows a one-line explanation of what it does |

---

## 🚀 Quick start

```bash
# 1. Install
npm install

# 2. Configure environment
cp .env.example .env.local
# Fill in:
#   NEXT_PUBLIC_API_URL=http://localhost:3000
#   NEXT_PUBLIC_GOOGLE_MAPS_KEY=your_maps_js_key  (optional)
#   NEXT_PUBLIC_CITY_NAME=Kigali
#   NEXT_PUBLIC_CITY_LAT=-1.9441
#   NEXT_PUBLIC_CITY_LNG=30.0619

# 3. Run
npm run dev            # http://localhost:3001
```

The admin app runs on **port 3001** so it can sit alongside the backend on port 3000.

Sign in with the seeded admin (default `admin@peleka.local` / `ChangeMe!123`).

---

## 🌙 Dark mode — how it works

1. **No-flash init** — a tiny inline `<script>` in the root `<head>` reads `localStorage.peleka_theme` before React hydrates and adds the `dark` class to `<html>`.
2. **`useTheme()`** — returns `{ theme, toggle, setTheme }`. State persists in `localStorage` and is also honored by `prefers-color-scheme` on first visit.
3. **Toggle** — the sun/moon icon lives in the top bar. Profile → *Appearance* also has explicit Light/Dark radio cards.
4. **Charts** — Recharts axes/tooltips read the current theme via `useTheme()`.
5. **Google Maps** — the map switches between a light and a dark stylesheet when the theme changes.

---

## ✋ The new "Suspend rider" modal

Replaces `window.prompt('Reason?')` with an accessible tailwind dialog that:

- Shows a red **AlertTriangle** banner explaining the consequences
- Shows the rider you're about to suspend (avatar + name + email/phone + delivery count + current status badge)
- Requires you to pick **one of 7 preset reason categories** (radio cards)
- Lets you (optionally) add free-form notes for the audit log
- Requires notes when *"Other"* is selected
- Submits `{ reason: "<Category label> — <notes>" }` to `POST /api/admin/riders/:id/suspend`
- Shows a loading state on the submit button and per-field errors

The full reason string ends up in three places on the backend:

- `audit_logs.data.reason` (searchable forever)
- The FCM push notification body sent to the rider's phone
- `PATCH /api/admin/riders/:id/suspend` request body (for any future audit tooling)

---

## 🇷🇼 Kigali defaults

| Where | Old | New |
| ----- | --- | --- |
| Live map center | Nairobi CBD (`-1.286, 36.817`) | Kigali city center (`-1.9441, 30.0619`) |
| Default currency | `USD` | `RWF` (Rwandan Franc, no decimals) |
| Route override example | Nairobi → Nakuru | Kigali → Musanze / Huye / Rubavu / Rusizi |
| Pricing config seed | `2.5 USD` base fare | `500 RWF` base fare + `200 RWF/km` + `50 RWF/kg` |
| Tax | 10% | 18% (VAT in Rwanda) |
| Rider vehicle plate placeholder | `KMDA 000X` | `RAA 000 A` (Rwandan format) |
| Phone placeholder | `+2547...` | `+2507...` (Rwanda country code) |

You can override any of these in `.env.local` via `NEXT_PUBLIC_CITY_*` variables. The API still stores whatever currency the config specifies — so mixed-currency setups keep working.

---

## 📚 The Pricing section — full explanation

The Pricing page has **three tabs**, each solving a different real-world need:

### 1. Pricing configs — the "how much does a delivery cost?" formula

This is the **default price engine**. A pricing config defines a single formula that the backend uses to calculate the price of every shipment (unless a route override kicks in — see tab 3).

At any moment there is **exactly one active config**. You can save multiple configs (for testing new price structures, seasonal pricing, etc.) and switch between them with the "Activate" button. Historical shipments keep the price they were quoted at.

**The formula:**

```
subtotal        = base_fare
                + max(0, distance_km − free_km) × price_per_km
                + parcel_weight_kg × price_per_kg
                + duration_minutes × price_per_minute
subtotal       *= surge_multiplier
subtotal        = clamp(subtotal, min_price, max_price)

after_discount  = max(0, subtotal − discount_amount)   ← discount code (tab 2) applied here
tax_amount      = after_discount × tax_percentage / 100
total_price     = after_discount + tax_amount          ← what the customer pays
rider_earnings  = after_discount × rider_commission_percentage / 100
```

**Field-by-field:**

| Field | Meaning | Kigali example |
| ----- | ------- | -------------- |
| `base_fare` | Fixed fee per shipment | `500 RWF` — pays for basic dispatch overhead |
| `price_per_km` | Distance-based fee | `200 RWF` — a 10 km delivery costs 2,000 RWF in distance |
| `price_per_kg` | Weight-based fee | `50 RWF` — a 2 kg parcel adds 100 RWF |
| `price_per_minute` | Time-based fee (Uber-style) | `0` — set > 0 if you want to price for traffic |
| `free_km` | Distance not billed | `0` — set to `2` to give the first 2 km free |
| `min_price` | Floor price | `1,000 RWF` — nothing costs less than this |
| `max_price` | Ceiling price (optional) | `10,000 RWF` — cap on runaway estimates |
| `surge_multiplier` | Peak-time multiplier | `1.5` during rush hour, `1.0` off-peak |
| `tax_percentage` | VAT | `18` for Rwanda's 18% VAT |
| `rider_commission_percentage` | Rider's cut of pre-tax subtotal | `70` → rider gets 70%, platform keeps 30% |

**Worked example — Kigali city center → Kimironko, 3 kg parcel, ~ 6 km:**

```
distance_fee     = 6 × 200          = 1,200
weight_fee       = 3 × 50           =   150
base_fare        =                    500
────────────────────────────────────────────
raw              =                  1,850
× surge (1.0)                       1,850
max(min_price)                      1,850   (above 1,000 floor)
after discount                      1,850   (no code)
tax (18%)                          +  333
════════════════════════════════════════════
total_price                         2,183 RWF
rider_earnings   = 1,850 × 0.70   = 1,295 RWF
```

The customer sees **2,183 RWF** at checkout. The rider earns **1,295 RWF** on completion. The platform keeps **555 RWF** (30% of 1,850) plus the 333 RWF tax passes through to Rwanda Revenue.

### 2. Discount codes — promotions

Marketing codes customers enter at checkout. Two flavors:

| Type | Example | Effect |
| ---- | ------- | ------ |
| **Percent** | `MURAHO10` (10% off) | Cuts subtotal by 10% |
| **Fixed** | `SAVE1000` (1,000 RWF off) | Subtracts 1,000 RWF from subtotal |

Each code can have:

- **Description** — internal note (e.g. "Muraho launch offer, valid July 2026")
- **Max uses** — hard cap on total redemptions (leave blank for unlimited)
- **Active flag** — toggle without deleting (preserves usage stats)

Codes are applied **before tax** in the formula above. This matters for revenue reporting: your VAT is calculated on the discounted amount, not the sticker price.

**Typical use cases:**

- `MURAHO10` — 10% off first delivery for new customers
- `SIMBA500` — 500 RWF flat off for a specific corporate account
- `IRAMBIRWA` — Off-peak promo tied to a specific hour window (not enforced by the backend today, but the code makes it easy to segment reporting)

### 3. Route overrides — flat prices for specific city pairs

Sometimes the distance-based formula doesn't fit a real business route. Two common cases in Rwanda:

1. **Intercity fixed rates** — Kigali → Musanze is a well-known ~108 km route that everybody knows costs, say, 4,500 RWF. You don't want the formula to charge `108 × 200 = 21,600 RWF`. A route override says: *"if pickup city is Kigali and delivery city is Musanze, ignore the formula and charge 4,500 RWF flat."*
2. **Partner deals** — you might negotiate a corridor rate with a hotel chain or a hospital network.

**How it works:**

- When a customer creates a shipment, the backend checks: *"is there an active route override for this pickup_city → delivery_city pair?"*
- If yes → uses `flat_price`, skips base/distance/weight/time fees
- Discounts and tax still apply on top of the flat price
- If no → falls through to the standard pricing config formula

**Suggested Kigali corridors:**

| Route | Distance | Suggested flat price |
| ----- | -------- | -------------------- |
| Kigali → Musanze | ~108 km | 4,500 RWF |
| Kigali → Huye (Butare) | ~135 km | 5,500 RWF |
| Kigali → Rubavu (Gisenyi) | ~155 km | 6,500 RWF |
| Kigali → Rusizi (Cyangugu) | ~215 km | 8,500 RWF |

The `origin_city` / `destination_city` match is case-insensitive on the backend, so "Kigali", "kigali", and "KIGALI" are all recognized as the same city.

### Which tab do I use when?

| Need | Tab |
| ---- | --- |
| Change your default per-km rate | **Pricing configs** |
| Increase prices at rush hour | **Pricing configs** (bump `surge_multiplier`, then activate) |
| Give VIP customers a discount code | **Discount codes** |
| Run a one-month promo | **Discount codes** (create then deactivate after a month) |
| Charge a fixed price for a specific corridor | **Route overrides** |
| Test new prices without affecting live orders | **Pricing configs** — save with `is_active: false`, activate later |

---

## 📁 Project layout

```
peleka-admin/
├── package.json, next.config.js, tailwind.config.js, postcss.config.js, jsconfig.json
├── .env.example
├── README.md
└── src/
    ├── app/
    │   ├── layout.js               # Root layout + no-flash theme init script
    │   ├── globals.css             # Tailwind + design tokens + dark variants
    │   ├── page.js                 # Redirects to /dashboard or /login
    │   ├── login/page.js           # Split-panel login
    │   └── (dashboard)/
    │       ├── layout.js           # Auth guard + Sidebar
    │       ├── dashboard/page.js
    │       ├── shipments/page.js
    │       ├── shipments/[id]/page.js
    │       ├── riders/page.js      # ← Has the new suspend modal
    │       ├── riders/live-map/page.js  # ← Kigali-centered
    │       ├── customers/page.js
    │       ├── pricing/page.js     # ← 3 tabs + help banners
    │       ├── complaints/page.js
    │       ├── reports/page.js
    │       ├── profile/page.js     # ← Now has Appearance tab
    │       └── notifications/page.js
    ├── components/
    │   ├── Sidebar.jsx             # Left nav with gradient active pill
    │   ├── TopBar.jsx              # Search, theme toggle, bell, avatar
    │   ├── StatCard.jsx            # KPI card with tone-tinted icon
    │   ├── Badge.jsx               # ShipmentBadge / RiderBadge / Chip
    │   ├── Modal.jsx               # Accessible dialog with backdrop
    │   ├── EmptyState.jsx
    │   ├── Pagination.jsx
    │   └── charts/
    │       ├── RevenueBarChart.jsx  # Theme-aware
    │       └── StatusPieChart.jsx   # Theme-aware
    ├── hooks/
    │   └── useTheme.js             # Read/write theme + persist
    └── lib/
        ├── api.js                  # Fetch wrapper + auto refresh + retry
        ├── format.js               # money(RWF-aware) / dates / CITY export
        └── constants.js            # Status → color mappings (light + dark)
```

---

## 🛡️ Production checklist

- [ ] Set `NEXT_PUBLIC_API_URL` to your production backend URL
- [ ] Set `NEXT_PUBLIC_GOOGLE_MAPS_KEY` (add HTTP referer restrictions)
- [ ] Confirm `NEXT_PUBLIC_CITY_*` values match your live service area
- [ ] Enable HTTPS everywhere; restrict backend CORS to your dashboard origin
- [ ] Consider migrating tokens from `localStorage` → `httpOnly` cookies to reduce XSS blast radius
- [ ] Deploy behind CloudFront / Vercel / your platform of choice
- [ ] Enable Sentry / LogRocket for error tracking

---

## 🧾 License

Copyright © Peleka. All rights reserved.
