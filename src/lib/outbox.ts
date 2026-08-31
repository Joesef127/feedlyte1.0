import prisma from "@/lib/prisma";
import { fireWebhooks } from "@/lib/webhooks";
import { sendDailyDigestEmail, sendFeedbackNotificationEmail } from "@/lib/email";

export type OutboxStatus = "pending" | "processing" | "completed" | "failed" | "dead_letter";

interface OutboxEventRow {
  id: string;
  eventType: string;
  payload: string;
  status: OutboxStatus;
  attempts: number;
  maxAttempts: number;
  nextAttemptAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export async function enqueueOutboxEvent(
  eventType: string,
  payload: Record<string, unknown>,
  options: { maxAttempts?: number; delayMs?: number } = {},
): Promise<void> {
  const maxAttempts = options.maxAttempts ?? 5;
  const nextAttemptAt = new Date(Date.now() + (options.delayMs ?? 0));

  await prisma.outboxEvent.create({
    data: {
      eventType,
      payload: JSON.stringify(payload),
      status: "pending",
      attempts: 0,
      maxAttempts,
      nextAttemptAt,
    },
  });
}

async function markEventCompleted(eventId: string): Promise<void> {
  await prisma.outboxEvent.update({
    where: { id: eventId },
    data: {
      status: "completed",
      completedAt: new Date(),
    },
  });
}

async function markEventFailed(eventId: string, attempts: number, maxAttempts: number): Promise<void> {
  const status = attempts >= maxAttempts ? "dead_letter" : "pending";
  const retryDelayMs = Math.min(5_000 * 2 ** Math.max(attempts - 1, 0), 60_000);
  const nextAttemptAt = new Date(Date.now() + retryDelayMs);

  await prisma.outboxEvent.update({
    where: { id: eventId },
    data: {
      status,
      attempts,
      nextAttemptAt,
    },
  });
}

export async function processDueOutboxEvents(limit = 25): Promise<number> {
  const safeLimit = Number.isFinite(limit)
    ? Math.min(Math.max(Math.trunc(limit), 1), 100)
    : 25;
  const rows = await prisma.outboxEvent.findMany({
    where: {
      status: { in: ["pending", "processing"] },
      nextAttemptAt: { lte: new Date() },
    },
    orderBy: { createdAt: "asc" },
    take: safeLimit,
  });

  let processed = 0;

  for (const row of rows) {
    try {
      await prisma.outboxEvent.update({
        where: { id: row.id },
        data: { status: "processing" },
      });

      const payload = JSON.parse(row.payload) as Record<string, unknown>;

      switch (row.eventType) {
        case "feedback.created": {
          await fireWebhooks({
            id: String(payload.id ?? ""),
            projectId: String(payload.projectId ?? ""),
            message: String(payload.message ?? ""),
            email: typeof payload.email === "string" ? payload.email : null,
            pageUrl: typeof payload.pageUrl === "string" ? payload.pageUrl : null,
            status: typeof payload.status === "string" ? payload.status : "unreviewed",
            createdAt: typeof payload.createdAt === "string" ? payload.createdAt : new Date().toISOString(),
          });
          break;
        }
        case "email.notification": {
          const recipient = typeof payload.to === "string" ? payload.to : null;
          const projectName = typeof payload.projectName === "string" ? payload.projectName : "Project";
          const feedbackPayload = {
            message: String(payload.message ?? ""),
            email: typeof payload.email === "string" ? payload.email : null,
            pageUrl: typeof payload.pageUrl === "string" ? payload.pageUrl : null,
            userAgent: typeof payload.userAgent === "string" ? payload.userAgent : null,
            createdAt: typeof payload.createdAt === "string" ? payload.createdAt : new Date().toISOString(),
          };

          if (!recipient) break;

          await sendFeedbackNotificationEmail(
            recipient,
            projectName,
            feedbackPayload,
            typeof payload.dashboardUrl === "string" ? payload.dashboardUrl : "",
            typeof payload.unsubscribeUrl === "string" ? payload.unsubscribeUrl : "",
          );
          break;
        }
        case "email.digest": {
          const recipient = typeof payload.to === "string" ? payload.to : null;
          const projectName = typeof payload.projectName === "string" ? payload.projectName : "Project";
          const feedbackItems = Array.isArray(payload.feedbackItems)
            ? payload.feedbackItems.map((item) => {
                if (!item || typeof item !== "object") return null;
                const record = item as Record<string, unknown>;
                return {
                  message: String(record.message ?? ""),
                  email: typeof record.email === "string" ? record.email : null,
                  pageUrl: typeof record.pageUrl === "string" ? record.pageUrl : null,
                  userAgent: typeof record.userAgent === "string" ? record.userAgent : null,
                  status: typeof record.status === "string" ? record.status : "unreviewed",
                  createdAt: typeof record.createdAt === "string" ? record.createdAt : new Date().toISOString(),
                };
              })
            : [];

          if (!recipient) break;

          await sendDailyDigestEmail(
            recipient,
            projectName,
            feedbackItems.filter(Boolean) as Array<{
              message: string;
              email?: string | null;
              pageUrl?: string | null;
              userAgent?: string | null;
              status: string;
              createdAt: string;
            }>,
            typeof payload.dashboardUrl === "string" ? payload.dashboardUrl : "",
            typeof payload.unsubscribeUrl === "string" ? payload.unsubscribeUrl : "",
          );
          break;
        }
        default:
          break;
      }

      await markEventCompleted(row.id);
      processed += 1;
    } catch {
      const attempts = Number(row.attempts) + 1;
      await markEventFailed(row.id, attempts, Number(row.maxAttempts));
    }
  }

  return processed;
}
