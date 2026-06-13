import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { handleError } from "@/lib/api-helpers";
import { z } from "zod";

const updateWebhookSchema = z.object({
  url: z
    .string()
    .url("Must be a valid URL")
    .refine((v) => {
      try {
        return new URL(v).protocol === "https:";
      } catch {
        return false;
      }
    }, "URL must use HTTPS")
    .optional(),
  label:   z.string().min(1).max(60).optional(),
  secret:  z.string().max(200).optional().nullable(),
  enabled: z.boolean().optional(),
});

async function getWebhookForUser(webhookId: string, userId: string) {
  return prisma.webhook.findFirst({
    where: {
      id:      webhookId,
      project: { userId },
    },
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id }   = await params;
    const existing = await getWebhookForUser(id, session.user.id);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body   = await req.json();
    const parsed = updateWebhookSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const updated = await prisma.webhook.update({
      where: { id },
      data:  parsed.data,
    });

    return NextResponse.json({
      id:        updated.id,
      projectId: updated.projectId,
      url:       updated.url,
      label:     updated.label,
      secret:    updated.secret ? "••••••••" : null,
      enabled:   updated.enabled,
      createdAt: updated.createdAt.toISOString(),
    });
  } catch (e) {
    return handleError(e, "webhooks/[id]/PATCH");
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id }   = await params;
    const existing = await getWebhookForUser(id, session.user.id);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.webhook.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    return handleError(e, "webhooks/[id]/DELETE");
  }
}