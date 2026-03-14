# Feedlyte

A lightweight, embeddable feedback collection platform for modern web products. Drop one `<script>` tag into any website and instantly collect user feedback — no SDK, no npm package, no configuration required on the host site.

---

## Features

- **One-line embed** — a single `<script>` tag injects a fully self-contained feedback widget into any website
- **Isolated iframe widget** — the widget runs in its own iframe with a dedicated root layout, completely isolated from the host page's CSS and DOM
- **Project management** — create multiple projects, each with a custom button label, colour, and position (bottom-left or bottom-right)
- **Feedback inbox** — view, filter by status, search by message/email/URL, and mark feedback as new, reviewed, or resolved
- **Live widget preview** — see exactly how the widget looks before embedding
- **One-click embed code copy** — copy a ready-to-paste `<script>` tag straight from the dashboard
- **Credentials auth** — email + password registration and login powered by NextAuth v5 with JWT sessions
- **Rate limiting** — feedback endpoint limited to 10 submissions per IP per 15 minutes
- **Comprehensive error handling** — all API routes return structured JSON errors with correct HTTP status codes

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 + custom dark theme |
| UI Components | Radix UI + shadcn/ui |
| Auth | NextAuth v5 (Credentials provider, JWT sessions) |
| Database | PostgreSQL via Neon (serverless) |
| ORM | Prisma 7 with `@prisma/adapter-neon` (HTTP mode) |
| Data fetching | TanStack Query v5 |
| Validation | Zod v4 |
| Password hashing | bcryptjs |
| Deployment | Vercel |

---

## Project Structure

```
src/
├── app/
│   ├── (main)/               # Main app — has its own root layout + globals.css
│   │   ├── layout.tsx        # Root layout: DM Sans font, Providers, Tailwind
│   │   └── page.tsx          # SPA entry point → <App />
│   ├── (widget)/             # Widget route group — isolated from main app CSS
│   │   ├── layout.tsx        # Minimal root layout: transparent background, no CSS imports
│   │   └── widget/
│   │       └── page.tsx      # The embeddable feedback UI (button + panel)
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/ # NextAuth route handler
│   │   │   └── register/      # POST /api/auth/register
│   │   ├── projects/
│   │   │   ├── route.ts       # GET /api/projects, POST /api/projects
│   │   │   └── [id]/route.ts  # GET, DELETE /api/projects/:id
│   │   └── feedback/
│   │       ├── route.ts       # GET /api/feedback, POST /api/feedback (public + CORS)
│   │       └── [id]/route.ts  # PATCH, DELETE /api/feedback/:id
│   └── globals.css            # Tailwind + dark industrial theme variables
├── components/
│   ├── app.tsx                # Root SPA shell (auth gate + routing)
│   ├── auth/                  # Login and register forms
│   ├── projects/              # Projects page, project cards, detail view, embed code
│   ├── feedback/              # Feedback inbox and items
│   ├── settings/              # Account settings
│   ├── widget/                # In-dashboard widget preview component
│   ├── layout/                # Sidebar, nav
│   └── ui/                    # Base components (Button, Card, Input, etc.)
├── hooks/
│   ├── use-projects.ts        # TanStack Query hooks for projects CRUD
│   └── use-feedback.ts        # TanStack Query hooks for feedback CRUD
├── lib/
│   ├── prisma.ts              # PrismaNeonHttp singleton
│   ├── api-helpers.ts         # ok(), err(), requireAuth(), handleError()
│   ├── rate-limit.ts          # In-memory rate limiter
│   ├── validations.ts         # Zod schemas for all inputs
│   └── utils.ts               # cn() and general helpers
├── types/                     # Shared TypeScript types
└── auth.ts                    # NextAuth config (Credentials provider + PrismaAdapter)

prisma/
└── schema.prisma              # Database schema (User, Account, Session, Project, Feedback)

public/
└── widget.js                  # Self-contained IIFE widget loader (no dependencies)

prisma.config.ts               # Prisma 7 datasource config (reads DATABASE_URL)
```

---

## Database Schema

