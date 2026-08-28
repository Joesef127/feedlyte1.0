# Phase 1.1 Threat Model and PII Rules

## Scope

This record covers credentials authentication, verification and reset links, authenticated dashboard APIs, public feedback ingestion, embedded widget frames, webhooks, exports, and the future account-scoped assistant.

## Trust Boundaries and Controls

| Surface | Primary risk | Current Phase 1.1 control | Follow-up |
| --- | --- | --- | --- |
| Registration and password reset | Account enumeration and token disclosure | Generic reset result; tokens are random, hashed at rest, expiring, and consumed after use; registration never returns verification tokens | Add provider-independent delivery telemetry in Module 5 |
| Email verification | Replay and resend abuse | Verification tokens are single use and expire after 24 hours; resend requires a session and is rate limited | Decide unverified sign-in policy before public launch |
| Authenticated API mutations | Cross-site request forgery | `src/proxy.ts` rejects cross-origin mutations for authenticated API routes | Add an explicit CSRF token only if future cross-origin authenticated clients are supported |
| Public feedback | Forged or abusive submissions | Per-project origin policy and input validation; CORS is not treated as authentication | Durable rate limits, quotas, CAPTCHA, and idempotency in Module 5 |
| Widget iframe | Clickjacking and message abuse | Widget routes permit framing; non-widget routes set `frame-ancestors 'self'` | Define and test the postMessage contract in Module 6 |
| Webhooks | SSRF, secret exposure, and delivery loss | HTTPS-only URLs and HMAC signatures | SSRF protection, encrypted/rotated secrets, and durable retries in Module 5 |
| Exports and assistant | Cross-account disclosure | Current owner-scoped reads | Workspace RBAC and account-scoped tools in Modules 3 and 9 |

## PII Handling Rules

Feedback messages, submitter email addresses, page URLs, user agents, webhook payloads, email logs, and exports are personal or potentially identifying data. Access is limited to the owning account under the current model. Do not log tokens, passwords, raw webhook secrets, or full feedback payloads in error output. Do not expose account lists or another account's profile through user routes.

Retention, deletion, export auditing, and webhook payload minimization remain scheduled for Modules 4, 5, and 7. Until those phases are complete, operators must treat database backups and delivery records as containing customer data.
