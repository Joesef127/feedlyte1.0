# Feedlyte 1.0 - Priority Todo List

## 🔴 Critical Issues (Fix Before Production)

### 1. Rate Limiter - Redis/Upstash Integration
- **Current Issue**: In-memory rate limiter resets on server restart
- **Impact**: Doesn't work on multi-instance Vercel deployments
- **Solution**: Integrate Redis or Upstash (free tier available)
- **Affected Components**: `src/lib/rate-limit.ts`
- **Priority**: CRITICAL for production
- [ ] Replace in-memory limiter with Redis/Upstash
- [ ] Test with multiple server instances
- [ ] Update environment variables documentation

### 2. Settings Page - Backend Implementation
- **Current Issue**: UI exists but non-functional
- **Affected Features**: Account settings, billing, API keys, delete account
- **Priority**: CRITICAL - users expect these features
- [ ] Build `PATCH /api/users/[id]` endpoint for account updates
- [ ] Build `DELETE /api/users/[id]` endpoint with confirmation
- [ ] Implement cascading deletion logic

### 3. Email Verification (Security)
- **Current Issue**: Email verification tokens exist but aren't used
- **Current Behavior**: Any email accepted on registration
- **Solution**: Add verification step on signup
- **Priority**: CRITICAL security best practice
- [ ] Implement email verification flow
- [ ] Integrate email service (SendGrid/Resend)
- [ ] Create verification token management
- [ ] Block login until email verified

### 4. Add Pagination
- **Current Issue**: All feedback loaded at once
- **Impact**: Performance degrades with 100k+ feedback entries
- **Solution**: Implement limit/offset or cursor-based pagination
- **Priority**: CRITICAL for scalability
- [ ] Add pagination logic to feedback API endpoint
- [ ] Implement frontend pagination/infinite scroll UI
- [ ] Test with large datasets

---

## 🟠 High Priority (Before Public Release)

### 5. Make CORS Configurable Per Project
- **Current Issue**: Allowed origins are hardcoded in API routes
- **Impact**: Cannot easily support custom domains
- **Solution**: Store CORS settings per project in database
- **Affected Components**: API feedback, widget routes
- [ ] Add CORS configuration to Project schema (if needed)
- [ ] Create endpoint to update CORS settings
- [ ] Update API routes to check project-specific CORS
- [ ] Test with multiple custom domains

### 6. Email Notifications
- **Current Issue**: No emails sent on feedback submission
- **Solution**: Integrate email service (SendGrid/Resend)
- [ ] Set up email service integration
- [ ] Create email templates for feedback alerts
- [ ] Implement email sending on new feedback
- [ ] Add optional email digest feature
- [ ] Create email unsubscribe mechanism

### 7. Project Name Editing
- **Current Issue**: Name can be set on creation but not edited
- **UI Status**: Settings tab exists but API not functional
- [ ] Test/verify existing PATCH endpoint
- [ ] Create/fix frontend component for name editing
- [ ] Add validation for project names
- [ ] Test with special characters and edge cases

### 8. Add Automated Tests
- **Current Issue**: No automated tests (manual testing only)
- **Recommended**: Jest + React Testing Library for critical flows
- [ ] Set up Jest configuration
- [ ] Set up React Testing Library
- [ ] Create tests for authentication flow
- [ ] Create tests for feedback submission
- [ ] Create tests for project management
- [ ] Set up CI/CD test pipeline

### 9. Advanced Feedback Filtering
- **Current Issue**: No date range, project, or status filtering
- **Missing Features**: Search, export (CSV/JSON)
- [ ] Add date range filter UI
- [ ] Add status filter UI
- [ ] Add project filter in "All Feedback" view
- [ ] Implement backend filtering logic
- [ ] Add CSV export functionality
- [ ] Add JSON export functionality
- [ ] Test with large datasets

### 10. Widget Email Validation
- **Current Issue**: No client-side email validation
- **Impact**: Invalid emails accepted and stored
- **Note**: Server-side validation exists, but UX can improve
- [ ] Add client-side email format validation in widget
- [ ] Add visual feedback for invalid emails
- [ ] Test with various invalid formats

---

## 🟡 Medium Priority (Nice-to-Have)

