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

  it("returns the plural users list from the users endpoint for authenticated requests", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } });
    mockPrisma.user.findMany.mockResolvedValue([
      {
        id: "user_1",
        name: "Test User",
        email: "user@example.com",
        image: null,
        createdAt: new Date("2024-01-15T10:00:00.000Z"),
      },
      {
        id: "user_2",
        name: "Another User",
        email: "other@example.com",
        image: null,
        createdAt: new Date("2024-01-16T10:00:00.000Z"),
      },
    ]);

    const res = await listUsers(new Request("http://localhost/api/users"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json)).toBe(true);
    expect(json).toHaveLength(2);
    expect(json[0].email).toBe("user@example.com");
  });

  it("returns a single user when id query parameter is provided", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } });
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "user_1",
      name: "Test User",
      email: "user@example.com",
      image: null,
      createdAt: new Date("2024-01-15T10:00:00.000Z"),
    });

    const res = await listUsers(new Request("http://localhost/api/users?id=user_1"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.id).toBe("user_1");
    expect(json.name).toBe("Test User");
    expect(json.email).toBe("user@example.com");
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: "user_1" },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      },
    });
  });

  it("returns 404 when single user is not found", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } });
    mockPrisma.user.findUnique.mockResolvedValue(null);

    const res = await listUsers(new Request("http://localhost/api/users?id=non_existent"));
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe("User not found");
  });

  it("returns 401 for unauthenticated requests to users endpoint", async () => {
    mockAuth.mockResolvedValue(null);

    const res = await listUsers(new Request("http://localhost/api/users"));
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("Unauthorized");
  });
});
