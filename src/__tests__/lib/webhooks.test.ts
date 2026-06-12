import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "crypto";

// Mock prisma before importing the module under test
vi.mock("@/lib/prisma", () => ({
  default: {
    webhook: {
      findMany: vi.fn(),
    },
    webhookDelivery: {
      create: vi.fn(),
    },
  },
}));

import prisma from "@/lib/prisma";
import { fireWebhooks } from "@/lib/webhooks";

const mockPrisma = prisma as unknown as {
  webhook: { findMany: ReturnType<typeof vi.fn> };
  webhookDelivery: { create: ReturnType<typeof vi.fn> };
};

const baseFeedback = {
  id: "fb_1",
  projectId: "proj_1",
  message: "Great product!",
  email: "user@example.com",
  pageUrl: "https://example.com/page",
  status: "unreviewed",
  createdAt: "2024-01-15T10:00:00.000Z",
};

describe("fireWebhooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.webhookDelivery.create.mockResolvedValue({});
  });

  it("returns early without fetching when no webhooks are configured", async () => {
    mockPrisma.webhook.findMany.mockResolvedValue([]);

    await fireWebhooks(baseFeedback);

    expect(mockPrisma.webhook.findMany).toHaveBeenCalledWith({
      where: { projectId: "proj_1", enabled: true },
    });
    expect(mockPrisma.webhookDelivery.create).not.toHaveBeenCalled();
  });

  it("sends a POST request to the webhook URL with correct payload", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
    });
    vi.stubGlobal("fetch", mockFetch);

    mockPrisma.webhook.findMany.mockResolvedValue([
      { id: "wh_1", url: "https://hooks.example.com/receive", secret: null },
    ]);

    await fireWebhooks(baseFeedback);

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe("https://hooks.example.com/receive");
    expect(options.method).toBe("POST");
    expect(options.headers["Content-Type"]).toBe("application/json");
    expect(options.headers["User-Agent"]).toBe("Feedlyte-Webhook/1.0");

    const body = JSON.parse(options.body);
    expect(body.event).toBe("feedback.created");
    expect(body.feedback.id).toBe("fb_1");
    expect(body.feedback.message).toBe("Great product!");
    expect(body.feedback.projectId).toBe("proj_1");
  });

  it("does not include X-Feedlyte-Signature header when webhook has no secret", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal("fetch", mockFetch);

    mockPrisma.webhook.findMany.mockResolvedValue([
      { id: "wh_1", url: "https://hooks.example.com/receive", secret: null },
    ]);

    await fireWebhooks(baseFeedback);

    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers["X-Feedlyte-Signature"]).toBeUndefined();
  });

  it("adds HMAC-SHA256 signature header when webhook has a secret", async () => {
    const secret = "my-webhook-secret";
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal("fetch", mockFetch);

    mockPrisma.webhook.findMany.mockResolvedValue([
      { id: "wh_1", url: "https://hooks.example.com/receive", secret },
    ]);

    await fireWebhooks(baseFeedback);

    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers["X-Feedlyte-Signature"]).toBeDefined();

    // Verify the signature is correct
    const expectedSig = crypto
      .createHmac("sha256", secret)
      .update(options.body)
      .digest("hex");
    expect(options.headers["X-Feedlyte-Signature"]).toBe(expectedSig);
  });

  it("records a successful delivery when the webhook responds with ok status", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal("fetch", mockFetch);

    mockPrisma.webhook.findMany.mockResolvedValue([
      { id: "wh_1", url: "https://hooks.example.com/receive", secret: null },
    ]);

    await fireWebhooks(baseFeedback);

    // Wait for the fire-and-forget delivery create
    await vi.waitFor(() => {
      expect(mockPrisma.webhookDelivery.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          webhookId: "wh_1",
          success: true,
          statusCode: 200,
          error: null,
        }),
      });
    });
  });

  it("records a failed delivery when the webhook responds with a non-ok status", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: false, status: 500 });
    vi.stubGlobal("fetch", mockFetch);

    mockPrisma.webhook.findMany.mockResolvedValue([
      { id: "wh_1", url: "https://hooks.example.com/receive", secret: null },
    ]);

    await fireWebhooks(baseFeedback);

    await vi.waitFor(() => {
      expect(mockPrisma.webhookDelivery.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          webhookId: "wh_1",
          success: false,
          statusCode: 500,
          error: "HTTP 500",
        }),
      });
    });
  });

  it("records an error delivery when the fetch throws a network error", async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error("Network failure"));
    vi.stubGlobal("fetch", mockFetch);

    mockPrisma.webhook.findMany.mockResolvedValue([
      { id: "wh_1", url: "https://hooks.example.com/receive", secret: null },
    ]);

    await fireWebhooks(baseFeedback);

    await vi.waitFor(() => {
      expect(mockPrisma.webhookDelivery.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          webhookId: "wh_1",
          success: false,
          statusCode: null,
          error: "Network failure",
        }),
      });
    });
  });

  it("stores the full JSON payload in the delivery record", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal("fetch", mockFetch);

    mockPrisma.webhook.findMany.mockResolvedValue([
      { id: "wh_1", url: "https://hooks.example.com/receive", secret: null },
    ]);

    await fireWebhooks(baseFeedback);

    await vi.waitFor(() => {
      expect(mockPrisma.webhookDelivery.create).toHaveBeenCalled();
    });

    const createCall = mockPrisma.webhookDelivery.create.mock.calls[0][0];
    const storedPayload = JSON.parse(createCall.data.payload);
    expect(storedPayload.event).toBe("feedback.created");
    expect(storedPayload.feedback.id).toBe("fb_1");
  });

  it("fires multiple webhooks concurrently for the same project", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal("fetch", mockFetch);

    mockPrisma.webhook.findMany.mockResolvedValue([
      { id: "wh_1", url: "https://hooks1.example.com/receive", secret: null },
      { id: "wh_2", url: "https://hooks2.example.com/receive", secret: null },
    ]);

    await fireWebhooks(baseFeedback);

    expect(mockFetch).toHaveBeenCalledTimes(2);
    const urls = mockFetch.mock.calls.map(([url]) => url);
    expect(urls).toContain("https://hooks1.example.com/receive");
    expect(urls).toContain("https://hooks2.example.com/receive");
  });

  it("continues processing remaining webhooks even if one fails", async () => {
    const mockFetch = vi
      .fn()
      .mockRejectedValueOnce(new Error("First webhook failed"))
      .mockResolvedValueOnce({ ok: true, status: 200 });
    vi.stubGlobal("fetch", mockFetch);

    mockPrisma.webhook.findMany.mockResolvedValue([
      { id: "wh_1", url: "https://hooks1.example.com/receive", secret: null },
      { id: "wh_2", url: "https://hooks2.example.com/receive", secret: null },
    ]);

    // Should not throw even if one webhook fails
    await expect(fireWebhooks(baseFeedback)).resolves.toBeUndefined();
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("handles null email and pageUrl in the payload gracefully", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal("fetch", mockFetch);

    mockPrisma.webhook.findMany.mockResolvedValue([
      { id: "wh_1", url: "https://hooks.example.com/receive", secret: null },
    ]);

    await fireWebhooks({ ...baseFeedback, email: null, pageUrl: null });

    const [, options] = mockFetch.mock.calls[0];
    const body = JSON.parse(options.body);
    expect(body.feedback.email).toBeNull();
    expect(body.feedback.pageUrl).toBeNull();
  });

  it("queries only enabled webhooks for the given project", async () => {
    mockPrisma.webhook.findMany.mockResolvedValue([]);

    await fireWebhooks({ ...baseFeedback, projectId: "proj_xyz" });

    expect(mockPrisma.webhook.findMany).toHaveBeenCalledWith({
      where: { projectId: "proj_xyz", enabled: true },
    });
  });
});