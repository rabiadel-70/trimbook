
# Noir & Blade — SaaS MVP Upgrade

Turn the current barber booking app into a polished, production-ready SaaS MVP for independent barbers. Keep the premium black & gold aesthetic. No payments / SMS / AI yet.

## 1. Database (one migration)

Extend existing tables; add new ones for per-barber services, working hours, and shop settings.

**`barbers`** — add columns: `phone text`, `shop_address text`, `specialties text[]`, `years_experience int`, `accepting_bookings boolean default true`. Keep RLS as-is (public read for active barbers).

**`services`** — currently global. Add `barber_id uuid` (nullable for legacy seed) so each barber owns their menu. New RLS: public can read services where `barber_id` belongs to an active barber; barbers can insert/update/delete their own.

**`working_hours`** (new) — `id, barber_id, day_of_week 0–6, start_time time, end_time time, is_closed bool`. Public read; barber-only write.

**`appointments`** — already exists with proper RLS. Add `updated_at` + trigger; ensure double-booking is prevented via a server-side check (exclusion would require btree_gist — instead enforce in booking server fn with a "no overlap" query inside a `SELECT … FOR UPDATE`-style guard using `range overlaps`).

**Storage bucket** `barber-avatars` (public read, barber-only write to own folder) for profile photos.

Seed: for the 3 demo barbers, insert default services (Haircut $35/30m, Beard Trim $20/20m, Haircut+Beard $50/50m, Hot Towel Shave $40/40m) and Tue–Sat 9–19 working hours.

## 2. Public website

- **Home (`/`)** — premium hero, "Meet Our Barbers" (live from DB), services preview, testimonials (static, 3 cards), pricing-for-barbers section ($0 trial / $19 Solo / $49 Shop, placeholder), CTAs to `/booking` (customers) and `/signup` (barbers), rich footer (contact, social, links).
- **Barber profile cards** — photo, name, specialties (badges), years exp, bio snippet, "Book Now" → `/booking?barber=<id>`.
- **`/booking`** — 5-step flow. Step 1 picks barber (or pre-filled from URL), step 2 service (filtered to that barber's services), step 3 date+time (slots generated from that barber's working hours minus existing non-cancelled appointments + past times disabled), step 4 customer info, step 5 confirm + success screen. Server fn `createBooking` re-checks overlap atomically and rejects if taken.
- **`/pricing`** — SaaS pricing page (barber-facing).

## 3. Auth + onboarding

- `/signup` page (email + password + name). Trigger already creates `barbers` row.
- `/login` keeps email/password.
- After signup, redirect to **`/onboarding`** — 4 steps: profile photo upload, bio + specialties + years, working hours, review & finish. Sets `accepting_bookings = true` at end.
- `_authenticated` layout gates dashboard + onboarding + settings + services. After login, if onboarding incomplete (no bio + no working hours), redirect to `/onboarding`.

## 4. Dashboard (`/dashboard`)

Rebuilt SaaS layout with sidebar nav (Dashboard / Appointments / Services / Settings / Logout) — collapses to top bar on mobile.

- **Overview**: stat cards (today's appts, week revenue, total bookings, pending count), today's list, upcoming list, weekly calendar grid.
- **Appointment actions**: confirm / complete / cancel / reschedule (reschedule = dialog with date+time picker, calls server fn that re-checks overlap).
- **Customers tab**: distinct customers derived from appointments with visit count + last visit.
- Colored status badges (pending=amber, confirmed=gold, completed=emerald, cancelled=muted strikethrough).
- Free-trial banner across top: "14 days left on your free trial" (placeholder, days from `barbers.created_at`).

## 5. Services management (`/dashboard/services`)

Table of barber's own services. Add/edit/delete dialogs with name, duration, price. Default examples seeded on first login if empty.

## 6. Settings (`/dashboard/settings`)

Tabs: **Profile** (name, bio, phone, shop address, specialties chips, years exp, photo upload), **Hours** (7-day editor with closed toggle + open/close times), **Availability** (accepting_bookings switch).

## 7. UX polish

- Sonner toasts on every mutation.
- Loading skeletons on dashboard cards + booking flow.
- Empty states (no appointments, no services).
- Zod validation everywhere; inline field errors.
- Framer-motion subtle fades on step transitions and card hovers.
- Mobile-first: sidebar → sheet, tables → cards, dashboard grid stacks.

## 8. Files

New: `src/routes/signup.tsx`, `src/routes/pricing.tsx`, `src/routes/_authenticated/onboarding.tsx`, `src/routes/_authenticated/dashboard.tsx` (rewritten), `src/routes/_authenticated/dashboard.appointments.tsx`, `src/routes/_authenticated/dashboard.services.tsx`, `src/routes/_authenticated/dashboard.customers.tsx`, `src/routes/_authenticated/dashboard.settings.tsx`, layout `src/routes/_authenticated/dashboard.tsx` with `<Outlet/>`, `src/components/BarberCard.tsx`, `src/components/Testimonials.tsx`, `src/components/PricingSection.tsx`, `src/components/SiteFooter.tsx`, `src/components/DashboardSidebar.tsx`, `src/components/TrialBanner.tsx`, `src/lib/booking.functions.ts` (server fns for createBooking, reschedule with overlap check), `src/lib/slots.ts` (slot generator).

Edited: `src/routes/index.tsx`, `src/routes/booking.tsx`, `src/routes/login.tsx`, `src/components/SiteHeader.tsx`, `src/styles.css`.

## Out of scope

Stripe, SMS, AI, multi-shop teams, customer accounts, reviews submission UI (testimonials are static).

## Technical notes

- Server fn `createBooking` uses `supabaseAdmin` to insert + atomically check no overlap on `(barber_id, [starts_at, ends_at))` for non-cancelled rows; returns conflict error if collision.
- Slot generator: for selected barber+date, compute working window, step by service duration (15-min grid), filter out slots overlapping any existing appointment.
- Avatar upload via Supabase Storage bucket `barber-avatars/<barber_id>/avatar.jpg`.
- Trial countdown: `14 - daysSince(barbers.created_at)`, clamps to 0.

Confirm and I'll build it.
