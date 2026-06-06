import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateEmailVerificationToken } from "@/lib/tokens";
import { handleError } from "@/lib/api-helpers";

async function verifyToken(token: string): Promise<NextResponse> {
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

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json(
      { error: "Account not found." },
      { status: 404 }
    );
  }

  // Already verified — treat as success
  if (user.emailVerified) {
    return NextResponse.json({ message: "Email already verified." });
  }

  await prisma.user.update({
    where: { email },
    data:  { emailVerified: new Date() },
  });

  return NextResponse.json({ message: "Email verified successfully." });
}

// GET — handles direct link clicks from email
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token") ?? "";
    return verifyToken(token);
  } catch (e) {
    return handleError(e, "GET /api/auth/verify-email");
  }
}

// POST — handles client-side fetch from VerifyEmailScreen
export async function POST(req: Request) {
  try {
    const body  = await req.json();
    const token = body.token ?? "";
    return verifyToken(token);
  } catch (e) {
    return handleError(e, "POST /api/auth/verify-email");
  }
}