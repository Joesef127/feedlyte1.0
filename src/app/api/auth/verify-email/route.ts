import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateEmailVerificationToken } from "@/lib/tokens";
import { handleError } from "@/lib/api-helpers";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Verification token is missing." },
        { status: 400 }
      );
    }

    const email = await validateEmailVerificationToken(token);
    if (!email) {
      return NextResponse.json(
        { error: "This verification link is invalid or has expired." },
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

    // Already verified — treat as success, not an error
    if (user.emailVerified) {
      return NextResponse.json({ message: "Email already verified." });
    }

    await prisma.user.update({
      where: { email: normalizedEmail },
      data: { emailVerified: new Date() },
    });

    return NextResponse.json({ message: "Email verified successfully." });
  } catch (e) {
    return handleError(e, "GET /api/auth/verify-email");
  }
}