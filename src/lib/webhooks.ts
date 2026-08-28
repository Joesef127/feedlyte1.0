import prisma from "@/lib/prisma";
import crypto from "crypto";
import dns from "node:dns/promises";
import net from "node:net";

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

function isBlockedIpv4(address: string): boolean {
  const octets = address.split(".").map(Number);
  if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) {
    return true;
  }

  const [first, second] = octets;
  return first === 0 ||
    first === 10 ||
    first === 127 ||
    (first === 100 && second >= 64 && second <= 127) ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && (second === 0 || second === 168)) ||
    (first === 198 && second >= 18 && second <= 19) ||
    (first === 198 && second === 51) ||
    (first === 203 && second === 0);
}

function isBlockedIpv6(address: string): boolean {
  const normalized = address.toLowerCase().split("%", 1)[0];
  if (normalized === "::" || normalized === "::1") return true;

  const parts = normalized.split("::");
  if (parts.length > 2) return true;
  const left = parts[0] ? parts[0].split(":") : [];
  const right = parts[1] ? parts[1].split(":") : [];
  const expanded = parts.length === 2
    ? [...left, ...Array(8 - left.length - right.length).fill("0"), ...right]
    : left;
  if (expanded.length !== 8 || expanded.some((part) => !/^[0-9a-f]{1,4}$/.test(part))) return true;

  const first = Number.parseInt(expanded[0], 16);
  const second = Number.parseInt(expanded[1], 16);
  return (first & 0xfe00) === 0xfc00 ||
    (first & 0xffc0) === 0xfe80 ||
    (first === 0x2001 && second === 0x0db8) ||
    (expanded.slice(0, 5).every((part) => part === "0") &&
      (expanded[5] === "ffff" || expanded[5] === "0"));
}

function isBlockedAddress(address: string): boolean {
  const family = net.isIP(address);
  return family === 4 ? isBlockedIpv4(address) : family === 6 ? isBlockedIpv6(address) : true;
}

async function validateWebhookUrl(rawUrl: string): Promise<URL> {
  const url = new URL(rawUrl);
  if (url.protocol !== "https:" || url.username || url.password || url.port === "80") {
    throw new Error("Webhook URL is not an allowed HTTPS destination.");
  }

  const hostname = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname === "metadata.google.internal") {
    throw new Error("Webhook URL resolves to a blocked destination.");
  }

  const addresses = net.isIP(hostname)
    ? [{ address: hostname }]
    : await dns.lookup(hostname, { all: true, verbatim: true });
  if (!addresses.length || addresses.some(({ address }) => isBlockedAddress(address))) {
    throw new Error("Webhook URL resolves to a blocked destination.");
  }

  return url;
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
        await validateWebhookUrl(webhook.url);
        const res = await fetch(webhook.url, {
          method:  "POST",
          headers,
          body,
          signal:  AbortSignal.timeout(10_000),
          redirect: "error",
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