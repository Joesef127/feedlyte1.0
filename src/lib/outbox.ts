import prisma from "@/lib/prisma";
import { fireWebhooks } from "@/lib/webhooks";

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

  await prisma.$executeRawUnsafe(
    `
      INSERT INTO outbox_events (
        event_type,
        payload,
        status,
        attempts,
        max_attempts,
        next_attempt_at,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
    `,
    eventType,
    JSON.stringify(payload),
    "pending",
    0,
    maxAttempts,
    nextAttemptAt,
  );
}

async function markEventCompleted(eventId: string): Promise<void> {
  await prisma.$executeRawUnsafe(
    `
      UPDATE outbox_events
      SET status = 'completed', updated_at = NOW(), completed_at = NOW()
      WHERE id = $1
    `,
    eventId,
  );
}

async function markEventFailed(eventId: string, attempts: number, maxAttempts: number): Promise<void> {
  const status = attempts >= maxAttempts ? "dead_letter" : "pending";
  const retryDelayMs = Math.min(5_000 * 2 ** Math.max(attempts - 1, 0), 60_000);
  const nextAttemptAt = new Date(Date.now() + retryDelayMs);

  await prisma.$executeRawUnsafe(
    `
      UPDATE outbox_events
      SET status = $1,
          attempts = $2,
          next_attempt_at = $3,
          updated_at = NOW()
      WHERE id = $4
    `,
    status,
    attempts,
    nextAttemptAt,
    eventId,
  );
}

export async function processDueOutboxEvents(limit = 25): Promise<number> {
  const safeLimit = Number.isFinite(limit)
    ? Math.min(Math.max(Math.trunc(limit), 1), 100)
    : 25;
  const rows = (await prisma.$queryRawUnsafe<OutboxEventRow[]>(`
    SELECT *
    FROM outbox_events
    WHERE status IN ('pending', 'processing')
      AND next_attempt_at <= NOW()
    ORDER BY created_at ASC
    LIMIT ${safeLimit}
  `)) as OutboxEventRow[];

  let processed = 0;

  for (const row of rows) {
    try {
      await prisma.$executeRawUnsafe(
        `
          UPDATE outbox_events
          SET status = 'processing', updated_at = NOW()
          WHERE id = $1
        `,
        row.id,
      );

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
