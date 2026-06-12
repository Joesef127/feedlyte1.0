/**
 * Tests for src/app/api/feedback/route.ts
 *
 * Focuses on changes introduced in this PR:
 *  - isOriginAllowed / CORS logic (projectOrigin vs. fallback origins)
 *  - POST endpoint: status set to "unreviewed" (not "new")
 *  - POST endpoint: fireWebhooks called asynchronously
 *  - GET endpoint: requires authentication
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  default: {
    project:  { findUnique: vi.fn() },
    feedback: { findMany: vi.fn(), create: vi.fn() },
  },
}));

vi.mock("@/lib/rate-limit", () => ({
  checkWidgetRateLimit: vi.fn(),
  rateLimitHeaders:     vi.fn(() => ({})),
}));

vi.mock("@/lib/webhooks", () => ({
  fireWebhooks: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/api-helpers", () => ({
  handleError: vi.fn((_e, _ctx) =>
    NextResponse.json({ error: "Internal Server Error" }, { status: 500 }),
  ),
}));

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { checkWidgetRateLimit } from "@/lib/rate-limit";
import { fireWebhooks } from "@/lib/webhooks";
import { GET, POST, OPTIONS } from "@/app/api/feedback/route";

const mockAuth              = auth as ReturnType<typeof vi.fn>;
const mockCheckRateLimit    = checkWidgetRateLimit as ReturnType<typeof vi.fn>;
const mockFireWebhooks      = fireWebhooks as ReturnType<typeof vi.fn>;
const mockPrisma = prisma as unknown as {
  project:  { findUnique: ReturnType<typeof vi.fn> };
  feedback: { findMany: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn> };
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function makePostRequest(
  body: unknown,
  origin: string = "https://feedlyte.vercel.app",
  projectId = "proj_1",
): Request {
  return new Request(
    `http://localhost/api/feedback?project=${projectId}`,
    {
      method:  "POST",
      headers: { "Content-Type": "application/json", Origin: origin },
      body:    JSON.stringify(body),
    },
  );
}

function makeGetRequest(params?: Record<string, string>): Request {
  const url = new URL("http://localhost/api/feedback");
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  return new Request(url.toString());
}

const baseFeedbackBody = {
  message:   "This is great feedback!",
  email:     "user@example.com",
  pageUrl:   "https://example.com/page",
  userAgent: "Mozilla/5.0",
};

const createdFeedback = {
  id:        "fb_1",
  projectId: "proj_1",
  message:   "This is great feedback!",
  email:     "user@example.com",
  pageUrl:   "https://example.com/page",
  userAgent: "Mozilla/5.0",
  status:    "unreviewed",
  createdAt: new Date("2024-01-15T10:00:00.000Z"),
};

// ── OPTIONS ───────────────────────────────────────────────────────────────────

describe("OPTIONS /api/feedback", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 204 for preflight requests", async () => {
    mockPrisma.project.findUnique.mockResolvedValue(null);
    const req = new Request("http://localhost/api/feedback?project=proj_1", {
      method: "OPTIONS",
      headers: { Origin: "https://feedlyte.vercel.app" },
    });
    const res = await OPTIONS(req);
    expect(res.status).toBe(204);
  });

  it("includes Access-Control-Allow-Methods header", async () => {
    mockPrisma.project.findUnique.mockResolvedValue(null);
    const req = new Request("http://localhost/api/feedback?project=proj_1", {
      method: "OPTIONS",
      headers: { Origin: "https://feedlyte.vercel.app" },
    });
    const res = await OPTIONS(req);
    expect(res.headers.get("Access-Control-Allow-Methods")).toBeTruthy();
  });
});

// ── GET ───────────────────────────────────────────────────────────────────────

describe("GET /api/feedback", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when the user is not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await GET(makeGetRequest());
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("Unauthorized");
  });

  it("returns feedback list for an authenticated user", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } });
    mockPrisma.feedback.findMany.mockResolvedValue([
      {
        id:        "fb_1",
        projectId: "proj_1",
        message:   "Test message",
        email:     "a@b.com",
        pageUrl:   "https://example.com",
        userAgent: "Mozilla",
        status:    "unreviewed",
        createdAt: new Date("2024-01-15T10:00:00.000Z"),
      },
    ]);
    const res = await GET(makeGetRequest());
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveLength(1);
    expect(json[0].id).toBe("fb_1");
  });

  it("maps null email to an empty string", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } });
    mockPrisma.feedback.findMany.mockResolvedValue([
      { ...createdFeedback, email: null },
    ]);
    const res = await GET(makeGetRequest());
    const json = await res.json();
    expect(json[0].email).toBe("");
  });

  it("maps null pageUrl to an empty string", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } });
    mockPrisma.feedback.findMany.mockResolvedValue([
      { ...createdFeedback, pageUrl: null },
    ]);
    const res = await GET(makeGetRequest());
    const json = await res.json();
    expect(json[0].pageUrl).toBe("");
  });

  it("returns createdAt as ISO string", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } });
    mockPrisma.feedback.findMany.mockResolvedValue([createdFeedback]);
    const res = await GET(makeGetRequest());
    const json = await res.json();
    expect(json[0].createdAt).toBe("2024-01-15T10:00:00.000Z");
  });

  it("passes status filter to the query when provided", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } });
    mockPrisma.feedback.findMany.mockResolvedValue([]);
    await GET(makeGetRequest({ status: "resolved" }));
    expect(mockPrisma.feedback.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: "resolved" }),
      }),
    );
  });

  it("passes search query to the OR filter when provided", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } });
    mockPrisma.feedback.findMany.mockResolvedValue([]);
    await GET(makeGetRequest({ q: "bug" }));
    const callArgs = mockPrisma.feedback.findMany.mock.calls[0][0];
    expect(callArgs.where.OR).toBeDefined();
  });
});

// ── POST ──────────────────────────────────────────────────────────────────────

describe("POST /api/feedback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCheckRateLimit.mockResolvedValue({ success: true });
    mockFireWebhooks.mockResolvedValue(undefined);
  });

  it("returns 400 when the project query param is missing", async () => {
    const req = new Request("http://localhost/api/feedback", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(baseFeedbackBody),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 404 when the project is not found", async () => {
    mockPrisma.project.findUnique.mockResolvedValue(null);
    const res = await POST(
      makePostRequest(baseFeedbackBody),
    );
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe("Project not found.");
  });

  it("returns 403 when the origin is not allowed", async () => {
    mockPrisma.project.findUnique.mockResolvedValue({
      id:            "proj_1",
      allowedOrigin: "https://allowed-origin.com",
    });
    const res = await POST(
      makePostRequest(baseFeedbackBody, "https://evil.com"),
    );
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toBe("Origin not allowed.");
  });

  it("returns 429 when the rate limit is exceeded", async () => {
    mockPrisma.project.findUnique.mockResolvedValue({
      id:            "proj_1",
      allowedOrigin: null,
    });
    mockCheckRateLimit.mockResolvedValue({ success: false, limit: 10, remaining: 0, reset: Date.now() });
    const res = await POST(makePostRequest(baseFeedbackBody));
    expect(res.status).toBe(429);
  });

  it("returns 400 when the request body fails validation (empty message)", async () => {
    mockPrisma.project.findUnique.mockResolvedValue({
      id:            "proj_1",
      allowedOrigin: null,
    });
    const res = await POST(makePostRequest({ message: "" }));
    expect(res.status).toBe(400);
  });

  it("creates feedback with status 'unreviewed' (not 'new')", async () => {
    mockPrisma.project.findUnique.mockResolvedValue({
      id:            "proj_1",
      allowedOrigin: null,
    });
    mockPrisma.feedback.create.mockResolvedValue(createdFeedback);

    await POST(makePostRequest(baseFeedbackBody));

    expect(mockPrisma.feedback.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ status: "unreviewed" }),
    });
  });

  it("returns 201 with success message on valid submission", async () => {
    mockPrisma.project.findUnique.mockResolvedValue({
      id:            "proj_1",
      allowedOrigin: null,
    });
    mockPrisma.feedback.create.mockResolvedValue(createdFeedback);

    const res = await POST(makePostRequest(baseFeedbackBody));
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.id).toBe("fb_1");
    expect(json.message).toBe("Feedback received. Thank you!");
  });

  it("fires webhooks after creating feedback", async () => {
    mockPrisma.project.findUnique.mockResolvedValue({
      id:            "proj_1",
      allowedOrigin: null,
    });
    mockPrisma.feedback.create.mockResolvedValue(createdFeedback);

    await POST(makePostRequest(baseFeedbackBody));

    expect(mockFireWebhooks).toHaveBeenCalledOnce();
    const payload = mockFireWebhooks.mock.calls[0][0];
    expect(payload.id).toBe("fb_1");
    expect(payload.projectId).toBe("proj_1");
    expect(payload.status).toBe("unreviewed");
  });

  it("includes createdAt ISO string in the webhook payload", async () => {
    mockPrisma.project.findUnique.mockResolvedValue({
      id:            "proj_1",
      allowedOrigin: null,
    });
    mockPrisma.feedback.create.mockResolvedValue(createdFeedback);

    await POST(makePostRequest(baseFeedbackBody));

    const payload = mockFireWebhooks.mock.calls[0][0];
    expect(payload.createdAt).toBe("2024-01-15T10:00:00.000Z");
  });

  it("still returns 201 even when fireWebhooks throws (fire-and-forget)", async () => {
    mockPrisma.project.findUnique.mockResolvedValue({
      id:            "proj_1",
      allowedOrigin: null,
    });
    mockPrisma.feedback.create.mockResolvedValue(createdFeedback);
    mockFireWebhooks.mockRejectedValue(new Error("Webhook system down"));

    // The .catch(() => {}) in the route swallows the error
    const res = await POST(makePostRequest(baseFeedbackBody));
    expect(res.status).toBe(201);
  });

  it("allows request from a fallback origin (feedlyte.vercel.app) when no project origin is set", async () => {
    mockPrisma.project.findUnique.mockResolvedValue({
      id:            "proj_1",
      allowedOrigin: null,
    });
    mockPrisma.feedback.create.mockResolvedValue(createdFeedback);

    const res = await POST(
      makePostRequest(baseFeedbackBody, "https://feedlyte.vercel.app"),
    );
    expect(res.status).toBe(201);
  });

  it("allows request from localhost:3000 when no project origin is set", async () => {
    mockPrisma.project.findUnique.mockResolvedValue({
      id:            "proj_1",
      allowedOrigin: null,
    });
    mockPrisma.feedback.create.mockResolvedValue(createdFeedback);

    const res = await POST(
      makePostRequest(baseFeedbackBody, "http://localhost:3000"),
    );
    expect(res.status).toBe(201);
  });

  it("rejects a request from a disallowed origin when projectOrigin is set", async () => {
    mockPrisma.project.findUnique.mockResolvedValue({
      id:            "proj_1",
      allowedOrigin: "https://myapp.com",
    });
    const res = await POST(
      makePostRequest(baseFeedbackBody, "https://not-myapp.com"),
    );
    expect(res.status).toBe(403);
  });

  it("allows a request matching the project-specific allowedOrigin (case-insensitive, trailing-slash-tolerant)", async () => {
    mockPrisma.project.findUnique.mockResolvedValue({
      id:            "proj_1",
      allowedOrigin: "https://MyApp.com/",
    });
    mockPrisma.feedback.create.mockResolvedValue(createdFeedback);

    const res = await POST(
      makePostRequest(baseFeedbackBody, "https://myapp.com"),
    );
    expect(res.status).toBe(201);
  });

  it("stores null for blank optional email field", async () => {
    mockPrisma.project.findUnique.mockResolvedValue({
      id:            "proj_1",
      allowedOrigin: null,
    });
    mockPrisma.feedback.create.mockResolvedValue({ ...createdFeedback, email: null });

    await POST(makePostRequest({ message: "test", email: "" }));

    expect(mockPrisma.feedback.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ email: null }),
    });
  });

  it("stores null for blank optional pageUrl field", async () => {
    mockPrisma.project.findUnique.mockResolvedValue({
      id:            "proj_1",
      allowedOrigin: null,
    });
    mockPrisma.feedback.create.mockResolvedValue({ ...createdFeedback, pageUrl: null });

    await POST(makePostRequest({ message: "test", pageUrl: "" }));

    expect(mockPrisma.feedback.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ pageUrl: null }),
    });
  });
});

// ── CORS origin logic (isOriginAllowed) ───────────────────────────────────────

describe("CORS origin validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCheckRateLimit.mockResolvedValue({ success: true });
    mockFireWebhooks.mockResolvedValue(undefined);
  });

  it("allows the origin when it matches projectOrigin exactly", async () => {
    mockPrisma.project.findUnique.mockResolvedValue({
      id:            "proj_1",
      allowedOrigin: "https://exact-origin.com",
    });
    mockPrisma.feedback.create.mockResolvedValue(createdFeedback);
    const res = await POST(
      makePostRequest(baseFeedbackBody, "https://exact-origin.com"),
    );
    expect(res.status).toBe(201);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe(
      "https://exact-origin.com",
    );
  });

  it("sets the Access-Control-Allow-Origin to the allowed origin on success", async () => {
    mockPrisma.project.findUnique.mockResolvedValue({
      id: "proj_1", allowedOrigin: null,
    });
    mockPrisma.feedback.create.mockResolvedValue(createdFeedback);
    const res = await POST(
      makePostRequest(baseFeedbackBody, "https://feedlyte.vercel.app"),
    );
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe(
      "https://feedlyte.vercel.app",
    );
  });
});