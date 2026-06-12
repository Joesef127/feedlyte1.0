/**
 * Tests for src/app/api/projects/[id]/webhooks/route.ts
 * GET  — list webhooks for a project
 * POST — create a new webhook for a project
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  default: {
    project: {
      findFirst: vi.fn(),
    },
    webhook: {
      findMany: vi.fn(),
      create:   vi.fn(),
    },
  },
}));

vi.mock("@/lib/api-helpers", () => ({
  handleError: vi.fn((_e, _ctx) =>
    NextResponse.json({ error: "Internal Server Error" }, { status: 500 }),
  ),
}));

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { GET, POST } from "@/app/api/projects/[id]/webhooks/route";

const mockAuth = auth as ReturnType<typeof vi.fn>;
const mockPrisma = prisma as unknown as {
  project: { findFirst: ReturnType<typeof vi.fn> };
  webhook: {
    findMany: ReturnType<typeof vi.fn>;
    create:   ReturnType<typeof vi.fn>;
  };
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeRequest(body?: unknown): Request {
  return new Request("http://localhost/api/projects/proj_1/webhooks", {
    method: body ? "POST" : "GET",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
}

const params = Promise.resolve({ id: "proj_1" });

const baseWebhook = {
  id:        "wh_1",
  projectId: "proj_1",
  url:       "https://example.com/hook",
  label:     "My Webhook",
  secret:    null,
  enabled:   true,
  createdAt: new Date("2024-01-15T10:00:00.000Z"),
};

// ── GET ───────────────────────────────────────────────────────────────────────

describe("GET /api/projects/[id]/webhooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when the user is not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await GET(makeRequest(), { params });
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("Unauthorized");
  });

  it("returns 404 when the project does not exist for the user", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } });
    mockPrisma.project.findFirst.mockResolvedValue(null);
    const res = await GET(makeRequest(), { params });
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe("Not found");
  });

  it("returns an empty array when the project has no webhooks", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } });
    mockPrisma.project.findFirst.mockResolvedValue({ id: "proj_1" });
    mockPrisma.webhook.findMany.mockResolvedValue([]);
    const res = await GET(makeRequest(), { params });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual([]);
  });

  it("returns the list of webhooks with secrets masked", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } });
    mockPrisma.project.findFirst.mockResolvedValue({ id: "proj_1" });
    mockPrisma.webhook.findMany.mockResolvedValue([
      { ...baseWebhook, secret: "real-secret-value" },
    ]);
    const res = await GET(makeRequest(), { params });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveLength(1);
    expect(json[0].secret).toBe("••••••••");
    expect(json[0].secret).not.toBe("real-secret-value");
  });

  it("returns null for secret field when webhook has no secret", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } });
    mockPrisma.project.findFirst.mockResolvedValue({ id: "proj_1" });
    mockPrisma.webhook.findMany.mockResolvedValue([{ ...baseWebhook, secret: null }]);
    const res = await GET(makeRequest(), { params });
    const json = await res.json();
    expect(json[0].secret).toBeNull();
  });

  it("returns a createdAt ISO string in the response", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } });
    mockPrisma.project.findFirst.mockResolvedValue({ id: "proj_1" });
    mockPrisma.webhook.findMany.mockResolvedValue([baseWebhook]);
    const res = await GET(makeRequest(), { params });
    const json = await res.json();
    expect(json[0].createdAt).toBe("2024-01-15T10:00:00.000Z");
  });

  it("queries webhooks using the correct projectId ownership filter", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } });
    mockPrisma.project.findFirst.mockResolvedValue({ id: "proj_1" });
    mockPrisma.webhook.findMany.mockResolvedValue([]);
    await GET(makeRequest(), { params });
    expect(mockPrisma.project.findFirst).toHaveBeenCalledWith({
      where: { id: "proj_1", userId: "user_1" },
    });
  });
});

// ── POST ──────────────────────────────────────────────────────────────────────

describe("POST /api/projects/[id]/webhooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when the user is not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await POST(makeRequest({ url: "https://example.com/hook" }), {
      params,
    });
    expect(res.status).toBe(401);
  });

  it("returns 404 when the project does not belong to the user", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } });
    mockPrisma.project.findFirst.mockResolvedValue(null);
    const res = await POST(
      makeRequest({ url: "https://example.com/hook" }),
      { params },
    );
    expect(res.status).toBe(404);
  });

  it("returns 400 when no URL is provided in the request body", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } });
    mockPrisma.project.findFirst.mockResolvedValue({ id: "proj_1" });
    const res = await POST(makeRequest({}), { params });
    expect(res.status).toBe(400);
  });

  it("returns 400 when the URL is not a valid URL", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } });
    mockPrisma.project.findFirst.mockResolvedValue({ id: "proj_1" });
    const res = await POST(makeRequest({ url: "not-a-url" }), { params });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBeTruthy();
  });

  it("creates a webhook with default label when label is omitted", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } });
    mockPrisma.project.findFirst.mockResolvedValue({ id: "proj_1" });
    mockPrisma.webhook.create.mockResolvedValue({
      ...baseWebhook,
      label: "My Webhook",
    });
    const res = await POST(
      makeRequest({ url: "https://example.com/hook" }),
      { params },
    );
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.label).toBe("My Webhook");
  });

  it("creates a webhook with the provided label", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } });
    mockPrisma.project.findFirst.mockResolvedValue({ id: "proj_1" });
    mockPrisma.webhook.create.mockResolvedValue({
      ...baseWebhook,
      label: "Slack Notifications",
    });
    const res = await POST(
      makeRequest({ url: "https://example.com/hook", label: "Slack Notifications" }),
      { params },
    );
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.label).toBe("Slack Notifications");
  });

  it("masks the secret in the response", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } });
    mockPrisma.project.findFirst.mockResolvedValue({ id: "proj_1" });
    mockPrisma.webhook.create.mockResolvedValue({
      ...baseWebhook,
      secret: "super-secret",
    });
    const res = await POST(
      makeRequest({ url: "https://example.com/hook", secret: "super-secret" }),
      { params },
    );
    const json = await res.json();
    expect(json.secret).toBe("••••••••");
  });

  it("returns null secret when no secret is provided", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } });
    mockPrisma.project.findFirst.mockResolvedValue({ id: "proj_1" });
    mockPrisma.webhook.create.mockResolvedValue({ ...baseWebhook, secret: null });
    const res = await POST(
      makeRequest({ url: "https://example.com/hook" }),
      { params },
    );
    const json = await res.json();
    expect(json.secret).toBeNull();
  });

  it("passes enabled: true by default to the database", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } });
    mockPrisma.project.findFirst.mockResolvedValue({ id: "proj_1" });
    mockPrisma.webhook.create.mockResolvedValue({ ...baseWebhook });
    await POST(makeRequest({ url: "https://example.com/hook" }), { params });
    expect(mockPrisma.webhook.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ enabled: true }),
    });
  });

  it("accepts enabled: false to create a disabled webhook", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } });
    mockPrisma.project.findFirst.mockResolvedValue({ id: "proj_1" });
    mockPrisma.webhook.create.mockResolvedValue({ ...baseWebhook, enabled: false });
    const res = await POST(
      makeRequest({ url: "https://example.com/hook", enabled: false }),
      { params },
    );
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.enabled).toBe(false);
  });
});