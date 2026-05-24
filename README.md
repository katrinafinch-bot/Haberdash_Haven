# Haberdash Haven

> **Stitch. Match. Thrive.**
> The app that knows your supplies.

Haberdash Haven is a mobile-first productivity app for quilters, embroiderers, and sewists. Manage your full sewing room inventory — threads, fabric, rulers, machines, patterns, dies, and the oddball notions in between — in one place that actually understands how you work.

---

## What it does

### Inventory
- **Thread library** — 390+ Isacord 40 colors plus your own brands and custom entries
- **Fabric stash** — by yardage, weight, fiber, and color
- **Ruler library** — 190+ rulers across every quilting, piecing, and pattern-drafting category
- **Machine library** — 77 machines with model details and your personal photos
- **Patterns, feet, dies, AccuQuilt** — everything else that lives in your sewing room
- **Misc. supplies** — a flexible bucket for vintage notions, oddball tools, anything that doesn't fit a category

### Smart features
- **Thread Match Engine** — find what you have that matches a target color
- **Camera Color Match** — point your phone at a fabric, get thread suggestions
- **Barcode Scanner** — built-in BarcodeDetector for fast adds
- **Auto-Sync Library** — public reference data updates without overwriting your stash
- **Stash Deduction** — log a project, watch your inventory adjust
- **Phrase Search** — full-text filter across brand, color, code, notes, and tags

### Project management
- Project list with photos, journal, costs, and per-project fabric/thread allocation
- Shopping list that builds itself from low-stock items and project gaps
- Insurance report builder for stash valuation

### Community (Premium)
- Forum with posts, comments, follows, and voting
- Share projects, ask questions, compare techniques

---

## Tech stack

- **Frontend:** React 18 + Vite
- **Backend:** Supabase (Postgres + Auth + Storage + RLS)
- **Mobile wrapper:** Capacitor (in planning)
- **Billing:** RevenueCat (mobile), Stripe (web)
- **Hosting:** Vercel

### Brand
Black · Deep teal (`#004D4D`) · Silver

---

## Project status

In active development. Public launch targeted for August. iOS App Store and Google Play Store submissions in planning.

---

## Setup (developers)

```bash
npm install
npm run dev
```

Environment variables required in `.env`:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## Admin

Standalone admin panel: `haberdash-haven-admin.html` — no build process, opens in a browser. Admin access controlled via `profiles.is_admin = true` in Supabase.

---

## License

Proprietary. All rights reserved.
