/**
 * Authentication API Service
 * Centralized API calls for authentication-related operations
 */

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  id: string;
  name: string;
  email: string;
  token: string;
}

export interface PasswordResetPayload {
  email: string;
}

export interface PasswordResetTokenPayload {
  token: string;
  password: string;
}

export interface VerifyEmailPayload {
  token: string;
}

// ─── Registration ────────────────────────────────────────────────────────────

/**
 * Register a new user
 * Sends a verification email to the provided address
 */
export async function register(
  payload: RegisterPayload
): Promise<RegisterResponse> {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error ?? "Registration failed");
  }

  return res.json();
}

// ─── Password Reset ──────────────────────────────────────────────────────────

/**
 * Request a password reset
 * Sends a reset email to the provided address
 */
export async function requestPasswordReset(
  payload: PasswordResetPayload
): Promise<{ message: string }> {
  const res = await fetch("/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error ?? "Failed to request password reset");
  }

  return res.json();
}

/**
 * Reset password with token
 */
export async function resetPassword(
  payload: PasswordResetTokenPayload
): Promise<{ message: string }> {
  const res = await fetch("/api/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error ?? "Failed to reset password");
  }

  return res.json();
}

// ─── Email Verification ──────────────────────────────────────────────────────

/**
 * Verify email address with token
 */
export async function verifyEmail(token: string): Promise<{ message: string }> {
  const res = await fetch("/api/auth/verify-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error ?? "Failed to verify email");
  }

  return res.json();
}
