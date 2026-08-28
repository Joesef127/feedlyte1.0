# Phase 4.3 API contract summary

## Public widget/config contract

Version: `v1`

### `GET /api/widget-config?project=<projectId>`

- Auth required: No
- Response shape:
  ```json
  {
    "version": "v1",
    "color": "#F59E0B",
    "position": "bottom-right",
    "label": "Feedback",
    "allowedOrigin": "https://app.example.com"
  }
  ```
- Headers:
  - `X-Feedlyte-Widget-Version: v1`
  - `Cache-Control` is left to framework defaults unless otherwise set

## Feedback API contract

Version: `v1`

### `GET /api/feedback`

- Auth required: Yes
- Pagination:
  - `limit` optional, bounded to 1..100
  - `cursor` optional, opaque ID from the previous page
  - `x-next-cursor` returned when another page exists
- Filters:
  - `status`, `q`
- Headers:
  - `X-Feedlyte-API-Version: v1`
  - `x-next-cursor` when applicable

### `POST /api/feedback?project=<projectId>`

- Auth required: No for public widget submissions
- CORS behavior:
  - request origin must match the project `allowedOrigin` when configured
  - fallback origins remain `https://feedlyte.vercel.app` and `http://localhost:3000`
- Rate limit headers:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`
- Headers:
  - `X-Feedlyte-API-Version: v1`
  - `Access-Control-Allow-Origin` when a CORS preflight or browser submission is allowed

## Error envelope

- Standard JSON error payloads provide `error` and `code` where available.
- Common codes: `BAD_REQUEST`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `SERVICE_UNAVAILABLE`, `INTERNAL_ERROR`.

## Compatibility note

The public widget config is versioned with a dedicated `version` field and header so that future breaking changes can be introduced in a new contract version without silently altering existing widget installs.