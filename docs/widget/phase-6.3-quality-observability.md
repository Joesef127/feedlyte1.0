# Phase 6.3: Widget quality and observability

## Browser acceptance

The committed Playwright suite in `e2e/widget.spec.ts` runs against a production Next bundle and covers:

- a host page with restrictive global CSS and a restrictive same-origin CSP;
- iframe CSS isolation and host-content preservation;
- keyboard focus transfer into the panel and restoration to the launcher;
- mobile viewport bounds;
- desktop and mobile screenshots;
- axe checks for the host page.

Run the suite with `npm run test:e2e`. Install the local browser prerequisite once with `npm run test:e2e:install`.

The widget iframe is intentionally excluded from the host axe tree because it is a separate document. Manual review must still cover the iframe with keyboard and screen-reader tooling.

## Measurements

The loader and iframe expose opt-in, non-PII metrics only when the embed includes `data-telemetry="true"`:

- `load`: the iframe load event;
- `open`: time from launcher activation to the next animation frame;
- `submission_success`: submission duration;
- `submission_failure`: failed submission count.

Metrics are delivered as `feedlyte:metric` events on the embedding window. They include only a fixed event name and optional duration. No message text, email address, URL, user agent, project identifier, or host content is transmitted. Consumers are responsible for aggregation, retention, access control, and consent.

The loader also reports its bundle size through the deployment artifact. Measure `public/widget.js` with the deployment pipeline and record compressed transfer size alongside the browser results.

## Manual review checklist

- Tab to the launcher, open the form, submit validation errors, and close with Escape.
- Confirm focus is visible and returns to the launcher after close.
- Confirm screen readers announce validation, failure, and success live regions.
- Check light/dark themes, reduced motion, and RTL presentation.
- Test on a narrow mobile viewport with browser zoom enabled.
- Verify the host page's typography, stacking, and form styles do not alter the iframe.
- Verify no telemetry is emitted unless `data-telemetry="true"` is present.

## Known environment requirement

The browser suite requires a local Chromium installation and a production build. Database-backed widget configuration is optional for the host fixture; the fixture supplies safe installation-level defaults and the config request may return an expected local configuration error when no database environment is present.
