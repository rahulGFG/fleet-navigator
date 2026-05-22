# FleetFlow — Frontend

> React + TanStack Router frontend for the FleetFlow Transport Management System.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Routing | TanStack Router v1 (file-based) |
| Data fetching | TanStack Query v5 |
| Build tool | Vite 7 |
| Styling | Tailwind CSS v4 |
| UI components | shadcn/ui (Radix UI primitives) |
| Icons | Lucide React |
| Forms | React Hook Form + Zod |
| Notifications | Sonner |
| Language | TypeScript 5 |

---

## Prerequisites

- **Node.js** v18 or higher — [nodejs.org](https://nodejs.org)
- **npm** v9+ or **bun** (project includes `bun.lock`)
- The **backend API** running at `http://localhost:5000` — see `fleet-backend/README.md`

---

## Getting Started

### 1. Install dependencies

```bash
cd fleet-navigator
npm install
# or
bun install
```

### 2. Configure environment

```bash
copy .env.example .env
```

`.env` contents:
```env
VITE_API_URL=http://localhost:5000/api
```

Change `VITE_API_URL` if your backend runs on a different port or host.

### 3. Start the dev server

```bash
npm run dev
```

App opens at **http://localhost:5173**

---

## Project Structure

```
fleet-navigator/
├── src/
│   ├── assets/
│   │   └── landing-hero.jpg        # Hero image for landing page
│   │
│   ├── components/
│   │   ├── tms/                    # App-specific components
│   │   │   ├── AppSidebar.tsx      # Navigation sidebar
│   │   │   ├── ConfirmDelete.tsx   # Delete confirmation dialog
│   │   │   ├── EmptyState.tsx      # Empty list placeholder
│   │   │   ├── FormField.tsx       # Form field wrapper + IconInput
│   │   │   ├── PageHeader.tsx      # Page title + action button row
│   │   │   └── StatCard.tsx        # Dashboard stat card
│   │   └── ui/                     # shadcn/ui components (auto-generated)
│   │
│   ├── hooks/
│   │   ├── use-mobile.tsx          # Responsive breakpoint hook
│   │   └── use-tms.ts              # useVehicles / useDrivers / useTrips
│   │
│   ├── lib/
│   │   ├── api.ts                  # Fetch wrapper — auto-attaches JWT
│   │   ├── auth-context.tsx        # AuthProvider, useAuth, getToken
│   │   ├── tms-types.ts            # TypeScript types: Vehicle, Driver, Trip
│   │   └── utils.ts                # cn() helper
│   │
│   ├── routes/
│   │   ├── __root.tsx              # Root layout — auth guard, sidebar shell
│   │   ├── index.tsx               # Landing page (/)
│   │   ├── login.tsx               # Login page (/login)
│   │   ├── register.tsx            # Register page (/register)
│   │   ├── dashboard.tsx           # Dashboard (/dashboard)
│   │   ├── vehicles.tsx            # Vehicles CRUD (/vehicles)
│   │   ├── drivers.tsx             # Drivers CRUD (/drivers)
│   │   └── trips.tsx               # Trips CRUD (/trips)
│   │
│   ├── router.tsx                  # TanStack Router setup
│   ├── routeTree.gen.ts            # Auto-generated route tree (do not edit)
│   ├── start.ts                    # TanStack Start entry
│   └── styles.css                  # Global styles + Tailwind
│
├── .env                            # Local env (git-ignored)
├── .env.example                    # Template — safe to commit
├── .gitignore
├── components.json                 # shadcn/ui config
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Pages & Routes

| Route | Page | Auth required |
|-------|------|---------------|
| `/` | Landing page | No |
| `/login` | Sign in | No |
| `/register` | Create account | No |
| `/dashboard` | Stats overview | **Yes** |
| `/vehicles` | Vehicle management | **Yes** |
| `/drivers` | Driver management | **Yes** |
| `/trips` | Trip management | **Yes** |

Unauthenticated users visiting any protected route are automatically redirected to `/login`.

---

## Authentication Flow

1. User visits `/login` or `/register`
2. On success the API returns `{ token, user }`
3. Token and user are stored in `localStorage` (`fleet_token`, `fleet_user`)
4. `AuthProvider` (in `auth-context.tsx`) rehydrates from localStorage on page load
5. Every API call in `api.ts` reads the token via `getToken()` and adds `Authorization: Bearer <token>`
6. Clicking **Sign out** clears localStorage and redirects to `/login`

---

## Data Hooks

All three hooks live in `src/hooks/use-tms.ts` and share the same interface:

```ts
const { items, loading, add, update, remove } = useVehicles();
const { items, loading, add, update, remove } = useDrivers();
const { items, loading, add, update, remove } = useTrips();
```

| Property | Type | Description |
|----------|------|-------------|
| `items` | `T[]` | Current list from the API |
| `loading` | `boolean` | True while initial fetch is in progress |
| `add(item)` | `Promise<T>` | POST — creates and prepends to list |
| `update(id, patch)` | `Promise<T>` | PUT — optimistic update, reverts on error |
| `remove(id)` | `Promise<void>` | DELETE — optimistic remove, reverts on error |

---

## TypeScript Types

Defined in `src/lib/tms-types.ts`:

```ts
type Vehicle = {
  id: string;
  plate: string;
  model: string;
  type: "Truck" | "Van" | "Trailer" | "Pickup";
  capacity: string;
  status: "Active" | "Maintenance" | "Inactive";
};

type Driver = {
  id: string;
  name: string;
  license: string;
  phone: string;
  experience: string;
  status: "Available" | "On Trip" | "Off Duty";
};

type Trip = {
  id: string;
  vehicleId: string;
  driverId: string;
  date: string;        // YYYY-MM-DD
  origin: string;
  destination: string;
  status: "Scheduled" | "In Progress" | "Completed" | "Cancelled";
};
```

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | No | `http://localhost:5000/api` | Backend API base URL |

> All Vite env variables must be prefixed with `VITE_` to be accessible in the browser.

---

## npm Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server at `http://localhost:5173` |
| `npm run build` | Production build to `dist/` |
| `npm run build:dev` | Build in development mode |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

---

## Adding a New Page

1. Create `src/routes/my-page.tsx`
2. Add the route definition:
   ```tsx
   export const Route = createFileRoute("/my-page")({
     component: MyPage,
   });
   ```
3. TanStack Router auto-generates the route tree — `routeTree.gen.ts` updates on next `npm run dev`
4. Add a link in `src/components/tms/AppSidebar.tsx` if it needs sidebar navigation

---

## Adding a New UI Component

This project uses [shadcn/ui](https://ui.shadcn.com). To add a component:

```bash
npx shadcn@latest add <component-name>
# example
npx shadcn@latest add data-table
```

Components are added to `src/components/ui/`.

---

## Connecting to a Different Backend

Change `VITE_API_URL` in your `.env`:

```env
VITE_API_URL=https://api.your-domain.com/api
```

No code changes needed — `src/lib/api.ts` reads this at build time.
