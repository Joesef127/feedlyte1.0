import { afterEach, describe, expect, it, vi } from "vitest";

import {
  sendDailyDigestEmail,
  sendFeedbackNotificationEmail,
  setEmailTransport,
} from "@/lib/email";

const feedback = {
  message: "A useful suggestion",
  email: "user@example.com",
  pageUrl: "https://example.com/page",
  userAgent: "Mozilla/5.0 Chrome/120.0 Windows NT 10.0",
  status: "unreviewed",
  createdAt: "2024-01-15T10:00:00.000Z",
};

afterEach(() => {
  setEmailTransport(null);
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("email transport", () => {
  it("uses an injected transport for feedback notifications", async () => {
    const send = vi.fn().mockResolvedValue({ id: "email_1" });
    setEmailTransport({ send });

    const result = await sendFeedbackNotificationEmail(
      "owner@example.com",
      "Acme",
      feedback,
      "https://app.example.com/dashboard",
      "https://app.example.com/unsubscribe?token=token",
    );

    expect(result).toEqual({ success: true });
    expect(send).toHaveBeenCalledWith(expect.objectContaining({
      to: "owner@example.com",
      subject: "New feedback on Acme",
      html: expect.stringContaining("A useful suggestion"),
    }));
  });

  it("returns a stable failure when the transport rejects", async () => {
    setEmailTransport({
      send: vi.fn().mockRejectedValue(new Error("provider unavailable")),
    });

    const result = await sendDailyDigestEmail(
      "owner@example.com",
      "Acme",
      [feedback],
      "https://app.example.com/dashboard",
      "https://app.example.com/unsubscribe?token=token",
    );

    expect(result).toEqual({ success: false, error: "Failed to send email." });
  });

  it("uses the no-op transport in the test environment when no transport is configured", async () => {
    vi.stubEnv("RESEND_API_KEY", "");

    const result = await sendDailyDigestEmail(
      "owner@example.com",
      "Acme",
      [feedback],
      "https://app.example.com/dashboard",
      "https://app.example.com/unsubscribe?token=token",
    );

    expect(result).toEqual({ success: true });
  });
});
