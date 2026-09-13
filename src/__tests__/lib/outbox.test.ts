import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  default: {
    outboxEvent: {
      create: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/webhooks", () => ({
  fireWebhooks: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/email", () => ({
  sendFeedbackNotificationEmail: vi.fn().mockResolvedValue({ success: true }),
  sendDailyDigestEmail: vi.fn().mockResolvedValue({ success: true }),
  createUnsubscribeToken: vi.fn().mockResolvedValue("token_123"),
}));

import prisma from "@/lib/prisma";
import { sendDailyDigestEmail } from "@/lib/email";
import { fireWebhooks } from "@/lib/webhooks";
import { enqueueOutboxEvent, processDueOutboxEvents } from "@/lib/outbox";

const mockPrisma = prisma as unknown as {
  outboxEvent: {
    create: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
};

const mockFireWebhooks = fireWebhooks as ReturnType<typeof vi.fn>;
const mockSendDailyDigestEmail = sendDailyDigestEmail as ReturnType<typeof vi.fn>;

describe("outbox job system", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("queues a feedback-created event with pending status", async () => {
    mockPrisma.outboxEvent.create.mockResolvedValue({ id: "evt_1" });

    await enqueueOutboxEvent("feedback.created", {
      id: "fb_123",
      projectId: "proj_123",
      message: "Great product",
    });

    expect(mockPrisma.outboxEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        eventType: "feedback.created",
        payload: expect.stringContaining('"id":"fb_123"'),
        status: "pending",
        attempts: 0,
        maxAttempts: 5,
        nextAttemptAt: expect.any(Date),
      }),
    });
  });

  it("processes a due feedback event and fires downstream webhooks", async () => {
    const payload = {
      id: "fb_123",
      projectId: "proj_123",
      message: "Great product",
      email: "user@example.com",
      pageUrl: "https://example.com",
      status: "unreviewed",
      createdAt: "2024-01-01T00:00:00.000Z",
    };

    mockPrisma.outboxEvent.findMany.mockResolvedValue([
      {
        id: "evt_1",
        eventType: "feedback.created",
        payload: JSON.stringify(payload),
        status: "pending",
        attempts: 0,
        maxAttempts: 5,
        nextAttemptAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    mockPrisma.outboxEvent.update.mockResolvedValue({});

    await processDueOutboxEvents(10);

    expect(mockFireWebhooks).toHaveBeenCalledWith(payload);
    expect(mockPrisma.outboxEvent.update).toHaveBeenCalledWith({
      where: { id: "evt_1" },
      data: { status: "processing" },
    });
    expect(mockPrisma.outboxEvent.update).toHaveBeenCalledWith({
      where: { id: "evt_1" },
      data: { status: "completed", completedAt: expect.any(Date) },
    });
  });

  it("processes due digest email events and sends digest emails", async () => {
    const digestPayload = {
      to: "owner@example.com",
      projectName: "Acme",
      feedbackItems: [{
        message: "Looks good",
        email: "user@example.com",
        status: "unreviewed",
        createdAt: "2024-01-01T00:00:00.000Z",
      }],
      dashboardUrl: "https://app.example.com/projects/proj_123",
      unsubscribeUrl: "https://app.example.com/unsubscribe/token",
    };

    mockPrisma.outboxEvent.findMany.mockResolvedValue([
      {
        id: "evt_2",
        eventType: "email.digest",
        payload: JSON.stringify(digestPayload),
        status: "pending",
        attempts: 0,
        maxAttempts: 5,
        nextAttemptAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    mockPrisma.outboxEvent.update.mockResolvedValue({});

    await processDueOutboxEvents(10);

    expect(mockSendDailyDigestEmail).toHaveBeenCalledWith(
      "owner@example.com",
      "Acme",
      [
        expect.objectContaining({
          message: "Looks good",
          email: "user@example.com",
          status: "unreviewed",
        }),
      ],
      "https://app.example.com/projects/proj_123",
      "https://app.example.com/unsubscribe/token",
    );

    expect(mockPrisma.outboxEvent.update).toHaveBeenCalledWith({
      where: { id: "evt_2" },
      data: { status: "completed", completedAt: expect.any(Date) },
    });
  });
});
