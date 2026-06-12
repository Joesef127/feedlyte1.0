import { Resend } from "resend";
import { createEmailVerificationToken, validateEmailVerificationToken } from "@/lib/tokens";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

const TO = process.env.EMAIL_TO || "Adegboladayor@gmail.com";

export interface SendEmailResult {
  success: boolean;
  error?: string;
}

// Generate unsubscribe token (reuse token mechanism)
export async function createUnsubscribeToken(projectId: string): Promise<string> {
  return createEmailVerificationToken(`unsubscribe:${projectId}`);
}

export async function validateUnsubscribeToken(token: string): Promise<string | null> {
  const projectId = await validateEmailVerificationToken(token);
  return projectId?.startsWith("unsubscribe:") ? projectId.slice(12) : null;
}

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
): Promise<SendEmailResult> {
  const { data, error } = await resend.emails.send({
    from: FROM,
    to: "adegboladayor@gmail.com",
    subject: "Reset your Feedlyte password",
    html: passwordResetTemplate(resetUrl),
  });

  if (error) {
    console.error("[email] sendPasswordResetEmail failed", error);
    return { success: false, error: "Failed to send email." };
  }

  console.log("[email] Password reset email sent", { id: data?.id });
  return { success: true };
}

export async function sendVerificationEmail(
  to: string,
  verifyUrl: string,
): Promise<SendEmailResult> {
  const { data, error } = await resend.emails.send({
    from: FROM,
    to: TO,
    subject: "Verify your Feedlyte email address",
    html: verificationTemplate(verifyUrl),
  });

  if (error) {
    console.error("[email] sendVerificationEmail failed", error);
    return { success: false, error: "Failed to send email." };
  }

  console.log("[email] Verification email sent", { id: data?.id });
  return { success: true };
}

function parseUserAgent(ua: string): { browser: string; os: string } {
  if (!ua) return { browser: "Unknown", os: "Unknown" };
  const browser = ua.includes("Edg/")
    ? "Edge"
    : ua.includes("Chrome/")
      ? "Chrome"
      : ua.includes("Firefox/")
        ? "Firefox"
        : ua.includes("Safari/")
          ? "Safari"
          : "Unknown";
  const os = ua.includes("Windows NT")
    ? "Windows"
    : ua.includes("Mac OS X")
      ? "macOS"
      : ua.includes("Android")
        ? "Android"
        : ua.includes("iPhone")
          ? "iOS"
          : "Unknown";
  return { browser, os };
}

// NEW: Immediate notification email
export async function sendFeedbackNotificationEmail(
  to: string,
  projectName: string,
  feedback: {
    message: string;
    email?: string | null;
    pageUrl?: string | null;
    userAgent?: string | null;
    createdAt: string;
  },
  dashboardUrl: string,
  unsubscribeUrl: string
): Promise<SendEmailResult> {
  const { browser, os } = parseUserAgent(feedback.userAgent || "");
  
  const { data, error } = await resend.emails.send({
    from: FROM,
    to,
    subject: `New feedback on ${projectName}`,
    html: feedbackNotificationTemplate(projectName, feedback, browser, os, dashboardUrl, unsubscribeUrl),
  });

  if (error) {
    console.error("[email] sendFeedbackNotificationEmail failed", error);
    return { success: false, error: "Failed to send email." };
  }
  return { success: true };
}

