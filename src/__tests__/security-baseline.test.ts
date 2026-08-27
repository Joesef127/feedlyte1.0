import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers({ "x-forwarded-for": "127.0.0.1" })),
}));

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  default: {
    user: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn() },
  },
}));
vi.mock("@/lib/tokens", () => ({
  createEmailVerificationToken: vi.fn().mockResolvedValue("raw_verification_token"),
}));
vi.mock("@/lib/email", () => ({
  sendVerificationEmail: vi.fn().mockResolvedValue({ success: true }),
}));
vi.mock("@/lib/rate-limit", () => ({
  checkAuthRateLimit: vi.fn().mockResolvedValue({ success: true }),
  rateLimitHeaders: vi.fn(() => ({})),
}));
vi.mock("@/lib/api-helpers", () => ({
  handleError: vi.fn((_e, _ctx) => NextResponse.json({ error: "Internal Server Error" }, { status: 500 })),
}));

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { POST as registerPost } from "@/app/api/auth/register/route";
import { GET as listUsers } from "@/app/api/users/route";
import { GET as getUser } from "@/app/api/users/[id]/route";

const mockAuth = auth as ReturnType<typeof vi.fn>;
const mockPrisma = prisma as unknown as {
  user: {
    findUnique: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
};

describe("security baseline", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not return the verification token from registration", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } });
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({
      id: "user_1",
      name: "Test User",
      email: "user@example.com",
    });

    const res = await registerPost(new Request("http://localhost/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test User",
        email: "user@example.com",
        password: "Password123!",
      }),
    }));

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json).not.toHaveProperty("token");
    expect(json.email).toBe("user@example.com");
  });

  it("reserves the users collection endpoint for future RBAC directory access", async () => {
    const res = await listUsers();
    expect(res.status).toBe(405);
    expect(res.headers.get("Allow")).toBe("PATCH, PUT");
    const json = await res.json();
    expect(json.error).toBe("User directory is not available.");
    expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("does not disclose another account through the user ID route", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } });

    const res = await getUser(
      new Request("http://localhost/api/users/user_2"),
      { params: Promise.resolve({ id: "user_2" }) },
    );

    expect(res.status).toBe(404);
    expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("does not enable collection reads for unauthenticated requests", async () => {
    mockAuth.mockResolvedValue(null);

    const res = await listUsers();
    expect(res.status).toBe(405);
    const json = await res.json();
    expect(json.error).toBe("User directory is not available.");
  });
});
