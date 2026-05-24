# Comugest Frontend — Technical Reference

> React SPA for Comugest, a homeowners-association (comunidad de vecinos) management platform.

---

## Table of Contents

1. [Stack Overview](#stack-overview)
2. [Project Structure](#project-structure)
3. [Running Locally](#running-locally)
4. [Building for Production](#building-for-production)
5. [Vercel Deployment](#vercel-deployment)
6. [Environment Variables](#environment-variables)
7. [PWA Configuration](#pwa-configuration)
8. [Internationalization (i18n)](#internationalization-i18n)
9. [Tailwind Design System](#tailwind-design-system)
10. [TanStack Query Configuration](#tanstack-query-configuration)
11. [Auth Architecture](#auth-architecture)

---

## Stack Overview

| Layer | Technology |
|---|---|
| Framework | React 18 |
| Build tool | Vite 5 |
| Language | JavaScript (JSX) |
| Routing | React Router 6 |
| Server state | TanStack Query 5 |
| Forms | React Hook Form + Zod |
| HTTP client | Axios |
| Styling | Tailwind CSS 3 |
| Charts | Recharts |
| i18n | i18next + react-i18next |
| PWA | vite-plugin-pwa (Workbox) |
| Testing | Vitest + Testing Library |

---

## Project Structure

```
comugest-frontend/
├── public/
│   ├── favicon.svg
│   ├── pwa-icon.svg
│   └── _redirects              # Netlify/Vercel SPA fallback (if needed)
├── src/
│   ├── main.jsx                # Entry point (renders <App />)
│   ├── App.jsx                 # Router + QueryClient + AuthProvider
│   ├── index.css               # Tailwind directives + global styles
│   │
│   ├── api/                    # Axios API modules (one file per domain)
│   │   ├── client.js           # Axios instance + interceptors + token storage
│   │   ├── auth.js
│   │   ├── communities.js
│   │   ├── invoices.js
│   │   ├── announcements.js
│   │   ├── expenses.js
│   │   ├── meetings.js
│   │   ├── messages.js
│   │   ├── procedures.js
│   │   ├── tickets.js
│   │   ├── documents.js
│   │   ├── areas.js
│   │   ├── budget.js
│   │   ├── calendar.js
│   │   ├── coAdmins.js
│   │   ├── banking.js
│   │   ├── billing.js
│   │   ├── delinquency.js
│   │   ├── import.js
│   │   ├── incidents.js
│   │   ├── invitations.js
│   │   ├── me.js
│   │   ├── meterReadings.js
│   │   ├── notifications.js
│   │   ├── polls.js
│   │   ├── push.js
│   │   ├── recurring.js
│   │   ├── reports.js
│   │   ├── suppliers.js
│   │   ├── templates.js
│   │   ├── unitNotes.js
│   │   └── waitlist.js
│   │
│   ├── components/             # Reusable UI components
│   │   ├── Layout.jsx           # Main app shell (header, nav, footer)
│   │   ├── ProtectedRoute.jsx   # Auth guard HOC
│   │   ├── StatusBadge.jsx      # Colored status pill
│   │   ├── TicketBadges.jsx     # Ticket-specific status/priority pills
│   │   ├── ProcedureStatusBadge.jsx
│   │   ├── ExpenseBreakdown.jsx # Pie/bar chart for expenses
│   │   ├── NotificationBell.jsx # Notification dropdown
│   │   ├── LanguageSwitcher.jsx # ES/EN toggle
│   │   ├── DarkModeToggle.jsx   # Light/dark toggle
│   │   └── OnboardingWizard.jsx # First-time setup wizard
│   │
│   ├── contexts/
│   │   └── AuthContext.jsx      # Auth state + login/logout/register helpers
│   │
│   ├── hooks/                  # Custom TanStack Query hooks
│   │   ├── useAdmin.js
│   │   ├── useAreas.js
│   │   ├── useBanking.js
│   │   ├── useBilling.js
│   │   ├── useBudgets.js
│   │   ├── useCalendar.js
│   │   ├── useCoAdmins.js
│   │   ├── useComms.js          # Messages / conversations
│   │   ├── useCommunities.js
│   │   ├── useDelinquency.js
│   │   ├── useDocuments.js
│   │   ├── useExpenses.js
│   │   ├── useIncidents.js
│   │   ├── useInvoices.js
│   │   ├── useMe.js
│   │   ├── useMeetings.js
│   │   ├── useMeterReadings.js
│   │   ├── useNotifications.js
│   │   ├── usePolls.js
│   │   ├── useProcedures.js
│   │   ├── usePush.js
│   │   ├── useRecurring.js
│   │   ├── useSuppliers.js
│   │   ├── useTemplates.js
│   │   ├── useTickets.js
│   │   ├── useUnitNotes.js
│   │   └── useWaitlist.js
│   │
│   ├── i18n/
│   │   ├── index.js             # i18next initialization
│   │   └── locales/
│   │       ├── es.json          # Spanish translations (default)
│   │       └── en.json          # English translations
│   │
│   ├── lib/                    # Utility helpers
│   │
│   ├── pages/                  # One file per route (see PAGES.md)
│   │   └── *.jsx
│   │
│   └── test/
│       └── setup.js             # Vitest + Testing Library setup
│
├── tailwind.config.js
├── vite.config.js
├── index.html
└── package.json
```

---

## Running Locally

### Prerequisites

- Node.js ≥ 18 (20 recommended)
- Backend API running at `http://localhost:4000` (or set `VITE_API_URL`)

### Steps

```bash
cd comugest-frontend
npm install

# Optional: create a local env override
echo "VITE_API_URL=http://localhost:4000/api/v1" > .env.local

npm run dev
# App opens at http://localhost:5173
```

The Vite dev server proxies `/api` requests to `http://localhost:4000` (configured in `vite.config.js`), so `VITE_API_URL` is not strictly needed in development.

### Useful dev commands

```bash
npm run test        # Run Vitest tests
npm run lint        # ESLint
npm run format      # Prettier
```

---

## Building for Production

```bash
npm run build
# Output in dist/
```

Preview the production build locally:

```bash
npm run preview
# Serves dist/ at http://localhost:4173
```

---

## Vercel Deployment

### Steps

1. Push the frontend repo to GitHub
2. Go to [vercel.com](https://vercel.com) → "New Project" → import from GitHub
3. Vercel auto-detects Vite
4. Set environment variables (see below)
5. Set the **Output Directory** to `dist` (usually auto-detected)
6. Deploy

### SPA routing

Vercel handles SPA fallback automatically for Vite projects. If you use another host, add a `vercel.json`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## Environment Variables

Create `.env.local` for local overrides or set in Vercel's project settings.

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_API_URL` | No | `/api/v1` (proxied in dev) | Full URL of backend API, e.g. `https://api.comugest.app/api/v1` |

All Vite environment variables must be prefixed with `VITE_` to be exposed to the browser bundle.

### Example `.env.production`

```env
VITE_API_URL=https://api.comugest.app/api/v1
```

---

## PWA Configuration

Configured via `vite-plugin-pwa` in `vite.config.js`.

### Manifest

| Property | Value |
|---|---|
| `name` | Comugest |
| `short_name` | Comugest |
| `theme_color` | `#4a5329` (olive-700) |
| `background_color` | `#faf9f5` (cream-50) |
| `display` | `standalone` |
| `start_url` | `/` |

### Service Worker (Workbox)

- **Strategy**: `NetworkFirst` for all `/api/v1/` requests
- **API cache**: max 50 entries, 5-minute TTL, 10-second network timeout
- **Static assets**: pre-cached on install (`**/*.{js,css,html,ico,png,svg,woff2}`)
- **Register type**: `autoUpdate` (new SW activates automatically)

### Web Push

Push notification subscription is initialized in `usePush.js`:
1. Request notification permission from the browser
2. Fetch VAPID public key from `GET /push/vapid-key`
3. Subscribe service worker via `PushManager.subscribe()`
4. POST subscription to `POST /push/subscribe`

---

## Internationalization (i18n)

Uses `i18next` with `i18next-browser-languagedetector`.

### Supported languages

| Code | Language |
|---|---|
| `es` | Spanish (default) |
| `en` | English |

### Adding a new language

1. Create `src/i18n/locales/<code>.json` — copy `es.json` as a template
2. Translate all values (never change the keys)
3. Register the locale in `src/i18n/index.js`:

```javascript
import en from './locales/en.json';
import es from './locales/es.json';
import de from './locales/de.json'; // new

i18next.init({
  resources: {
    en: { translation: en },
    es: { translation: es },
    de: { translation: de }, // add here
  },
  ...
});
```

4. The `LanguageSwitcher` component reads available languages from i18next resources automatically

### Using translations in components

```jsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  return <h1>{t('dashboard.title')}</h1>;
}
```

### Translation key conventions

- Keys are dot-separated: `module.context.label`
- Common keys live under `common.*`
- Navigation keys live under `nav.*`
- Page-specific keys use the page name: `invoices.createButton`

---

## Tailwind Design System

### Color Palette

The palette is inspired by Mediterranean architecture: olive green on cream with terracotta accents.

#### Olive (primary — greens)

| Token | Hex | Usage |
|---|---|---|
| `olive-50` | `#f6f7f2` | Very light background tints |
| `olive-100` | `#e9ecdf` | Borders, subtle backgrounds |
| `olive-200` | `#d3d9bf` | Disabled states |
| `olive-300` | `#b3bf94` | Placeholder text |
| `olive-400` | `#94a571` | Secondary text |
| `olive-500` | `#778856` | Muted text |
| `olive-600` | `#5d6c42` | Body text |
| `olive-700` | `#485436` | Headings |
| `olive-800` | `#3b442e` | Dark text |
| `olive-900` | `#333a29` | Near-black text |
| `olive-950` | `#1a1f13` | Dark mode background |

#### Cream (neutral — warm whites)

| Token | Hex | Usage |
|---|---|---|
| `cream-50` | `#fdfcf8` | Page background |
| `cream-100` | `#faf7ec` | Card backgrounds |
| `cream-200` | `#f3ecd2` | Input backgrounds |
| `cream-300` | `#ebdfb1` | Hover states |
| `cream-400` | `#dfca88` | Borders in light mode |
| `cream-500` | `#d4b566` | Accent borders |

#### Clay (accent — terracotta)

| Token | Hex | Usage |
|---|---|---|
| `clay-400` | `#d28560` | Warning / highlight |
| `clay-500` | `#c66a40` | CTA buttons |
| `clay-600` | `#b25334` | Button hover |
| `clay-700` | `#94422c` | Button active / error |

### Typography

| Class | Font | Usage |
|---|---|---|
| `font-sans` | Geist | Body text |
| `font-display` | Fraunces | Headings, brand name |
| `font-mono` | Geist Mono | Code, IBANs, references |

### Custom shadow

```css
shadow-soft: '0 1px 2px 0 rgba(26, 31, 19, 0.04), 0 1px 8px -1px rgba(26, 31, 19, 0.06)'
```

Use `shadow-soft` instead of Tailwind's default `shadow-sm` for a warmer, less gray shadow.

### Dark mode

Dark mode uses the `class` strategy — toggle by adding/removing `dark` class on `<html>`.

Managed by `DarkModeToggle.jsx` which writes to `localStorage` and syncs with `document.documentElement`.

---

## TanStack Query Configuration

Configured in `App.jsx`:

```javascript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,                    // one retry on failure
      refetchOnWindowFocus: false, // don't refetch when tab gains focus
      staleTime: 30_000,           // data considered fresh for 30s
    },
  },
});
```

All data-fetching hooks in `src/hooks/` wrap TanStack Query's `useQuery` and `useMutation`.

---

## Auth Architecture

### State management

`AuthContext.jsx` provides:
- `user` — current user object (or `null`)
- `isAuthenticated` — boolean
- `isLoading` — true while bootstrapping from stored token
- `login(credentials)` — calls API, stores tokens
- `completeTwoFactor(preAuthToken, totpCode)` — completes 2FA
- `logout()` — clears tokens, redirects to `/login`
- `register(data)` — registers account (no auto-login)

### Token storage

Tokens are stored in `localStorage` under keys `comugest_access` and `comugest_refresh`.

### Automatic token refresh

`src/api/client.js` intercepts 401 responses and automatically:
1. Calls `POST /auth/refresh` with the stored refresh token
2. Retries the original request with the new access token
3. If refresh fails, clears storage and redirects to `/login`

Only one refresh request runs at a time (request deduplication via shared Promise).

### Route protection

`ProtectedRoute.jsx` wraps route elements and:
- Shows a loading spinner while `isLoading` is true
- Redirects to `/login` if not authenticated
- Redirects to `/` if the user's role is not in `allowedRoles`
