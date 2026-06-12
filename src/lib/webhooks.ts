import prisma from "@/lib/prisma";
import crypto from "crypto";

interface FeedbackPayload {
  id:        string;
  projectId: string;
  message:   string;
  email:     string | null;
  pageUrl:   string | null;
  status:    string;
  createdAt: string;
}

function sign(secret: string, body: string): string {
  return crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");
}

export async function fireWebhooks(payload: FeedbackPayload): Promise<void> {
  const webhooks = await prisma.webhook.findMany({
    where: { projectId: payload.projectId, enabled: true },
  });

  if (!webhooks.length) return;

  const body = JSON.stringify({
    event:    "feedback.created",
    feedback: payload,
  });

  const deliveryResults = await Promise.allSettled(
    webhooks.map(async (webhook: { id: string; url: string; secret: string | null }) => {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "User-Agent":   "Feedlyte-Webhook/1.0",
      };

      if (webhook.secret) {
        headers["X-Feedlyte-Signature"] = sign(webhook.secret, body);
      }

      let success    = false;
      let statusCode: number | null = null;
      let error: string | null = null;

      try {
        const res = await fetch(webhook.url, {
          method:  "POST",
          headers,
          body,
          signal:  AbortSignal.timeout(10_000),
        });

        statusCode = res.status;
        success    = res.ok;
        if (!res.ok) error = `HTTP ${res.status}`;
      } catch (e) {
        error = e instanceof Error ? e.message : "Unknown error";
      }

      return { webhookId: webhook.id, success, statusCode, error, payload: body };
    })
  );

  // Persist delivery logs after all deliveries complete
  // Await to ensure writes complete in serverless environments
  await Promise.allSettled(
    deliveryResults
      .filter((r): r is PromiseFulfilledResult<{ webhookId: string; success: boolean; statusCode: number | null; error: string | null; payload: string }> => r.status === "fulfilled")
      .map((r) =>
        prisma.webhookDelivery.create({
          data: {
            webhookId: r.value.webhookId,
            success: r.value.success,
            statusCode: r.value.statusCode,
            error: r.value.error,
            payload: r.value.payload,
          },
        })
      )
  );
}