import { NextResponse } from "next/server";
import { headers } from "next/headers";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { loginSchema } from "@/lib/validations";
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
        { error: "Too many login attempts. Please try again in 15 minutes." },
        { status: 429, headers: rateLimitHeaders(rateLimit) }
      );
    }

    const body   = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const email = parsed.data.email.toLowerCase();

    const user = await prisma.user.findUnique({
      where:  { email },
      select: {
        id:            true,
        name:          true,
        email:         true,
        passwordHash:  true,
        emailVerified: true,
      },
    });

    // Use a generic message to prevent user enumeration
    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Return user info — actual session is created by NextAuth credentials flow
    return NextResponse.json({
      id:            user.id,
      name:          user.name,
      email:         user.email,
      emailVerified: user.emailVerified,
    });
  } catch (e) {
    return handleError(e, "POST /api/auth/login");
  }
}