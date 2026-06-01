import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Sender address — onboarding key only allows this domain
// const FROM = process.env.RESEND_FROM_EMAIL;

export interface SendEmailResult {
  success: boolean;
  error?: string;
}

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string
): Promise<SendEmailResult> {
  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to,
      subject: "Reset your Feedlyte password",
      html: passwordResetTemplate(resetUrl),
    });
    return { success: true };
  } catch (e) {
    console.error("[email] sendPasswordResetEmail failed", e);
    return { success: false, error: "Failed to send email." };
  }
}

export async function sendVerificationEmail(
  to: string,
  verifyUrl: string
): Promise<SendEmailResult> {
  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to,
      subject: "Verify your Feedlyte email address",
      html: verificationTemplate(verifyUrl),
    });
    return { success: true };
  } catch (e) {
    console.error("[email] sendVerificationEmail failed", e);
    return { success: false, error: "Failed to send email." };
  }
}

// ── Email Templates ───────────────────────────────────────────────────────────

function baseTemplate(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Feedlyte</title>
</head>
<body style="margin:0;padding:0;background:#080808;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#080808;padding:48px 24px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">

          <!-- Logo -->
          <tr>
            <td style="padding-bottom:32px;text-align:center;">
              <span style="font-size:20px;font-weight:700;color:#f0ede8;letter-spacing:-0.03em;">
                &#9632; Feedlyte
              </span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#0f0f0f;border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:40px 36px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:24px;text-align:center;">
              <p style="margin:0;font-size:12px;color:rgba(240,237,232,0.25);">
                Feedlyte &mdash; Feedback infrastructure for modern products.
              </p>
              <p style="margin:6px 0 0;font-size:12px;color:rgba(240,237,232,0.2);">
                If you did not request this email, you can safely ignore it.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function passwordResetTemplate(resetUrl: string): string {
  return baseTemplate(`
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#f0ede8;letter-spacing:-0.02em;">
      Reset your password
    </h1>
    <p style="margin:0 0 28px;font-size:15px;color:rgba(240,237,232,0.55);line-height:1.6;">
      We received a request to reset the password for your Feedlyte account.
      Click the button below to set a new password. This link expires in
      <strong style="color:#f59e0b;">1 hour</strong>.
    </p>
    <a
      href="${resetUrl}"
      style="display:inline-block;background:#f59e0b;color:#0a0a0a;font-size:14px;font-weight:700;padding:13px 28px;border-radius:10px;text-decoration:none;letter-spacing:0.02em;"
    >
      Reset Password
    </a>
    <p style="margin:28px 0 0;font-size:13px;color:rgba(240,237,232,0.3);line-height:1.6;">
      Or copy and paste this URL into your browser:<br/>
      <span style="color:rgba(240,237,232,0.45);word-break:break-all;">${resetUrl}</span>
    </p>
  `);
}

function verificationTemplate(verifyUrl: string): string {
  return baseTemplate(`
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#f0ede8;letter-spacing:-0.02em;">
      Verify your email
    </h1>
    <p style="margin:0 0 28px;font-size:15px;color:rgba(240,237,232,0.55);line-height:1.6;">
      Thanks for signing up for Feedlyte. Click the button below to verify
      your email address and activate your account. This link expires in
      <strong style="color:#f59e0b;">24 hours</strong>.
    </p>
    <a
      href="${verifyUrl}"
      style="display:inline-block;background:#f59e0b;color:#0a0a0a;font-size:14px;font-weight:700;padding:13px 28px;border-radius:10px;text-decoration:none;letter-spacing:0.02em;"
    >
      Verify Email Address
    </a>
    <p style="margin:28px 0 0;font-size:13px;color:rgba(240,237,232,0.3);line-height:1.6;">
      Or copy and paste this URL into your browser:<br/>
      <span style="color:rgba(240,237,232,0.45);word-break:break-all;">${verifyUrl}</span>
    </p>
  `);
}