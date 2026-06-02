import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { validatePasswordResetToken, consumePasswordResetToken } from "@/lib/tokens";
import { resetPasswordSchema } from "@/lib/validations";
import { handleError } from "@/lib/api-helpers";

export async function POST(req: Request) {
  try {
    const body   = await req.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { token, password } = parsed.data;

    // Validate token and retrieve email
    const email = await validatePasswordResetToken(token);
    if (!email) {
      return NextResponse.json(
        { error: "This reset link is invalid or has expired." },
        { status: 400 }
      );
    }

    // Normalize email for consistent lookups
    const normalizedEmail = email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      return NextResponse.json(
        { error: "Account not found." },
        { status: 404 }
      );
    }

    // Hash and update password
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { email: normalizedEmail },
      data: { passwordHash },
    });

    // Consume the token so it cannot be reused
    await consumePasswordResetToken(token);

    return NextResponse.json({ message: "Password updated successfully." });
  } catch (e) {
    return handleError(e, "POST /api/auth/reset-password");
  }
}