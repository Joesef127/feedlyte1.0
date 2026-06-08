# Feedlyte 1.0 - Project Handover Documentation

## Project Overview

**Feedlyte** is a lightweight, embeddable feedback collection platform designed for modern web products. It enables website owners to collect user feedback by embedding a single `<script>` tag—no SDK, npm package, or complex configuration required on the host site.

### Key Value Propositions
- **One-line embed**: Single `<script>` tag on any website
- **Self-contained widget**: Runs in isolated iframe, no CSS conflicts
- **Easy management**: Dashboard for project and feedback management
- **No vendor lock-in**: Simple API-based architecture
- **Production-ready**: Structured error handling, rate limiting, authentication

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| **Framework** | Next.js (App Router, Turbopack) | 16.1.6 |
| **Language** | TypeScript | 5 |
| **Styling** | Tailwind CSS + custom dark theme | 4 |
| **UI Components** | Radix UI + shadcn/ui | Latest |
| **State Management** | TanStack Query (React Query) | 5.90.21 |
| **Authentication** | NextAuth.js (Credentials provider, JWT) | 5.0.0-beta.30 |
| **Database** | PostgreSQL (Neon serverless) | Via Neon |
| **ORM** | Prisma | 7.5.0 |
| **Database Adapter** | Neon HTTP Adapter (serverless) | @prisma/adapter-neon ^7.5.0 |
| **Password Hashing** | bcryptjs | 3.0.3 |
| **Validation** | Zod | 4.3.6 |
| **Icons** | Lucide React | 0.577.0 |
| **Deployment** | Vercel | N/A |

### Key Dependencies
- `@auth/prisma-adapter`: NextAuth Prisma integration
- `@neondatabase/serverless`: Neon serverless client
- `@radix-ui/react-dialog`, `@radix-ui/react-label`, `@radix-ui/react-slot`: UI primitives
- `class-variance-authority`: Component variant management
- `clsx`: Conditional CSS classes
- `tailwind-merge`: Tailwind class merging

---

## Project Structure

```
feedlyte1.0/
├── public/
│   └── widget.js                      # Embeddable widget loader script
├── prisma/
│   └── schema.prisma                  # Database schema definition
├── src/
│   ├── app/
│   │   ├── (main)/                    # Main authenticated app route group
│   │   │   ├── layout.tsx             # Root layout with Providers, DM Sans font
│   │   │   └── page.tsx               # SPA entry → <App />
│   │   ├── (widget)/                  # Widget route group (isolated from main CSS)
│   │   │   ├── layout.tsx             # Minimal layout (no CSS imports)
│   │   │   └── widget/
│   │   │       └── page.tsx           # Embeddable widget UI
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── [...nextauth]/     # NextAuth handler routes
│   │   │   │   └── register/          # User registration endpoint
│   │   │   ├── feedback/
│   │   │   │   ├── route.ts           # GET: all feedback, POST: submit feedback
│   │   │   │   └── [id]/              # DELETE, PATCH individual feedback
│   │   │   ├── projects/
│   │   │   │   ├── route.ts           # GET: all projects, POST: create project
│   │   │   │   └── [id]/              # GET, DELETE, PATCH project details
│   │   │   ├── projects/[id]/
│   │   │   │   └── feedback/          # GET feedback for specific project
│   │   │   └── widget-config/         # GET public widget config (no auth)
│   │   └── globals.css                # Global Tailwind styles
│   ├── components/
│   │   ├── app.tsx                    # Main SPA component (routing logic)
│   │   ├── providers.tsx              # NextAuth SessionProvider wrapper
│   │   ├── auth/
│   │   │   └── auth-screen.tsx        # Login/Register UI
│   │   ├── feedback/
│   │   │   ├── all-feedback-page.tsx  # Cross-project feedback view
│   │   │   ├── feedback-detail.tsx    # Modal: feedback detail + status update
│   │   │   ├── feedback-row.tsx       # Table row for feedback entry
│   │   │   └── feedback-table.tsx     # Main feedback table with filters
│   │   ├── layout/
│   │   │   ├── header.tsx             # Page header (context-aware)
│   │   │   └── sidebar.tsx            # Left sidebar with navigation
│   │   ├── projects/
│   │   │   ├── projects-page.tsx      # Projects grid view
│   │   │   ├── project-card.tsx       # Project card component
│   │   │   ├── project-detail-page.tsx # Project detail with tabs
│   │   │   └── embed-code.tsx         # Embed script display + copy
│   │   ├── settings/
│   │   │   └── settings-page.tsx      # Account, billing, API key (partial)
│   │   ├── widget/
│   │   │   └── widget-preview.tsx     # Interactive widget preview
│   │   └── ui/                        # Reusable UI components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── form-field.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── modal.tsx
│   │       ├── status-badge.tsx
│   │       ├── textarea.tsx
│   │       └── theme-toggle.tsx
│   ├── hooks/
│   │   ├── use-projects.ts            # Projects queries & mutations
│   │   └── use-feedback.ts            # Feedback queries & mutations
│   ├── lib/
│   │   ├── api-helpers.ts             # API error handling & auth guards
│   │   ├── prisma.ts                  # Prisma client singleton
│   │   ├── rate-limit.ts              # In-memory rate limiter
│   │   ├── utils.ts                   # Utility functions
│   │   └── validations.ts             # Zod schemas for all inputs
│   ├── types/
│   │   ├── index.ts                   # TypeScript interfaces
│   │   └── next-auth.d.ts             # NextAuth type extensions
│   ├── data/
│   │   └── mock.ts                    # Mock data (if any)
│   ├── generated/
│   │   └── prisma/                    # Auto-generated Prisma types
│   └── auth.ts                        # NextAuth configuration & handlers
├── package.json                       # Dependencies & build scripts
├── tsconfig.json                      # TypeScript configuration
├── next.config.ts                     # Next.js configuration
├── tailwind.config.ts                 # Tailwind CSS configuration
├── eslint.config.mjs                  # ESLint configuration
├── postcss.config.mjs                 # PostCSS configuration (Tailwind)
└── README.md                          # Project overview (user-facing)
```

