# Feedlyte

Feedlyte is a Next.js feedback collection app for embedding a lightweight feedback widget into a website, collecting public user feedback, and reviewing it from a dashboard. The repository is currently a working MVP with a real auth flow, feedback APIs, notification logic, and webhook support, but it is not yet a production-hardening target.

## Current status

This repository is best described as a functional single-user beta/MVP. It includes the main product flow, but the project still has known gaps around durable rate limiting, tenancy, public ingestion hardening, docs accuracy, and CI/deployment process.

The source of truth for roadmap execution is [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md). [TODO.md](TODO.md) is intentionally reduced to an active backlog summary and should not be treated as the full product history.

## Stack

- Next.js 16 with App Router
- TypeScript strict mode
- Prisma 7 + PostgreSQL/Neon
- NextAuth credentials auth
- React Query, Zod, Radix/shadcn-style UI
- Vitest for unit/integration tests

## Route and API inventory

### Public and marketing surfaces

- `GET /` marketing page
- `GET /auth/*` sign-in, sign-up, email verification, forgot/reset password flows
- `GET /widget` isolated widget page
- `GET /dashboard` authenticated dashboard shell
- `GET /dashboard/projects/[id]` project detail and widget config area

### Auth and identity

- `POST /api/auth/register`
- `POST /api/auth/signin` (NextAuth route)
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/resend-verification`
- `GET /api/users/me` (self-service user read path)
- `PATCH /api/users`
- `PUT /api/users`

### Projects and widgets

- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/[id]`
- `DELETE /api/projects/[id]`
- `GET /api/projects/[id]/analytics`
- `GET /api/projects/[id]/webhooks`
- `POST /api/projects/[id]/webhooks`
- `DELETE /api/projects/[id]/webhooks/[webhookId]`
- `POST /api/widget-config`

### Public feedback ingestion

- `OPTIONS /api/feedback`
- `POST /api/feedback?project=<projectId>`
- `GET /api/feedback` (authenticated dashboard read)
- `GET /api/feedback/[id]`
- `PATCH /api/feedback/[id]`
- `DELETE /api/feedback/[id]`

### Operational endpoints

- `GET /api/cron/digest` protected by `CRON_SECRET`
- `GET /api/unsubscribe`
- `POST /api/webhooks/[id]/retry` and related delivery/status flows

## Local setup

### Prerequisites

- Node.js 20 LTS recommended
- PostgreSQL-compatible database (Neon is the default target)
- A configured `.env` file for local execution

### Install

```bash
npm install
```

### Environment variables

Required in production deployment:

```env
DATABASE_URL="postgresql://..."
AUTH_SECRET="generate-a-strong-random-value"
```

Recommended local/test values:

```env
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
RESEND_API_KEY="test-or-live-key"
RESEND_FROM_EMAIL="noreply@example.com"
CRON_SECRET="local-cron-secret"
```

The repo includes a local validation script:

```bash
node scripts/validate-env.mjs
```

This script checks the environment shape without requiring production secrets in local development.

### Database workflow

```bash
npx prisma generate
npx prisma db push
```

For migrations:

```bash
npx prisma migrate dev
```

For rollback or recovery, follow the repository’s migration workflow and keep backups of the Neon branch or database before destructive changes. The project uses Prisma with Neon serverless HTTP mode, so transactions are intentionally limited and migration planning should account for that constraint.

## Security and operational notes

- The project includes email verification and password reset flows, but the registration response must not expose verification tokens.
- Public feedback ingestion is CORS-aware and origin-checked, but it is not a replacement for durable abuse controls.
- The current rate limiter is not deployment-safe for distributed serverless environments and should be replaced by a durable limit layer before broader production exposure.
- Webhook destinations, secrets, and outbound calls should be treated as sensitive and validated before broad release.
- Feedback data, user-agent strings, page URLs, webhook payloads, and notification emails may contain personal data and require retention and deletion policies.

## Widget usage

After creating a project in the dashboard, copy the embed snippet from the project detail page and place it before the closing `</body>` tag on a host page:

```html
<script src="https://your-app.example/widget.js" data-project="YOUR_PROJECT_ID"></script>
```

Supported attributes include:

- `data-project` — required project id
- `data-position` — `bottom-right` or `bottom-left`

## Test and quality baseline

Run the workspace checks locally:

```bash
node .\node_modules\vitest\vitest.mjs run
node .\node_modules\typescript\bin\tsc --noEmit
node scripts/validate-env.mjs
```

This project currently has a working local baseline with the safe test environment seed and environment validation script. CI and deployment checks are still part of the planned work and are not yet declared complete.

## Deployment constraints

- Vercel is the default production target.
- Prisma client generation should happen before Next.js build in the deployment environment.
- Production credentials must not be committed to source control or included in CI config.
- Migration and deployment operations require explicit review and rollback planning.

## Relationship to the implementation plan

This repository is executing the plan defined in [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md). The plan is the authoritative source for prioritized phases, security gates, and exit criteria. Changes here should be aligned to that roadmap rather than to stale task lists or older assumptions.

Avoid using `include` on write operations (`create`, `update`, `delete`). If you need related data after a write, perform a **separate read query**:

```ts
// ❌ Causes "Transactions are not supported in HTTP mode"
const project = await prisma.project.create({ data: {...}, include: { feedback: true } });

// ✅ Correct approach
const project = await prisma.project.create({ data: {...} });
const withFeedback = await prisma.project.findUnique({ where: { id: project.id }, include: { feedback: true } });
```

---
