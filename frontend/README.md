# StayEase — Frontend

React + TypeScript frontend for the StayEase hotel reservation platform. Talks to the [StayEase backend](../backend/README.md) via a REST API.

**Live App:** https://guvi-stayease-hotel-reservation-pla.vercel.app

> Note: the backend is hosted on Render's free tier, which sleeps after 15 minutes of inactivity. The first request after a period of inactivity can take up to a couple of minutes while it wakes up — the app shows a "please stay on this page" message during long waits rather than appearing frozen.

---

## Tech Stack

- **Framework:** React 19 + TypeScript, built with Vite
- **Styling:** Tailwind CSS v4
- **State:** Redux Toolkit
- **Routing:** React Router
- **HTTP:** Axios
- **Deployment:** Vercel

## Features by Role

**Public (no login required)**
- Browse and search hotels with filters (city, price range, minimum rating, amenities, date/guest availability)
- View hotel details, rooms, and guest reviews
- Register / log in / forgot & reset password

**Customer**
- Book a room, complete a simulated payment
- View booking history, cancel upcoming bookings
- Leave a review after a confirmed stay
- View personal dashboard (bookings, spend)
- View/edit profile

**Hotel Manager**
- Create and edit hotel listings
- Create and edit room types
- View bookings for owned properties
- View manager dashboard (hotels, rooms, bookings, revenue)

**Admin**
- View platform-wide dashboard (users by role, hotels, bookings, revenue, reviews)

---

## Running Locally

### Prerequisites
- Node.js 18+
- The [backend](../backend/README.md) running locally or the live Render URL

### Setup

1. Clone the repo and navigate to `frontend/`
2. Install dependencies:
```bash
npm install
```
3. Create `frontend/.env` (gitignored, never committed):
```
VITE_API_BASE_URL=http://localhost:8080
```
Or point it at the live backend instead:
```
VITE_API_BASE_URL=https://stayease-backend-gbsv.onrender.com
```
4. Run the dev server:
```bash
npm run dev
```
5. App available at `http://localhost:5173`

### Building for production

```bash
npm run build
```
Outputs a static build to `dist/`.

---

## Project Structure

```
src/
├── api/            → Axios client + one file per resource (auth, hotels, rooms, bookings, payments, reviews, dashboard, users)
├── app/            → Redux store setup and typed hooks
├── features/       → Redux slices (authSlice)
├── components/     → Shared UI (Navbar, Footer, HotelCard, ReviewCarousel, ProtectedRoute, BackToTop)
├── pages/
│   ├── public/     → Home, hotel detail, login, register, forgot/reset password
│   ├── customer/   → Payment, my bookings, dashboard
│   ├── manager/    → My hotels, manage rooms, view bookings, dashboard
│   └── admin/      → Dashboard
├── utils/          → Shared helpers (errorHelpers — unwraps backend error responses)
├── types/          → Shared TypeScript interfaces matching backend DTOs
├── assets/         → Logo/icon
├── App.tsx
└── main.tsx
```

---

## Architecture Notes

### JWT handling

The JWT is stored in `localStorage` and attached automatically to every outgoing request via an Axios request interceptor (`api/client.ts`). The token is decoded client-side (`authSlice.ts`) purely to extract the user's email and roles for UI purposes (showing the right nav links, hiding manager/admin routes from customers) — this is not a security boundary; the backend independently enforces authorization on every request regardless of what the frontend shows or hides.

### Route protection

`ProtectedRoute` wraps any route that requires authentication, with an optional `requiredRole` prop. It redirects to `/login` if there's no token, or back to `/` if the user is authenticated but lacks the required role. This mirrors the backend's own role checks for a better user experience, but the backend remains the actual enforcement point.

### Error message extraction

Spring Boot returns errors in a few different shapes depending on the failure type — a plain string for most business-rule violations (thrown manually in the service layer), or a structured object with an `errors` array for `@Valid` validation failures. `utils/errorHelpers.ts`'s `extractErrorMessage()` normalizes both shapes into a single user-facing string, used consistently across every form that submits to the API.

### Enriched booking/review data

Several backend endpoints return DTOs enriched with data from related collections (a booking's hotel name and room type, a review's reviewer name and room type) rather than raw ids, so the frontend doesn't need to make additional lookups to display meaningful information — see the backend README's "Response enrichment via dedicated DTOs" section for details.

### Cold-start UX

Since the backend can take up to ~2 minutes to wake from Render's free-tier sleep, both the register and login forms (and ideally any other slow first-load interaction) show a reassuring message after a few seconds of waiting, asking the user to stay on the page rather than refresh or navigate away — refreshing would abandon the in-flight request's response, even though the backend operation itself completes independently of the browser.

---

## Deployment Notes (Vercel)

### Configuration
- **Root Directory:** `frontend` (this repo contains both `backend` and `frontend` at the root)
- **Framework Preset:** Vite (auto-detected)
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install` (set explicitly — leaving this on Vercel's placeholder/auto-detect caused a failed build where `vite` wasn't found, since the install step didn't run inside the correct directory)

### Environment variables required
```
VITE_API_BASE_URL=<live backend URL>
```
Set for both **Production and Preview** environments, so preview deployments (e.g. from branch pushes) also successfully reach the real backend.

### CORS

The backend's `SecurityConfig` must explicitly allow this frontend's origin. If the Vercel deployment URL changes (e.g. a new project, or a custom domain is added later), the backend's `corsConfigurationSource()` allowed-origins list must be updated and redeployed, or all API requests from the frontend will be blocked by the browser with a CORS error.

### Known issue encountered during setup

Vercel's Root Directory field defaulted to blank on initial import, causing the build to run from the repo root (where there's no `package.json`) instead of `frontend/`, producing `vite: command not found`. Fixed by explicitly setting Root Directory to `frontend` in Project Settings → General → Build & Development Settings, then redeploying.