### 11. API Key Management
- **Current Issue**: Displays hardcoded masked API key
- **Missing**: Generation, rotation, and management logic
- [ ] Implement API key generation
- [ ] Create API key storage in database
- [ ] Build API key revocation feature
- [ ] Create API key management UI
- [ ] Add rate limiting per API key
- [ ] Document API key usage

### 12. Delete Account Functionality
- **Current Issue**: Button exists but does nothing
- **Missing**: Confirmation modal, cascading deletion
- [ ] Create confirmation modal component
- [ ] Implement account deletion endpoint
- [ ] Add cascading deletion for user's projects and feedback
- [ ] Add audit logging for deletions
- [ ] Send confirmation email after deletion

### 13. Widget Custom Styling
- **Current Limitations**: Only color, position, and label configurable
- **Missing**: Fonts, sizes, animations, dark/light mode
- [ ] Add font selection options
- [ ] Add size customization
- [ ] Add animation options
- [ ] Add dark/light mode toggle for widget
- [ ] Create widget preview with all options
- [ ] Store styling preferences in database

### 14. Widget Analytics
- **Current Issue**: No tracking of impressions or submission rates
- **Missing**: View tracking, interaction tracking, funnel analysis
- [ ] Add widget view tracking table to schema
- [ ] Implement view tracking on widget load
- [ ] Track submission rates and success/failure
- [ ] Create analytics dashboard
- [ ] Add funnel analysis
- [ ] Add conversion rate metrics

### 15. Team/Organization Support
- **Current Limitation**: Single user per project (no collaboration)
- **Missing**: Role-based access control (RBAC), team invitations
- [ ] Add Organization model to schema
- [ ] Add Team/Organization management endpoints
- [ ] Implement role-based access control
- [ ] Create team invitation system
- [ ] Build team member management UI
- [ ] Test with multiple users and roles

### 16. Webhook Integrations
- **Current Issue**: No way to push feedback to Slack, Discord, etc.
- **Missing**: Webhook delivery system, custom webhooks
- [ ] Add webhooks table to schema
- [ ] Create webhook management endpoints
- [ ] Implement webhook payload formatting
- [ ] Add Slack webhook integration
- [ ] Add Discord webhook integration
- [ ] Add custom webhook support
- [ ] Implement webhook delivery retry logic
- [ ] Add webhook event logging

### 17. Data Export & Bulk Operations
- **Current Issue**: Cannot export or perform bulk operations
- **Missing**: CSV/JSON export, bulk delete, bulk status update
- [ ] Implement CSV export for feedback
- [ ] Implement JSON export for feedback
- [ ] Add bulk delete functionality
- [ ] Add bulk status update functionality
- [ ] Create export scheduling (scheduled exports)
- [ ] Add export history/archives

### 18. Feedback Threading
- **Current Issue**: Feedback is flat (no replies or context)
- **Limitation**: Cannot follow up with users or provide responses
- [ ] Add reply/thread support to schema
- [ ] Create nested comment UI component
- [ ] Implement thread management endpoints
- [ ] Add notification for new replies
- [ ] Create rich text editor for responses
- [ ] Add @mention support for team collaboration

---

## 🔵 Code Quality Improvements

### 19. ESLint Configuration
- **Current State**: Config exists but rules not enabled
- [ ] Enable recommended ESLint rules
- [ ] Add TypeScript ESLint rules
- [ ] Configure import sorting rules
- [ ] Add accessibility rules
- [ ] Configure pre-commit hooks

### 20. TypeScript Strict Mode
- **Current State**: Not in strict mode
- [ ] Enable `strict` mode in tsconfig.json
- [ ] Fix all strict mode violations
- [ ] Enable `noImplicitAny`
- [ ] Enable `noImplicitThis`
- [ ] Enable `strictNullChecks`

### 21. Code Documentation
- [ ] Add JSDoc comments to complex functions
- [ ] Document all API endpoints
- [ ] Create inline comments for business logic
- [ ] Improve error boundary components
- [ ] Add function return type documentation

### 22. UI/UX Improvements
- [ ] Add loading skeletons for better UX
- [ ] Improve error messages for users
- [ ] Add success notifications
- [ ] Standardize form validation messages
- [ ] Add empty state messages

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
