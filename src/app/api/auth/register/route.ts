import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import { handleError } from "@/lib/api-helpers";
import { createEmailVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body   = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, password } = parsed.data;
    // Normalize email to lowercase at the point of entry
    const email = parsed.data.email.toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, passwordHash },
      select: { id: true, name: true, email: true },
    });

    // Create verification token for auto-redirect
    let verificationToken = "";
    try {
      verificationToken = await createEmailVerificationToken(email);
      const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${verificationToken}`;
      await sendVerificationEmail(email, verifyUrl);
    } catch (emailErr) {
      console.error("[register] Failed to send verification email", emailErr);
    }

    return NextResponse.json({ ...user, token: verificationToken }, { status: 201 });
  } catch (e) {
    return handleError(e, "register");
  }
}