---

## Database Schema

### Overview
The database is structured around **NextAuth.js requirements** (User, Account, Session, VerificationToken) plus **Feedlyte-specific models** (Project, Feedback).

### Entity Relationships
```
User (1) ──┬──→ (N) Project
           └──→ (N) Account
           └──→ (N) Session

Project (1) ──→ (N) Feedback
User (1) ──→ (1) Project via userId
```

### Tables

#### `users`
Stores user account information.
```sql
id            cuid (PRIMARY KEY)
name          VARCHAR (nullable)
email         VARCHAR UNIQUE
emailVerified TIMESTAMP (nullable) — for future email verification
image         VARCHAR (nullable)
passwordHash  VARCHAR (nullable) — bcryptjs hashed password
createdAt     TIMESTAMP DEFAULT now()

Relations:
  - accounts (1-to-N)
  - sessions (1-to-N)
  - projects (1-to-N)
```

#### `accounts`
NextAuth.js OAuth/provider account linking (currently unused, for future OAuth integration).
```sql
id                cuid (PRIMARY KEY)
userId            cuid (FOREIGN KEY → users.id)
type              VARCHAR
provider          VARCHAR
providerAccountId VARCHAR
refresh_token     TEXT (nullable)
access_token      TEXT (nullable)
expires_at        INT (nullable)
token_type        VARCHAR (nullable)
scope             VARCHAR (nullable)
id_token          TEXT (nullable)
session_state     VARCHAR (nullable)

Relations:
  - user (N-to-1)
```

#### `sessions`
NextAuth.js JWT session tokens (stored for audit, not strictly required).
```sql
id           cuid (PRIMARY KEY)
sessionToken VARCHAR UNIQUE
userId       cuid (FOREIGN KEY → users.id)
expires      TIMESTAMP

Relations:
  - user (N-to-1)
```

#### `verification_tokens`
NextAuth.js email verification tokens (for future use).
```sql
identifier VARCHAR
token      VARCHAR
expires    TIMESTAMP

Unique: (identifier, token)
```

#### `projects`
Feedback collection projects created by users.
```sql
id        cuid (PRIMARY KEY)
name      VARCHAR (max 80) — project name
userId    cuid (FOREIGN KEY → users.id)
color     VARCHAR DEFAULT '#F59E0B' — widget accent color (hex)
position  VARCHAR DEFAULT 'bottom-right' — widget position ('bottom-right' | 'bottom-left')
label     VARCHAR DEFAULT 'Feedback' (max 30) — button label
createdAt TIMESTAMP DEFAULT now()

Relations:
  - user (N-to-1)
  - feedback (1-to-N)
```

