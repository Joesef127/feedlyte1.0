import crypto from "crypto";
import prisma from "@/lib/prisma";

// ── Constants ─────────────────────────────────────────────────────────────────

const RESET_TOKEN_EXPIRY_MS    = 60 * 60 * 1000;       // 1 hour
const VERIFY_TOKEN_EXPIRY_MS   = 24 * 60 * 60 * 1000;  // 24 hours

// Identifier prefixes keep reset and verify tokens from colliding
// since VerificationToken uses (identifier, token) as its unique key.
const RESET_PREFIX  = "reset:";
const VERIFY_PREFIX = "verify:";

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// ── Password Reset ────────────────────────────────────────────────────────────

/**
 * Creates a password reset token for the given email.
 * Deletes any existing reset token for the same email first.
 * Returns the raw token to be sent in the email URL.
 */
export async function createPasswordResetToken(email: string): Promise<string> {
  const identifier = `${RESET_PREFIX}${email}`;
  const rawToken   = generateToken();
  const hashedToken = hashToken(rawToken);
  const expires    = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);

  // Delete any existing reset token for this email
  await prisma.verificationToken.deleteMany({
    where: { identifier },
  });

  await prisma.verificationToken.create({
    data: { identifier, token: hashedToken, expires },
  });

  return rawToken;
}

/**
 * Validates a password reset token.
 * Returns the email address on success, null on failure.
 * Does NOT delete the token — deletion happens after the password is updated.
 */
export async function validatePasswordResetToken(
  rawToken: string
): Promise<string | null> {
  const hashedToken = hashToken(rawToken);

  const record = await prisma.verificationToken.findFirst({
    where: { token: hashedToken },
  });

  if (!record) return null;
  if (!record.identifier.startsWith(RESET_PREFIX)) return null;
  if (record.expires < new Date()) {
    // Clean up expired token
    await prisma.verificationToken.delete({
      where: { identifier_token: { identifier: record.identifier, token: hashedToken } },
    });
    return null;
  }

  return record.identifier.slice(RESET_PREFIX.length);
}

/**
 * Deletes a password reset token after successful use.
 */
export async function consumePasswordResetToken(rawToken: string): Promise<void> {
  const hashedToken = hashToken(rawToken);
  await prisma.verificationToken.deleteMany({ where: { token: hashedToken } });
}

// ── Email Verification ────────────────────────────────────────────────────────

/**
 * Creates an email verification token for the given email.
 * Replaces any existing verification token.
 * Returns the raw token to be sent in the email URL.
 */
export async function createEmailVerificationToken(email: string): Promise<string> {
  const identifier  = `${VERIFY_PREFIX}${email}`;
  const rawToken    = generateToken();
  const hashedToken = hashToken(rawToken);
  const expires     = new Date(Date.now() + VERIFY_TOKEN_EXPIRY_MS);

  await prisma.verificationToken.deleteMany({ where: { identifier } });

  await prisma.verificationToken.create({
    data: { identifier, token: hashedToken, expires },
  });

  return rawToken;
}

/**
 * Validates an email verification token.
 * Returns the email on success, null on failure.
 * Deletes the token on success (single use).
 */
export async function validateEmailVerificationToken(
  rawToken: string
): Promise<string | null> {
  const hashedToken = hashToken(rawToken);

  const record = await prisma.verificationToken.findFirst({
    where: { token: hashedToken },
  });

  if (!record) return null;
  if (!record.identifier.startsWith(VERIFY_PREFIX)) return null;
  if (record.expires < new Date()) {
    await prisma.verificationToken.delete({
      where: { identifier_token: { identifier: record.identifier, token: hashedToken } },
    });
    return null;
  }

  // Consume on success
  await prisma.verificationToken.delete({
    where: { identifier_token: { identifier: record.identifier, token: hashedToken } },
  });

  return record.identifier.slice(VERIFY_PREFIX.length);
}