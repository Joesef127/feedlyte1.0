import { randomBytes, createHash } from "crypto";

// A lightweight, single-purpose opaque token used to let an anonymous feedback
// submitter check the status of *that one submission* later — no account or
// session required. The plain token is only ever returned once, in the
// submission response body; only its hash is persisted, matching the pattern
// already used for password-reset/verification tokens.
const TRACKING_TOKEN_TTL_MS = 90 * 24 * 60 * 60 * 1000; // 90 days

export function generateTrackingToken(): { token: string; hash: string; expiresAt: Date } {
  const token = randomBytes(32).toString("hex");
  return {
    token,
    hash: hashTrackingToken(token),
    expiresAt: new Date(Date.now() + TRACKING_TOKEN_TTL_MS),
  };
}

export function hashTrackingToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
