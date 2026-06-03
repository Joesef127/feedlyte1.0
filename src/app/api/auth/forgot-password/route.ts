import { NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { createPasswordResetToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/email";
import { forgotPasswordSchema } from "@/lib/validations";
import { handleError } from "@/lib/api-helpers";
import { checkAuthRateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    // Rate limit by IP
    const headersList = await headers();
    const ip =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      headersList.get("x-real-ip") ??
      "anonymous";

    const rateLimit = await checkAuthRateLimit(ip);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: rateLimitHeaders(rateLimit) },
      );
    }

    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }
    // Normalize email to lowercase — prevents case mismatch with Resend
    const email = parsed.data.email.toLowerCase();
    // Always return 200 regardless of whether the email exists.
    // This prevents user enumeration attacks.
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const rawToken = await createPasswordResetToken(email);
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${rawToken}`;
      const emailResult = await sendPasswordResetEmail(email, resetUrl);

      if (!emailResult.success) {
        console.error(
          "[forgot-password] Email send failed:",
          emailResult.error,
        );
      }
    }

    return NextResponse.json(
      { message: `If ${email} account exists, a reset link has been sent.` },
      { headers: rateLimitHeaders(rateLimit) },
    );
  } catch (e) {
    return handleError(e, "POST /api/auth/forgot-password");
  }
}
