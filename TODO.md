# Feedlyte active backlog

This file is intentionally short and intentionally tied to the master roadmap in [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md). The plan is the source of truth for sequencing and completion criteria.

## Done

- Basic auth flow with credentials registration, login, and session handling
- Email verification and password reset routes with token generation and delivery
- Project CRUD and project ownership checks
- Public feedback submission with CORS-aware validation
- Authenticated feedback list/detail/update/delete APIs
- Webhook creation, HMAC signing, and delivery tracking
- Notification email and digest features
- Dashboard analytics and project detail views
- A working widget loader and isolated widget UI
- Test suite baseline and environment-validation guardrails

## Partial

- Durable, distributed rate limiting for widget and auth endpoints
- Strong tenant/workspace authorization model
- CI/CD workflow and deployment smoke checks
- Security headers and CSP/csrf hardening for browser-authenticated routes
- Key operational docs for rollback, backups, retention, and incident response
- Performance work for pagination and bounded analytics

## Blocked

- Workspace/teams/role model and membership migration
- Account-scoped AI assistant and permission-aware context
- Public ingestion abuse controls beyond origin checks
- Webhook SSRF protection and secret handling hardening
- Owned audit log and retention policy

## Deferred

- Billing and subscription flows
- Broad public feedback board features and growth integrations
- Advanced AI integrations beyond the scoped assistant work

## Removed / superseded

- Old stale backlog items that described the project as missing basic tests, hooks, webhooks, or email support. Those items have been marked as shipped or replaced by the current plan.

## Active work

The current priority phase is Module 0, Phase 0.2: make the repository docs truthful and actionable. After that, the next implementation work continues in Module 1 with security and quality baseline hardening.

### 23. Magic String Extraction
- [ ] Identify all hardcoded strings
- [ ] Create constants file for app-wide strings
- [ ] Create error message constants
- [ ] Create validation message constants
- [ ] Update imports throughout codebase

### 24. API Documentation
- [ ] Create Swagger/OpenAPI specification
- [ ] Document all endpoints
- [ ] Document request/response schemas
- [ ] Document authentication requirements
- [ ] Create postman collection

---

## 💡 Low Priority (Future Enhancements)

### 25. Public Feedback Board
- Display customer feedback publicly
- Allow customers to see their feedback status
- Add voting/upvoting for feedback requests

### 26. OAuth Integration
- **Note**: Schema already has OAuth fields
- [ ] Implement Google OAuth
- [ ] Implement GitHub OAuth
- [ ] Test OAuth flows

### 27. Dashboard Analytics
- [ ] Add feedback trends charts
- [ ] Add submission rate graphs
- [ ] Add response time analytics
- [ ] Create custom date range analytics
- [ ] Add comparison views (month-to-month, etc.)

### 28. Dark/Light Mode Toggle
- **Note**: Already styled with CSS variables
- [ ] Add theme toggle component
- [ ] Persist user theme preference
- [ ] Test theme switching

### 29. Widget Position Per Page
- **Current Limitation**: Position set globally per project
- **Enhancement**: Allow position override via query parameter
- [ ] Add query parameter support in widget script
- [ ] Create position override logic
- [ ] Document query parameter usage

### 30. Advanced Widget Features
- [ ] Add multi-language support for widget
- [ ] Add conditional field display
- [ ] Add file upload to feedback
- [ ] Add rating/satisfaction scale
- [ ] Add custom field builder

---

## 📊 Summary by Category

| Category | Count | Status |
|----------|-------|--------|
| Critical (Must fix) | 4 | ⏳ Pending |
| High Priority | 6 | ⏳ Pending |
| Medium Priority | 8 | ⏳ Pending |
| Code Quality | 6 | ⏳ Pending |
| Low Priority | 6 | ⏳ Pending |
| **TOTAL** | **30** | |

---

## 🎯 Recommended Implementation Order

1. **Week 1-2**: Fix critical issues (Rate limiter, Settings backend, Email verification, Pagination)
2. **Week 3**: High priority features (CORS, Email notifications, Project editing, Testing)
3. **Week 4**: Medium priority (API keys, Delete account, Filtering, Analytics)
4. **Week 5+**: Nice-to-have features and code quality improvements

---

## 📝 Notes

- Tasks are organized by priority and category
- Check boxes can be copied and tracked in commits
- Each task includes context and affected components
- Integration choices (email service, Redis, etc.) should be evaluated for your use case
