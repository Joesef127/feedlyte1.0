import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createPasswordResetToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/email";
import { forgotPasswordSchema } from "@/lib/validations";
import { handleError } from "@/lib/api-helpers";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { email } = parsed.data;

    // Always return 200 regardless of whether the email exists.
    // This prevents user enumeration attacks.
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      console.log("[debug] user found, generating token for:", email);

      const rawToken = await createPasswordResetToken(email);
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${rawToken}`;
      console.log("[debug] resetUrl:", resetUrl);
      
      const emailResult = await sendPasswordResetEmail(email, resetUrl);
      console.log("[debug] emailResult:", emailResult);

      if (!emailResult.success) {
        console.error(
          "[forgot-password] Email send failed:",
          emailResult.error,
        );
      }
    }

    return NextResponse.json({
      message:
        "If an account exists for that email, a reset link has been sent.",
    });
  } catch (e) {
    return handleError(e, "POST /api/auth/forgot-password");
  }
}
