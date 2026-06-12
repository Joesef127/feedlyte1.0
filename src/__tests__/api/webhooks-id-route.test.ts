/**
 * Tests for:
 *   src/app/api/webhooks/[id]/route.ts            — PATCH, DELETE
 *   src/app/api/webhooks/[id]/deliveries/route.ts — GET deliveries
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  default: {
    webhook: {
      findFirst: vi.fn(),
      update:    vi.fn(),
      delete:    vi.fn(),
    },
    webhookDelivery: {
      findMany: vi.fn(),
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
import { PATCH, DELETE } from "@/app/api/webhooks/[id]/route";
import { GET as GET_DELIVERIES } from "@/app/api/webhooks/[id]/deliveries/route";

const mockAuth = auth as ReturnType<typeof vi.fn>;
const mockPrisma = prisma as unknown as {
  webhook: {
    findFirst: ReturnType<typeof vi.fn>;
    update:    ReturnType<typeof vi.fn>;
    delete:    ReturnType<typeof vi.fn>;
  };
  webhookDelivery: {
    findMany: ReturnType<typeof vi.fn>;
  };
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function makePatchRequest(body: unknown): Request {
  return new Request("http://localhost/api/webhooks/wh_1", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function makeDeleteRequest(): Request {
  return new Request("http://localhost/api/webhooks/wh_1", { method: "DELETE" });
}

function makeGetRequest(): Request {
  return new Request("http://localhost/api/webhooks/wh_1/deliveries");
}

const params = Promise.resolve({ id: "wh_1" });

const baseWebhook = {
  id:        "wh_1",
  projectId: "proj_1",
  url:       "https://example.com/hook",
  label:     "My Webhook",
  secret:    null,
  enabled:   true,
  createdAt: new Date("2024-01-15T10:00:00.000Z"),
};

// ── PATCH /api/webhooks/[id] ──────────────────────────────────────────────────

describe("PATCH /api/webhooks/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await PATCH(makePatchRequest({ label: "New" }), { params });
    expect(res.status).toBe(401);
  });

  it("returns 404 when the webhook does not belong to the user", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } });
    mockPrisma.webhook.findFirst.mockResolvedValue(null);
    const res = await PATCH(makePatchRequest({ label: "New" }), { params });
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe("Not found");
  });

  it("returns 400 for an invalid URL in the update body", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } });
    mockPrisma.webhook.findFirst.mockResolvedValue(baseWebhook);
    const res = await PATCH(
      makePatchRequest({ url: "not-a-valid-url" }),
      { params },
    );
    expect(res.status).toBe(400);
  });

  it("updates and returns the webhook with masked secret when secret is set", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } });
    mockPrisma.webhook.findFirst.mockResolvedValue(baseWebhook);
    mockPrisma.webhook.update.mockResolvedValue({
      ...baseWebhook,
      secret: "new-secret",
    });
    const res = await PATCH(
      makePatchRequest({ secret: "new-secret" }),
      { params },
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.secret).toBe("••••••••");
  });

  it("updates only the provided fields (partial update)", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } });
    mockPrisma.webhook.findFirst.mockResolvedValue(baseWebhook);
    mockPrisma.webhook.update.mockResolvedValue({
      ...baseWebhook,
      label: "Updated Label",
    });
    await PATCH(makePatchRequest({ label: "Updated Label" }), { params });
    expect(mockPrisma.webhook.update).toHaveBeenCalledWith({
      where: { id: "wh_1" },
      data:  { label: "Updated Label" },
    });
  });

  it("can disable a webhook by setting enabled: false", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } });
    mockPrisma.webhook.findFirst.mockResolvedValue(baseWebhook);
    mockPrisma.webhook.update.mockResolvedValue({ ...baseWebhook, enabled: false });
    const res = await PATCH(makePatchRequest({ enabled: false }), { params });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.enabled).toBe(false);
  });

  it("returns a createdAt ISO string in the response", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } });
    mockPrisma.webhook.findFirst.mockResolvedValue(baseWebhook);
    mockPrisma.webhook.update.mockResolvedValue(baseWebhook);
    const res = await PATCH(makePatchRequest({ label: "Test" }), { params });
    const json = await res.json();
    expect(json.createdAt).toBe("2024-01-15T10:00:00.000Z");
  });

  it("verifies ownership via the project relationship", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_42" } });
    mockPrisma.webhook.findFirst.mockResolvedValue(null);
    await PATCH(makePatchRequest({ label: "Test" }), { params });
    expect(mockPrisma.webhook.findFirst).toHaveBeenCalledWith({
      where: { id: "wh_1", project: { userId: "user_42" } },
    });
  });

  it("returns 400 when label exceeds 60 characters", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } });
    mockPrisma.webhook.findFirst.mockResolvedValue(baseWebhook);
    const longLabel = "a".repeat(61);
    const res = await PATCH(makePatchRequest({ label: longLabel }), { params });
    expect(res.status).toBe(400);
  });
});

// ── DELETE /api/webhooks/[id] ─────────────────────────────────────────────────

describe("DELETE /api/webhooks/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await DELETE(makeDeleteRequest(), { params });
    expect(res.status).toBe(401);
  });

  it("returns 404 when the webhook does not belong to the user", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } });
    mockPrisma.webhook.findFirst.mockResolvedValue(null);
    const res = await DELETE(makeDeleteRequest(), { params });
    expect(res.status).toBe(404);
  });

  it("returns 204 No Content on successful deletion", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } });
    mockPrisma.webhook.findFirst.mockResolvedValue(baseWebhook);
    mockPrisma.webhook.delete.mockResolvedValue(baseWebhook);
    const res = await DELETE(makeDeleteRequest(), { params });
    expect(res.status).toBe(204);
    // No body expected
    const text = await res.text();
    expect(text).toBe("");
  });

  it("calls prisma.webhook.delete with the correct id", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } });
    mockPrisma.webhook.findFirst.mockResolvedValue(baseWebhook);
    mockPrisma.webhook.delete.mockResolvedValue(baseWebhook);
    await DELETE(makeDeleteRequest(), { params });
    expect(mockPrisma.webhook.delete).toHaveBeenCalledWith({
      where: { id: "wh_1" },
    });
  });
});

// ── GET /api/webhooks/[id]/deliveries ─────────────────────────────────────────

describe("GET /api/webhooks/[id]/deliveries", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await GET_DELIVERIES(makeGetRequest(), { params });
    expect(res.status).toBe(401);
  });

  it("returns 404 when the webhook does not belong to the user", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } });
    mockPrisma.webhook.findFirst.mockResolvedValue(null);
    const res = await GET_DELIVERIES(makeGetRequest(), { params });
    expect(res.status).toBe(404);
  });

  it("returns an empty array when there are no deliveries", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } });
    mockPrisma.webhook.findFirst.mockResolvedValue(baseWebhook);
    mockPrisma.webhookDelivery.findMany.mockResolvedValue([]);
    const res = await GET_DELIVERIES(makeGetRequest(), { params });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual([]);
  });

  it("returns delivery records with expected fields", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } });
    mockPrisma.webhook.findFirst.mockResolvedValue(baseWebhook);
    mockPrisma.webhookDelivery.findMany.mockResolvedValue([
      {
        id:         "del_1",
        success:    true,
        statusCode: 200,
        error:      null,
        createdAt:  new Date("2024-01-15T10:00:00.000Z"),
      },
    ]);
    const res = await GET_DELIVERIES(makeGetRequest(), { params });
    const json = await res.json();
    expect(json).toHaveLength(1);
    expect(json[0]).toEqual({
      id:         "del_1",
      success:    true,
      statusCode: 200,
      error:      null,
      createdAt:  "2024-01-15T10:00:00.000Z",
    });
  });

  it("returns failed delivery records with error message", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } });
    mockPrisma.webhook.findFirst.mockResolvedValue(baseWebhook);
    mockPrisma.webhookDelivery.findMany.mockResolvedValue([
      {
        id:         "del_2",
        success:    false,
        statusCode: 503,
        error:      "HTTP 503",
        createdAt:  new Date("2024-01-15T11:00:00.000Z"),
      },
    ]);
    const res = await GET_DELIVERIES(makeGetRequest(), { params });
    const json = await res.json();
    expect(json[0].success).toBe(false);
    expect(json[0].error).toBe("HTTP 503");
    expect(json[0].statusCode).toBe(503);
  });

  it("queries deliveries ordered by createdAt desc and limited to 20", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } });
    mockPrisma.webhook.findFirst.mockResolvedValue(baseWebhook);
    mockPrisma.webhookDelivery.findMany.mockResolvedValue([]);
    await GET_DELIVERIES(makeGetRequest(), { params });
    expect(mockPrisma.webhookDelivery.findMany).toHaveBeenCalledWith({
      where:   { webhookId: "wh_1" },
      orderBy: { createdAt: "desc" },
      take:    20,
    });
  });

  it("verifies webhook ownership through the project relationship", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_99" } });
    mockPrisma.webhook.findFirst.mockResolvedValue(null);
    await GET_DELIVERIES(makeGetRequest(), { params });
    expect(mockPrisma.webhook.findFirst).toHaveBeenCalledWith({
      where: { id: "wh_1", project: { userId: "user_99" } },
    });
  });
});