// NEW: Daily digest email with unsubscribe link
export async function sendDailyDigestEmail(
  to: string,
  projectName: string,
  feedbackItems: Array<{
    message: string;
    email?: string | null;
    pageUrl?: string | null;
    userAgent?: string | null;
    status: string;
    createdAt: string;
  }>,
  dashboardUrl: string,
  unsubscribeUrl: string
): Promise<SendEmailResult> {
  const { data, error } = await resend.emails.send({
    from: FROM,
    to,
    subject: `Daily digest: ${feedbackItems.length} new feedback item(s) on ${projectName}`,
    html: dailyDigestTemplate(projectName, feedbackItems, dashboardUrl, unsubscribeUrl),
  });

  if (error) {
    console.error("[email] sendDailyDigestEmail failed", error);
    return { success: false, error: "Failed to send email." };
  }
  return { success: true };
}

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
          <tr>
            <td style="padding-bottom:32px;text-align:center;">
              <span style="font-size:20px;font-weight:700;color:#f0ede8;letter-spacing:-0.03em;">
                &#9632; Feedlyte
              </span>
            </td>
          </tr>
          <tr>
            <td style="background:#0f0f0f;border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:40px 36px;">
              ${content}
            </td>
          </tr>
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
    <a href="${resetUrl}" style="display:inline-block;background:#f59e0b;color:#0a0a0a;font-size:14px;font-weight:700;padding:13px 28px;border-radius:10px;text-decoration:none;letter-spacing:0.02em;">
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
    <a href="${verifyUrl}" style="display:inline-block;background:#f59e0b;color:#0a0a0a;font-size:14px;font-weight:700;padding:13px 28px;border-radius:10px;text-decoration:none;letter-spacing:0.02em;">
      Verify Email Address
    </a>
    <p style="margin:28px 0 0;font-size:13px;color:rgba(240,237,232,0.3);line-height:1.6;">
      Or copy and paste this URL into your browser:<br/>
      <span style="color:rgba(240,237,232,0.45);word-break:break-all;">${verifyUrl}</span>
    </p>
  `);
}

function feedbackNotificationTemplate(
  projectName: string,
  feedback: { message: string; email?: string | null; pageUrl?: string | null; createdAt: string },
  browser: string,
  os: string,
  dashboardUrl: string,
  unsubscribeUrl: string
): string {
  return baseTemplate(`
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#f0ede8;letter-spacing:-0.02em;">
      New Feedback Received
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:rgba(240,237,232,0.55);line-height:1.6;">
      You received new feedback on <strong>${projectName}</strong>.
    </p>
    
    <div style="background:#0f0f0f;border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:24px;margin:24px 0;">
      <p style="margin:0 0 16px;font-size:15px;color:#f0ede8;line-height:1.6;white-space:pre-wrap;">${feedback.message}</p>
      
      <div style="font-size:13px;color:rgba(240,237,232,0.5);line-height:2;">
        ${feedback.email ? `<div>📧 ${feedback.email}</div>` : ""}
        ${feedback.pageUrl ? `<div>🌐 ${feedback.pageUrl}</div>` : ""}
        <div>🖥 ${browser} / ${os}</div>
        <div>🕐 ${new Date(feedback.createdAt).toLocaleString()}</div>
      </div>
    </div>
    
    <a href="${dashboardUrl}" style="display:inline-block;background:#f59e0b;color:#0a0a0a;font-size:14px;font-weight:700;padding:13px 28px;border-radius:10px;text-decoration:none;letter-spacing:0.02em;">
      View in Dashboard
    </a>
    
    <p style="margin:24px 0 0;font-size:12px;color:rgba(240,237,232,0.3);text-align:center;">
      <a href="${unsubscribeUrl}" style="color:#f59e0b;">Unsubscribe from feedback emails</a>
    </p>
  `);
}

function dailyDigestTemplate(
  projectName: string,
  items: Array<{ message: string; email?: string | null; pageUrl?: string | null; status: string; createdAt: string }>,
  dashboardUrl: string,
  unsubscribeUrl: string
): string {
  const statusColors: Record<string, string> = {
    unreviewed: "#f59e0b",
    reviewed: "#3b82f6",
    resolved: "#22c55e",
  };
  
  const itemsHtml = items.map(item => `
    <div style="background:#0f0f0f;border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:16px;margin:12px 0;">
      <p style="margin:0 0 8px;font-size:14px;color:#f0ede8;line-height:1.5;">${item.message}</p>
      <div style="font-size:12px;color:rgba(240,237,232,0.5);display:flex;gap:16px;flex-wrap:wrap;">
        ${item.email ? `<span>📧 ${item.email}</span>` : ""}
        ${item.pageUrl ? `<span>🌐 ${new URL(item.pageUrl).pathname}</span>` : ""}
        <span style="background:${statusColors[item.status] || "#666"}20;color:${statusColors[item.status] || "#666"};padding:2px 8px;border-radius:4px;font-weight:600;text-transform:capitalize;">${item.status}</span>
        <span>🕐 ${new Date(item.createdAt).toLocaleString()}</span>
      </div>
    </div>
  `).join("");

  return baseTemplate(`
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#f0ede8;letter-spacing:-0.02em;">
      Daily Feedback Digest
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:rgba(240,237,232,0.55);line-height:1.6;">
      <strong>${items.length}</strong> new feedback item${items.length !== 1 ? "s" : ""} received on <strong>${projectName}</strong> yesterday.
    </p>
    
    ${itemsHtml}
    
    <div style="text-align:center;margin-top:32px;">
      <a href="${dashboardUrl}" style="display:inline-block;background:#f59e0b;color:#0a0a0a;font-size:14px;font-weight:700;padding:13px 28px;border-radius:10px;text-decoration:none;letter-spacing:0.02em;">
        View All in Dashboard
      </a>
    </div>
    
    <p style="margin:24px 0 0;font-size:12px;color:rgba(240,237,232,0.3);text-align:center;">
      <a href="${unsubscribeUrl}" style="color:#f59e0b;">Unsubscribe from daily digests</a>
    </p>
  `);
}
