# Phase 6.1 widget requirements

This document defines the approved requirements for the Feedlyte widget runtime and the acceptance checks for the first rebuild slice.

## Product contract

The widget is a self-contained launcher and form that runs inside a sandboxed iframe on third-party pages. It must remain visually isolated from the host page and must communicate with the host page only through a narrow, validated `postMessage` contract.

## Required launcher states

The widget launcher and form must support these states and visible behaviors:

- `idle`: launcher visible, collapsed, ready for interaction.
- `hover`: visual feedback when the pointer is over the launcher.
- `focus`: keyboard focus ring is visible and meets contrast requirements.
- `open`: dialog form is visible and the launcher remains in a clear expanded state.
- `submitting`: primary action is disabled, loading text is shown, and repeated clicks are prevented.
- `success`: success state confirms submission and keeps the widget readable without host-page interference.
- `error`: validation or network problems show a specific, user-actionable message without exposing raw server internals.

## Required form behavior

- Message is required and limited to the product contract length.
- Email remains optional, but must validate as an email when present.
- Empty or invalid submissions must disable the primary action until the user corrects them.
- The form must support keyboard-only users, visible focus states, accessible labels, and a clear success/error tone.

## Layout and viewport requirements

- Width, position, and offset must remain mobile-safe and not cover critical page content or browser UI.
- The launcher must not overlap the host page in a way that blocks essential interactions.
- The iframe must keep a safe maximum width and height and must adjust to the viewport.
- The widget should prefer a bottom-right or bottom-left placement with predictable offset behavior.

## Theme and accessibility requirements

- Use color contrast that remains readable in dark/light contexts.
- Respect reduced motion preferences where animations are present.
- Keep all interactions keyboard-operable.
- Labels and messages must be available to screen readers.
- The widget should support future localization and right-to-left layouts without hard-coded assumptions.

## Anonymous and contact modes

- Anonymous feedback is supported when no email is provided.
- Optional contact mode is preserved when the field is left blank.
- No required email or account check is imposed in the widget flow.

## Network and retry requirements

- If the network request fails, the user must be informed clearly and given a retry path.
- Repeated submissions and duplicate events must be handled without silently corrupting the flow.
- The widget should treat offline or temporary failure states as recoverable, not as a fatal app state.

## Host isolation and message contract

- The iframe must send only a narrow `postMessage` payload including resize updates.
- The host page must ignore messages from unexpected origins.
- The widget must never assume the host page is trusted; all origin checks are required.
- Host-page CSS leakage must be prevented by the sandboxed iframe and isolated widget styling.

## Configuration versioning and caching

- The widget config route must return a versioned payload and version-aware headers.
- The public config must be centrally documented and compatible with widget.js.
- Cache behavior must be explicit and versioned to avoid stale widget definitions in production environments.

## Acceptance checks

The Phase 6.1 slice is considered complete only when:

1. the launcher state contract is documented and tested;
2. form validation and disabled/enabled behavior are covered by tests;
3. the widget remains accessible using keyboard and screen-reader semantics;
4. the host-page messaging contract remains limited to explicit origin and message checks.
