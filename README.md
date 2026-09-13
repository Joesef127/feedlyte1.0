# Feedlyte

> **Turn user insights into product momentum.**  
> A modern, lightweight, and customizable feedback widget paired with an intuitive management dashboard for web applications.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?style=flat-square&logo=postgresql)](https://neon.tech/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](#license)

---

## ✨ Overview

**Feedlyte** is an all-in-one feedback collection and triage platform designed for modern product teams, indie hackers, and developers. Easily embed an elegant feedback widget onto any website with a single line of JavaScript, capture structured user feedback, and manage customer ideas, bugs, and praise from a centralized dashboard.

Whether you're running a SaaS application, an e-commerce storefront, or a documentation site, Feedlyte delivers actionable user insights without disrupting your user experience.

---

## 🚀 Key Features

### 🎨 Customizable, Ultra-Lightweight Widget
- **Single-line embed:** Drop a lightweight `<script>` tag onto any site or web app.
- **Isolated sandbox:** Runs safely in a styled iframe to prevent CSS bleeding and interaction conflicts with host pages.
- **Full brand customization:** Configure accent colors, launcher icons, pill or button styles, corner radiuses, and toggle "Powered by Feedlyte" branding.
- **Accessible & responsive:** Complete keyboard navigation, screen-reader friendly live regions, mobile viewport adaptation, and dark mode support.

### 📝 Structured Feedback Collection
- **Multi-category triage:** Let users tag submissions as **Bug**, **Idea**, **Praise**, or **Question**.
- **Satisfaction rating:** Optional 1–5 star ratings to capture customer sentiment at a glance.
- **Collapsible technical details:** Allow users to optionally share browser, OS, viewport resolution, and current page URL to make bug reproduction effortless.
- **Public tracking links:** Generates a secure, one-time link for users to check the resolution status of their feedback without needing an account.

### 📊 Centralized Dashboard & Operations
- **Inbox view:** Filter, search, and review feedback submissions across all your projects.
- **Real-time webhooks:** Trigger external notifications (Slack, Discord, internal webhooks) with secure HMAC payload signing.
- **Automated email digests:** Stay informed with daily or weekly summary digests delivered straight to your inbox.
- **Durable delivery outbox:** Database-backed outbox architecture ensures no feedback notifications or webhooks are lost during downstream outages.

### 🛡️ Enterprise-Ready Security & Privacy
- **Origin-level access control:** Restrict widget submissions exclusively to your verified domain origins.
- **Smart anti-abuse:** Built-in honeypot detection, request body limits, and client-aware rate limiting.
- **Privacy-first:** Sanitized user data, encrypted transmission, and strict separation of visitor metadata.

---

## 🛠️ Quick Start Guide

### Step 1: Create a Project
Log in to your Feedlyte dashboard and click **New Project**. Enter your project name and the allowed domain URL where your widget will be hosted (e.g., `https://example.com`).

### Step 2: Configure Widget Settings
From the **Widget Features** tab in your project dashboard, enable the capabilities that fit your workflow:
- Categorization (Bug, Idea, Praise, Question)
- 1–5 Star Rating
- Technical Context Checklist (Browser, OS, Viewport, URL)
- Brand Colors, Corner Radiuses, and Launcher Icon Style

### Step 3: Embed the Widget on Your Site
Copy your generated embed snippet and paste it right before the closing `</body>` tag on your website:

```html
<!-- Feedlyte Feedback Widget -->
<script 
  src="https://your-feedlyte-domain.com/widget.js" 
  data-project="YOUR_PROJECT_ID"
  defer>
</script>
```

#### Framework Examples

<details>
<summary><strong>Next.js (App Router)</strong></summary>

```tsx
import Script from "next/script";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script
          src="https://your-feedlyte-domain.com/widget.js"
          data-project="YOUR_PROJECT_ID"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
```
</details>

<details>
<summary><strong>React (SPA)</strong></summary>

```tsx
import { useEffect } from "react";

export function FeedbackWidget() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://your-feedlyte-domain.com/widget.js";
    script.setAttribute("data-project", "YOUR_PROJECT_ID");
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return null;
}
```
</details>

---

## ⚙️ Widget Embed Options

You can fine-tune the widget directly from HTML attributes on the script tag:

| Attribute | Type | Default | Description |
|---|---|---|---|
| `data-project` | `string` | **Required** | Your unique Feedlyte Project ID. |
| `data-position` | `string` | `bottom-right` | Placement on screen: `bottom-right` or `bottom-left`. |
| `data-color` | `string` | Project accent | Hex color code override for the widget launcher button. |
| `data-label` | `string` | `Feedback` | Text label displayed next to the launcher icon. |

---

## 💻 Self-Hosting & Local Development

If you are deploying your own Feedlyte instance or contributing to the platform, follow the setup instructions below.

### Prerequisites
- **Node.js**: v20+ LTS
- **Package Manager**: `npm`
- **Database**: PostgreSQL database (Neon serverless recommended)

### 1. Clone & Install

```bash
git clone https://github.com/your-username/feedlyte.git
cd feedlyte
npm install
```

### 2. Configure Environment

Copy the example environment template and configure your connection credentials:

```bash
cp .env.example .env
```

Key environment configuration:
- `DATABASE_URL`: Connection string for PostgreSQL database.
- `AUTH_SECRET`: Secret key used for session encryption and signing.
- `NEXTAUTH_URL`: Canonical root URL of your Feedlyte instance (e.g., `http://localhost:3000`).
- `RESEND_API_KEY`: API key for email delivery and notification digests (optional in dev).
- `CRON_SECRET`: Secret key for authorizing automated digest cron triggers.

Validate your environment configuration at any time:
```bash
node scripts/validate-env.mjs
```

### 3. Initialize Database & Run

```bash
# Push database schema
npx prisma db push

# Start the local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to access Feedlyte.

---

## 🧪 Testing & Verification

Feedlyte includes a test suite covering unit logic, API contracts, security rules, and end-to-end browser accessibility.

```bash
# Run unit and integration tests (Vitest)
npm test

# Run TypeScript compilation check
npm run typecheck

# Run linter
npm run lint

# Run end-to-end widget browser tests (Playwright)
npx playwright test
```

---

## 🔒 Security & Reliability

- **SSRF Defenses:** Webhook delivery checks DNS destinations to block loopback, private, link-local, and cloud metadata targets.
- **Fail-Safe Deliveries:** Feedback submissions are persisted directly to the database before outbound email and webhook tasks are queued via an atomic outbox pattern.
- **Cryptographic Signatures:** Outbound webhooks include standard HMAC SHA-256 signatures for recipient verification.
- **Secure Anonymous Tracking:** Anonymous submitters receive a cryptographically generated token hash for one-time status lookup without exposing internal project or user IDs.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