```prisma
model User {
  id           String    @id @default(cuid())
  name         String?
  email        String    @unique
  passwordHash String?
  projects     Project[]
  // + NextAuth Account / Session / VerificationToken tables
}

model Project {
  id       String   @id @default(cuid())
  name     String
  userId   String
  color    String   @default("#F59E0B")
  position String   @default("bottom-right")
  label    String   @default("Feedback")
  feedback Feedback[]
}

model Feedback {
  id        String  @id @default(cuid())
  projectId String
  message   String
  email     String?
  pageUrl   String?
  userAgent String?
  status    String  @default("new")  // "new" | "reviewed" | "resolved"
}
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) PostgreSQL database (free tier is fine)

### 1. Clone and install

```bash
git clone https://github.com/Joesef127/feedlyte1.0.git
cd feedlyte1.0
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
# Neon PostgreSQL — pooled connection (required)
DATABASE_URL="postgresql://<user>:<password>@<host>-pooler.<region>.aws.neon.tech/<db>?sslmode=require"

# NextAuth v5 — generate with: openssl rand -base64 32
AUTH_SECRET="your-secret-here"

# Local dev URL
NEXTAUTH_URL="http://localhost:3000"
```

> **Note:** `DATABASE_URL` must use the **pooled** Neon connection string. Prisma uses HTTP mode (`PrismaNeonHttp`) which is compatible with Neon's serverless pooler and does not require WebSockets.

### 3. Push the database schema

```bash
npx prisma db push
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Embedding the Widget

After creating a project in the dashboard, go to the project's detail page and copy the embed snippet. Paste it before the closing `</body>` tag of any website:

```html
<script
  src="https://feedlyte.vercel.app/widget.js"
  data-project="YOUR_PROJECT_ID"
></script>
```

### Optional attributes

| Attribute | Values | Default | Description |
|---|---|---|---|
| `data-project` | Project ID | — | **Required.** Your project ID from the dashboard |
| `data-position` | `bottom-right` \| `bottom-left` | `bottom-right` | Corner the widget anchors to |

### How it works

1. `widget.js` is a zero-dependency IIFE served as a static file from `public/`
2. It reads `data-project` and `data-position` from the script tag
3. It injects a `position: fixed` container div into the host page's DOM
4. It creates an `<iframe>` pointing to `https://feedlyte.vercel.app/widget?project=...`
5. The iframe runs in the `(widget)` route group — its own isolated HTML document with no app CSS, transparent background, and `color-scheme: normal` to prevent the host page's dark mode from affecting it
6. The iframe communicates its height back to `widget.js` via `postMessage` so the container resizes smoothly when the panel opens

---

## API Reference

All endpoints that modify data require an active session except `POST /api/feedback` and `OPTIONS /api/feedback`, which are public and CORS-enabled.

### Auth

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create a new account (`name`, `email`, `password`) |
| `POST` | `/api/auth/signin` | Sign in (handled by NextAuth) |

### Projects

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/projects` | ✅ | List all projects for the current user |
| `POST` | `/api/projects` | ✅ | Create a project (`name`, `color?`, `position?`, `label?`) |
| `GET` | `/api/projects/:id` | ✅ | Get a single project with feedback counts |
| `DELETE` | `/api/projects/:id` | ✅ | Delete a project and all its feedback |

### Feedback

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/feedback` | ❌ (public) | Submit feedback from the widget |
| `GET` | `/api/feedback` | ✅ | List feedback (supports `?status=` and `?q=` filters) |
| `PATCH` | `/api/feedback/:id` | ✅ | Update feedback status (`new` / `reviewed` / `resolved`) |
| `DELETE` | `/api/feedback/:id` | ✅ | Delete a feedback item |

---

## Deployment (Vercel)

The `build` script runs `prisma generate` before `next build` so Vercel generates the Prisma client from the schema before compilation (the `src/generated/prisma` directory is gitignored).

```json
"build": "prisma generate && next build"
```

### Required environment variables in Vercel

| Key | Value |
|---|---|
| `DATABASE_URL` | Neon pooled connection string |
| `AUTH_SECRET` | Random base64 secret (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Your production URL, e.g. `https://feedlyte.vercel.app` |

---

## Important: Prisma HTTP Mode

This project uses `PrismaNeonHttp` (Prisma's Neon serverless HTTP adapter) instead of a standard TCP connection. This has one key constraint:

> **Implicit and explicit transactions are not supported.**

Avoid using `include` on write operations (`create`, `update`, `delete`). If you need related data after a write, perform a **separate read query**:

```ts
// ❌ Causes "Transactions are not supported in HTTP mode"
const project = await prisma.project.create({ data: {...}, include: { feedback: true } });

// ✅ Correct approach
const project = await prisma.project.create({ data: {...} });
const withFeedback = await prisma.project.findUnique({ where: { id: project.id }, include: { feedback: true } });
```

---