#### `feedback`
User feedback submitted via the widget (public creation).
```sql
id        cuid (PRIMARY KEY)
projectId cuid (FOREIGN KEY → projects.id)
message   TEXT (max 2000) — feedback text
email     VARCHAR (nullable) — submitter email (optional)
pageUrl   VARCHAR (nullable, max 2048) — page where feedback was submitted
userAgent VARCHAR (nullable, max 300) — browser user agent
status    VARCHAR DEFAULT 'new' — 'new' | 'reviewed' | 'resolved'
createdAt TIMESTAMP DEFAULT now()

Relations:
  - project (N-to-1)
```

### Key Constraints
- `User.email` is UNIQUE (one account per email)
- `Account` has UNIQUE (provider, providerAccountId) for multi-provider future support
- `Session.sessionToken` is UNIQUE
- `VerificationToken` has UNIQUE (identifier, token)
- Cascading deletes: Projects and Feedback deleted when User is deleted

---

## API Endpoints

### Authentication

#### `POST /api/auth/register`
**Purpose**: Register a new user account.  
**Auth**: None (public)  
**Request**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```
**Validation** (Zod):
- `name`: 2–80 characters
- `email`: valid email format
- `password`: 8–100 characters

**Responses**:
- `201 Created`: User created
  ```json
  { "id": "...", "name": "John Doe", "email": "john@example.com" }
  ```
- `400 Bad Request`: Validation error
- `409 Conflict`: Email already exists

**Error Handling**:
- Validates input with Zod
- Checks for duplicate email
- Hashes password with bcryptjs (salt rounds: 12)

#### `POST /api/auth/[...nextauth]`
**Purpose**: NextAuth.js credentials provider callback.  
**Auth**: JWT session strategy  
**Handlers**: GET, POST (NextAuth routes)

**Credentials Provider Logic**:
1. Validates email + password against `loginSchema`
2. Looks up user by email
3. Compares password hash with bcryptjs
4. Returns user object on success
5. JWT callback adds user ID to token
6. Session callback adds user ID to session

**Session Strategy**: JWT (stateless, no database session lookup)

### Projects

#### `GET /api/projects`
**Purpose**: Get all projects for authenticated user.  
**Auth**: Required  
**Responses**:
```json
[
  {
    "id": "proj_123",
    "name": "My Website",
    "color": "#F59E0B",
    "position": "bottom-right",
    "label": "Feedback",
    "createdAt": "2024-01-15T10:00:00Z",
    "feedbackCount": 42,
    "newCount": 5
  }
]
```

#### `POST /api/projects`
**Purpose**: Create a new project.  
**Auth**: Required  
**Request**:
```json
{
  "name": "My App",
  "color": "#3B82F6",          // optional, default: #F59E0B
  "position": "bottom-left",   // optional, default: bottom-right
  "label": "Send Feedback"     // optional, default: Feedback
}
```

**Validation** (Zod):
- `name`: 1–80 characters (required)
- `color`: hex format (6-digit) or default
- `position`: enum ['bottom-right', 'bottom-left']
- `label`: 1–30 characters

**Response**: `201 Created`
```json
{
  "id": "proj_123",
  "name": "My App",
  "color": "#3B82F6",
  "position": "bottom-left",
  "label": "Send Feedback",
  "createdAt": "2024-01-15T10:00:00Z",
  "feedbackCount": 0,
  "newCount": 0
}
```

#### `GET /api/projects/[id]`
**Purpose**: Get details for a single project (owned by user).  
**Auth**: Required  
**Responses**:
- `200 OK`: Project details (includes feedbackCount)
- `404 Not Found`: Project not found or not owned by user

#### `PATCH /api/projects/[id]`
**Purpose**: Update project settings.  
**Auth**: Required  
**Request**:
```json
{
  "name": "Updated Name",
  "color": "#10B981",
  "position": "bottom-left",
  "label": "New Label"
}
```

**Validation**: Same as POST (all fields optional)  
**Response**: `200 OK` with updated fields

#### `DELETE /api/projects/[id]`
**Purpose**: Delete a project and all its feedback.  
**Auth**: Required  
**Response**: `204 No Content`  
**Cascade**: All related feedback records are deleted via `onDelete: Cascade`

### Feedback (Authenticated)

#### `GET /api/feedback`
**Purpose**: Get all feedback for authenticated user's projects.  
**Auth**: Required  
**Query Parameters**:
- `status`: Filter by status ('new' | 'reviewed' | 'resolved')
- `q`: Search in message, email, or pageUrl (case-insensitive)

**Response**:
```json
[
  {
    "id": "fb_123",
    "projectId": "proj_456",
    "message": "Great product!",
    "email": "user@example.com",
    "pageUrl": "https://example.com/page",
    "userAgent": "Mozilla/5.0...",
    "status": "unreviewed",
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

### Feedback (Public)

#### `POST /api/feedback?project=[projectId]`
**Purpose**: Submit feedback from widget (public endpoint).  
**Auth**: None  
**CORS**: Allowed from `https://feedlyte.vercel.app` and `http://localhost:3000`  
**Rate Limit**: 10 requests per 15 minutes per IP  
**Query Parameter**:
- `project`: Project ID (required)

**Request**:
```json
{
  "message": "Found a bug on checkout",
  "email": "customer@example.com",
  "pageUrl": "https://mysite.com/checkout",
  "userAgent": "Mozilla/5.0..."
}
```

**Validation** (Zod):
- `message`: 1–2000 characters (required)
- `email`: valid email or empty string (optional)
- `pageUrl`: valid https/http URL or empty (optional)
- `userAgent`: 0–300 characters (optional)

**Response**: `201 Created`
```json
{
  "id": "fb_789",
  "message": "Feedback received. Thank you!"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid input
- `404 Not Found`: Project not found
- `429 Too Many Requests`: Rate limited

### Feedback (Authenticated)

#### `PATCH /api/feedback/[id]`
**Purpose**: Update feedback status (new → reviewed → resolved).  
**Auth**: Required (user must own the project)  
**Request**:
```json
{
  "status": "resolved"
}
```

**Validation**: `status` must be in ['new', 'reviewed', 'resolved']  
**Response**: `200 OK`
```json
{
  "id": "fb_123",
  "status": "resolved"
}
```

#### `DELETE /api/feedback/[id]`
**Purpose**: Delete a feedback entry.  
**Auth**: Required (user must own the project)  
**Response**: `204 No Content`

### Widget Configuration

#### `GET /api/widget-config?project=[projectId]`
**Purpose**: Get public widget config (no auth required).  
**Auth**: None  
**Query Parameter**:
- `project`: Project ID (required)

**Response**: `200 OK`
```json
{
  "color": "#F59E0B",
  "position": "bottom-right",
  "label": "Feedback"
}
```

**Error Responses**:
- `400 Bad Request`: Missing project ID
- `404 Not Found`: Project not found

---

## Core Features

### 1. **User Authentication**
- **Email + password registration** with bcryptjs hashing (12 salt rounds)
- **Credentials-based login** via NextAuth.js
- **JWT sessions** (stateless, no database queries on every request)
- **Protected routes** via `auth()` guard
- **Type-safe session** with extended NextAuth types

**Flow**:
1. User registers → password hashed → user created
2. User logs in → bcryptjs comparison → JWT issued
3. JWT token stored in secure httpOnly cookie
4. Token validated on each request

### 2. **Project Management**
- **Create** projects with custom settings:
  - Widget color (hex picker)
  - Widget position (bottom-left or bottom-right)
  - Button label (customizable text)
- **View** projects in grid layout with feedback stats
- **Edit** project settings (color, position, label)
- **Delete** project and cascade-delete all feedback
- **Project stats**: Total feedback, unreviewed count, resolved count

### 3. **Feedback Collection (Widget)**
- **Embeddable script** (`public/widget.js`) for any website
- **Zero configuration** on host site (just script tag + project ID)
- **Isolated iframe** prevents CSS conflicts with host page
- **Widget features**:
  - Floating button with customizable color and label
  - Modal form with message + optional email
  - Success confirmation screen
  - Smooth resizing via postMessage
  - Respects widget position setting (bottom-left/right)
- **Accessibility**: Title, proper labels, focus management
- **No dependencies** on the host site (self-contained)

### 4. **Feedback Management Dashboard**
- **Inbox view**: All feedback across projects
- **Project-specific view**: Feedback per project
- **Filtering**:
  - By status (new, reviewed, resolved)
  - Search by message, email, or page URL
- **Status workflow**: new → reviewed → resolved
- **Bulk actions**: Delete feedback entries
- **Detail modal**: View full feedback with metadata

### 5. **Rate Limiting**
- **In-memory rate limiter** for public feedback endpoint
- **Limit**: 10 submissions per 15 minutes per IP
- **Returns**: 429 Too Many Requests on limit exceeded
- **Note**: Not suitable for multi-instance deployments (needs Redis in production)

### 6. **Error Handling**
- **Structured JSON responses** for all errors
- **Proper HTTP status codes** (400, 401, 404, 409, 429, 500, 503)
- **User-friendly messages** vs. raw error details
- **Prisma error mapping**:
  - P2002 (unique constraint) → 409 Conflict
  - P2003 (foreign key) → 400 Bad Request
  - P2025 (record not found) → 404 Not Found
  - Connection errors → 503 Service Unavailable
- **Logging**: Error context logged to console

### 7. **CORS & Security**
- **CORS headers** on public endpoints (feedback, widget-config)
- **Allowed origins**: feedlyte.vercel.app + localhost:3000
- **OPTIONS preflight** support
- **Vary header**: Proper cache handling for CORS
- **XSS mitigation**: Content Security Policy (via Next.js defaults)
- **CSRF protection**: NextAuth.js built-in

---

## Complete Features (✓ Done)

### Dashboard & UI
- ✓ User registration with form validation
- ✓ User login with email/password
- ✓ Session persistence (JWT)
- ✓ Protected routes (redirect to login if not authenticated)
- ✓ Dark theme with Tailwind CSS
- ✓ Responsive sidebar navigation
- ✓ Loading states and error boundaries

### Projects
- ✓ Create projects with color + position + label
- ✓ View all projects in grid layout
- ✓ View project details (feedback stats, tabs)
- ✓ Edit project settings
- ✓ Delete project with confirmation
- ✓ Display unreviewed feedback count per project
- ✓ Embed code display with copy-to-clipboard

### Feedback
- ✓ Submit feedback from widget (public, rate-limited)
- ✓ View all feedback across projects
- ✓ View feedback per project
- ✓ Search feedback by message, email, URL
- ✓ Filter feedback by status (new, reviewed, resolved)
- ✓ View feedback details in modal
- ✓ Update feedback status
- ✓ Delete feedback
- ✓ Display metadata (email, page URL, user agent, timestamp)

### Widget
- ✓ Embeddable script loader (`widget.js`)
- ✓ Isolated iframe rendering
- ✓ Floating button with custom color
- ✓ Modal form (message + optional email)
- ✓ Success confirmation screen
- ✓ Dynamic resizing via postMessage
- ✓ Position control (bottom-left/right)
- ✓ Button label customization
- ✓ Live preview in dashboard

### Backend & Database
- ✓ Prisma ORM with Neon serverless
- ✓ NextAuth.js authentication
- ✓ API validation with Zod
- ✓ Rate limiting (in-memory)
- ✓ Error handling with context
- ✓ CORS support for public endpoints
- ✓ User ownership verification

---

## Incomplete / Placeholder Features (🔴 Not Done)

### Settings Page (Partially Complete)
The Settings page is **mostly a UI mockup** with non-functional features:

1. **Account Settings** (❌ Not Implemented)
   - Fields show: Name, Email
   - Button says "Save Changes" but does nothing
   - No actual update API endpoint
   - **TODO**: Build `PATCH /api/users/[id]` endpoint to update name

2. **Billing/Plan Info** (❌ Not Implemented)
   - Shows hardcoded "Pro" plan with mock limits
   - "Manage Billing" button is non-functional
   - No Stripe/payment integration
   - **TODO**: Integrate billing provider (Stripe, Lemonsqueezy, etc.)

3. **API Key Display** (❌ Not Implemented)
   - Displays masked API key (hardcoded placeholder)
   - No generation or rotation logic
   - No API key management interface
   - **TODO**: Implement API key CRUD with token generation/revocation

4. **Delete Account** (❌ Not Implemented)
   - Button exists but does nothing
   - No confirmation modal
   - No cascading deletion logic implemented
   - **TODO**: Add confirmation modal + DELETE `/api/users/[id]` endpoint

### Project Features (❌ Not Implemented)
1. **Project Name Editing** (Partially done)
   - Name can be set on creation
   - Cannot be edited via settings tab (UI exists but API not functional)
   - **TODO**: Test/verify PATCH endpoint for name updates

2. **Advanced Filtering** (❌ Not Implemented)
   - No date range filtering
   - No project filtering in "All Feedback" view
   - No export/download feedback (CSV, JSON)
   - **TODO**: Add more filter options and export functionality

### Widget Features (❌ Not Implemented)
1. **Widget Analytics** (❌ Not Implemented)
   - No tracking of widget impressions or submission rates
   - No funnel analysis
   - **TODO**: Add view/interaction tracking table and dashboard

2. **Custom Widget Styling** (⚠️ Partial)
   - Only color + position + label are configurable
   - No custom fonts, sizes, or animations
   - No dark/light mode toggle for widget
   - **TODO**: Extend widget customization options

### Email Notifications (❌ Not Implemented)
- No email sent when feedback is submitted
- No digest emails or alerts
- **TODO**: Integrate email service (SendGrid, Resend, etc.)

### Data Export (❌ Not Implemented)
- Cannot export feedback as CSV or JSON
- No bulk operations (select multiple, delete all, etc.)
- **TODO**: Add export and bulk action features

### Organization/Teams (❌ Not Implemented)
- Single user per project (no team collaboration)
- No role-based access control (RBAC)
- No shared projects
- **TODO**: Add team/organization support with invitations

### Webhook Integrations (❌ Not Implemented)
- No way to push feedback to Slack, Discord, etc.
- No custom webhooks
- **TODO**: Implement webhook delivery system

---

## Known Issues & Limitations

### 1. **Rate Limiter (In-Memory)**
- **Issue**: Rate limiter is in-memory only
- **Impact**: Resets on server restart; doesn't work on multi-instance Vercel deployments
- **Fix**: Integrate Redis or Upstash (free tier available)
- **Priority**: High (for production)

### 2. **Settings Page Non-Functional**
- **Issue**: Settings page is mostly UI without backend implementation
- **Components Affected**: Account update, billing, API key management, delete account
- **Fix**: Implement missing API endpoints and validation
- **Priority**: Medium (users expect these features)

### 3. **No Email Verification**
- **Issue**: Email verification tokens exist in schema but are not used
- **Current**: Any email is accepted on registration
- **Fix**: Add email verification step on signup
- **Priority**: Medium (security best practice)

### 4. **Widget Position Calculation**
- **Issue**: Widget position set globally per project, not per-page
- **Limitation**: Cannot show widget in different positions on different pages
- **Fix**: Allow position override via query parameter on script load
- **Priority**: Low (rare use case)

### 5. **No Pagination**
- **Issue**: All feedback loaded at once (no pagination)
- **Impact**: Performance degrades with large feedback volumes (100k+ entries)
- **Fix**: Add limit/offset pagination + infinite scroll or page-based navigation
- **Priority**: Medium (for large-scale usage)

### 6. **No Field Validation on Widget**
- **Issue**: Widget doesn't validate email format before submission
- **Impact**: Invalid emails accepted, stored in DB
- **Fix**: Add client-side email validation in widget before submission
- **Priority**: Low (server-side validation exists, but UX could improve)

### 7. **No Feedback Threading**
- **Issue**: Feedback is flat (no replies or context threads)
- **Limitation**: Cannot follow up with users or provide responses
- **Fix**: Add support for feedback threads with team responses
- **Priority**: Low (depends on use case)

### 8. **CORS Hardcoded**
- **Issue**: CORS allowed origins are hardcoded in API route
- **Impact**: Cannot easily support custom domains
- **Fix**: Make CORS origins configurable per project
- **Priority**: Medium (for multi-tenant usage)

---

## Running & Deployment

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (Neon serverless recommended)
- Environment variables set

### Environment Setup

Create `.env.local` in the project root:

```env
# Database (Neon serverless with HTTP pooler)
DATABASE_URL=postgresql://user:password@ep-xxx-pooler.region.neon.tech/dbname?sslmode=require

# NextAuth.js
NEXTAUTH_SECRET=your-secret-key-here (run `openssl rand -base64 32` to generate)
NEXTAUTH_URL=http://localhost:3000 (dev) or https://yourdomain.com (prod)
```

### Development

```bash
# Install dependencies
npm install

# Generate Prisma types
npx prisma generate

# Push schema to database (first time)
npx prisma db push

# (Optional) Seed database with test data
npx prisma db seed

# Start dev server
npm run dev

# Open browser
# → http://localhost:3000
```

### Build & Production

```bash
# Build for production (includes Prisma generation)
npm run build

# Start production server
npm start
```

### Deployment (Vercel)

```bash
# 1. Push code to GitHub
git push origin main

# 2. Connect repository to Vercel
# 3. Set environment variables in Vercel dashboard:
#    - DATABASE_URL (Neon connection string)
#    - NEXTAUTH_SECRET (strong random string)
#    - NEXTAUTH_URL (production domain)

# 4. Vercel auto-deploys on push to main
# 5. Migrations run automatically (via build hook)
```

### Database Migrations

```bash
# Create a migration
npx prisma migrate dev --name migration_name

# Apply pending migrations
npx prisma migrate deploy

# View migration status
npx prisma migrate status

# Reset database (dev only)
npx prisma migrate reset
```

---

## How It Works (High-Level Architecture)

### 1. **User Registers & Logs In**
```
User fills form → POST /api/auth/register → Password hashed → User created
User logs in → NextAuth credentials provider → JWT token issued → Stored in httpOnly cookie
```

### 2. **User Creates a Project**
```
Dashboard → New Project modal → POST /api/projects → Project created
Prisma writes to DB → UI updates with new project → User sees embed code
```

### 3. **Embed Code is Generated & Copied**
```
Copy button in dashboard → navigator.clipboard → Script tag copied to clipboard
Website owner pastes in their HTML → Script loads from feedlyte.vercel.app/widget.js
```

### 4. **Widget Loads on External Site**
```
Script executes on host page → Derive origin from script src → Create hidden iframe
Iframe loads /widget?project=ID&position=...&url=... → Isolated React app inside iframe
Widget renders floating button with custom color/label/position
```

### 5. **User Submits Feedback via Widget**
```
Widget button clicked → Modal opens → User types message → Optional email
Submit clicked → POST /api/feedback?project=ID → Rate limit checked
Zod validation → Project verified → Feedback created in DB → Success screen shown
postMessage sent to parent → Parent resizes iframe → Widget ready for next submission
```

### 6. **Dashboard Owner Manages Feedback**
```
Dashboard → Projects → Select project → Feedback tab → List of submissions
Filter by status/search → Click row to open detail modal → Update status or delete
Changes saved → UI updates via TanStack Query invalidation
```

---

## Key Code Patterns & Conventions

### Component Structure (React)
- **Functional components** with hooks
- **"use client" directive** for client-side interactivity
- **Props interface** for type safety
- **Local state** for forms, modals, tabs
- **TanStack Query** for async state (useQuery, useMutation)

### API Routes
- **File-based routing** in `src/app/api/`
- **Named exports**: `export async function GET/POST/PATCH/DELETE(req, { params })`
- **Promise-based params**: `const { id } = await params`
- **Zod validation** before processing
- **handleError()** wrapper for consistent error responses
- **NextResponse.json()** for responses

### Hooks Pattern
- **useQuery**: Fetch data on mount, auto-refetch
- **useMutation**: POST/PATCH/DELETE, with onSuccess callback
- **useQueryClient**: Invalidate queries after mutations
- **Custom hooks**: `useProjects()`, `useFeedback()`, etc.

### Database Queries
- **Prisma Client** for all queries
- **Relations**: `include: { _count: ... }` for counts
- **Ownership checks**: `where: { userId: session.user.id }`
- **Cascading deletes**: Configured in schema (`onDelete: Cascade`)

### Validation
- **Input validation**: Zod schemas for all API inputs
- **Type inference**: `z.infer<typeof schema>` for types
- **safeParse()**: Never throw, return result object
- **Error messages**: User-friendly, single issue returned

### Styling
- **Tailwind CSS utilities**: No CSS files needed
- **Dark theme**: CSS variables for semantic colors
- **Responsive**: Mobile-first with breakpoints
- **Component variants**: className arrays for conditional styles

---

## Development Workflow

### Adding a New Feature

1. **Database Change** (if needed)
   ```bash
   # Update prisma/schema.prisma
   npx prisma migrate dev --name add_feature
   ```

2. **API Endpoint** (if needed)
   ```
   src/app/api/feature/route.ts
   ├── Validation (Zod schema in lib/validations.ts)
   ├── Auth check (await auth())
   ├── Query/mutation (Prisma)
   └── Error handling (handleError)
   ```

3. **Hook** (for client-side data)
   ```
   src/hooks/use-feature.ts
   ├── Fetch helper (async function)
   ├── useQuery (read)
   ├── useMutation (write)
   ├── Query key
   └── Invalidation logic
   ```

4. **Component** (UI)
   ```
   src/components/feature/feature-component.tsx
   ├── "use client" directive
   ├── useState for local state
   ├── useQuery/useMutation from hook
   └── JSX rendering
   ```

5. **Page/Route** (if new page)
   ```
   src/app/(main)/feature/page.tsx
   ├── Client component wrapping
   └── Route integration
   ```

### Testing Workflow
- No automated tests currently (add with Jest + React Testing Library)
- Manual testing in dev server
- Browser DevTools for network requests
- Database inspection with `npx prisma studio`

---

## Next Steps & Recommendations

### High Priority (Before Production)
1. **Fix rate limiter** → Use Redis or Upstash
2. **Implement account settings** → Add PATCH /api/users endpoint
3. **Email verification** → Use SendGrid or Resend
4. **Add pagination** → Implement limit/offset or cursor-based pagination
5. **Improve widget CORS** → Make configurable per project
6. **Add tests** → Jest + React Testing Library for critical flows

### Medium Priority (Nice-to-Have)
1. **Team/organization support** → Multi-user project management
2. **Export feedback** → CSV/JSON download
3. **Webhooks** → Slack, Discord, custom integrations
4. **Dashboard analytics** → Charts, graphs, trends
5. **Email notifications** → Digest emails on new feedback
6. **Dark/light mode toggle** → Already styled, just needs theme provider
7. **Advanced filters** → Date ranges, multiple statuses, etc.

### Low Priority (Future)
1. **Feedback threads** → Allow team responses to feedback
2. **Widget analytics** → View/submission tracking
3. **Custom widget styling** → More customization options
4. **OAuth integration** → Sign in with Google/GitHub (schema ready)
5. **API documentation** → Swagger/OpenAPI spec
6. **Public feedback board** → Share feedback with customers

### Code Quality
1. Add ESLint rules (currently just has config)
2. Add TypeScript strict mode options
3. Extract magic strings to constants
4. Add JSDoc comments to complex functions
5. Improve error boundary components
6. Add loading skeletons for better UX

---

## File Checklist for Handover

- [x] `package.json` — Dependencies and scripts
- [x] `prisma/schema.prisma` — Database schema (complete)
- [x] `src/auth.ts` — NextAuth configuration
- [x] `src/app/api/` — All API routes (feedback, projects, auth, widget-config)
- [x] `src/components/` — All React components (auth, projects, feedback, settings, UI)
- [x] `src/hooks/` — React Query hooks
- [x] `src/lib/` — Utilities (validation, prisma, rate-limit, error handling)
- [x] `src/types/` — TypeScript interfaces
- [x] `public/widget.js` — Embeddable widget script
- [x] `.env.example` — Template for environment variables
- [x] `README.md` — User-facing overview

---

## Support & Questions

For questions about specific features:
- **API routes**: Check `src/app/api/` for request/response shapes
- **Components**: Check `src/components/` for props and state management
- **Database**: Check `prisma/schema.prisma` for relations and fields
- **Validation**: Check `src/lib/validations.ts` for input constraints
- **Errors**: Check `src/lib/api-helpers.ts` for error handling logic

Good luck with the handover! 🚀
