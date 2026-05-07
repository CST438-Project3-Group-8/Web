# StudyHive — Web Frontend

A React + TypeScript single-page application that lets students browse, create, and manage study groups. Authentication is handled by Supabase; all data comes from the Spring Boot API.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript 6 |
| Build Tool | Vite 8 (Rolldown-based) |
| Routing | React Router v7 |
| Auth | Supabase JS (`@supabase/supabase-js`) |
| HTTP Client | Axios |
| Styling | Tailwind CSS v4 + plain CSS |
| Linting | ESLint 9 + typescript-eslint |

---

## Project Structure

```
studyhive-web/
├── src/
│   ├── api/                   # Thin wrappers around Axios calls
│   │   ├── coursesApi.ts
│   │   ├── groupsApi.ts
│   │   ├── sessionsApi.ts
│   │   └── userApi.ts
│   │
│   ├── components/
│   │   ├── AppLayout.tsx       # Sidebar + header shell
│   │   ├── AuthBootstrapSkeleton.tsx
│   │   ├── PageSkeletons.tsx   # Per-page shimmer skeletons
│   │   └── ProtectedRoute.tsx  # JWT guard + bootstrap error UI
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx     # Session state, OAuth helpers, backend bootstrap
│   │
│   ├── lib/
│   │   ├── apiClient.ts        # Axios instance with Supabase JWT interceptor
│   │   ├── apiErrors.ts        # HTTP error → human message mapping
│   │   ├── dateTime.ts         # Formatting helpers
│   │   └── supabase.ts         # Supabase client singleton
│   │
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── FindGroupsPage.tsx
│   │   ├── MyGroupsPage.tsx
│   │   ├── CreateGroupPage.tsx
│   │   ├── GroupDetailPage.tsx  # Sessions CRUD for group owners
│   │   └── ProfilePage.tsx      # Edit profile, manage courses, delete account
│   │
│   ├── types/index.ts           # Shared TypeScript interfaces
│   ├── App.tsx                  # Route tree
│   └── main.tsx
│
├── public/
├── index.html
├── vite.config.ts
└── package.json
```

---

## Pages & Features

| Page | Route | Description |
|---|---|---|
| Login | `/login` | Email/password · Google OAuth · GitHub OAuth |
| Sign Up | `/signup` | Email registration · social sign-up |
| Dashboard | `/dashboard` | Welcome banner, stat cards, upcoming sessions, owned groups |
| Browse Groups | `/groups` | Search + mode filter (All / Online / In-Person / Hybrid) |
| My Groups | `/my-groups` | Groups the user owns or has joined with next-session preview |
| Create Group | `/groups/new` | Title, description, course, mode, location, max-members form |
| Group Detail | `/groups/:id` | Full group info + session list + create/edit/delete sessions (owner only) |
| Profile | `/profile` | Edit name/bio/major, change password, manage courses, delete account |

All routes except `/login` and `/signup` are wrapped in `ProtectedRoute`, which shows a full-page shimmer skeleton while the Supabase session and backend profile bootstrap are in-flight.

---

## Authentication Flow

1. User signs in via Supabase (email or OAuth redirect).
2. `AuthContext` detects the session and calls `POST /api/user` on the Spring Boot backend to upsert the user profile (up to 5 retries with back-off).
3. On success, `ProtectedRoute` renders the requested page.
4. Every Axios request attaches the Supabase JWT via a request interceptor in `apiClient.ts`.

The pending OAuth provider is stored in `sessionStorage` before the redirect so `AuthContext` can send the correct `oauthProvider` value to the backend after the callback.

---

## Environment Variables

Create `studyhive-web/.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_BASE_URL=http://localhost:8080
```

---

## Getting Started

```bash
cd studyhive-web
npm install
npm run dev        # http://localhost:5173
```

### Other scripts

```bash
npm run build      # Type-check + production bundle → dist/
npm run preview    # Serve the production bundle locally
npm run lint       # ESLint
```

---

## API Layer

All backend calls go through `src/lib/apiClient.ts` (an Axios instance pointed at `VITE_API_BASE_URL`). Each feature area has its own thin module under `src/api/`:

```ts
// Example — groupsApi.ts
export async function getGroups() {
    const response = await apiClient.get<StudyGroup[]>('/api/groups');
    return response.data;
}
```

HTTP error messages are normalised in `src/lib/apiErrors.ts` and displayed inline in each page component.

---

## Type Definitions

Core domain types live in `src/types/index.ts`:

- `StudyGroup` — id, title, description, courseId, creatorId, meetingMode, maxMembers, createdAt
- `Course` — id, code, title, subject
- `StudySession` — id, groupId, title, topic, scheduledAt, location, notes, durationMinutes
- `CreateGroupPayload` / `CreateOrUpdateSessionPayload` — request shapes
