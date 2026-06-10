import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { handleError } from "@/lib/api-helpers";
import { z } from "zod";

const createWebhookSchema = z.object({
  url:     z.string().url("Must be a valid URL"),
  label:   z.string().min(1).max(60).optional().default("My Webhook"),
  secret:  z.string().max(200).optional().nullable(),
  enabled: z.boolean().optional().default(true),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const project = await prisma.project.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const webhooks = await prisma.webhook.findMany({
      where:   { projectId: id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(webhooks.map((w: { id: string; projectId: string; url: string; label: string; secret: string | null; enabled: boolean; createdAt: Date }) => ({
      id:        w.id,
      projectId: w.projectId,
      url:       w.url,
      label:     w.label,
      secret:    w.secret ? "••••••••" : null,
      enabled:   w.enabled,
      createdAt: w.createdAt.toISOString(),
    })));
  } catch (e) {
    return handleError(e, "webhooks/GET");
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const project = await prisma.project.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body   = await req.json();
    const parsed = createWebhookSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const webhook = await prisma.webhook.create({
      data: { projectId: id, ...parsed.data },
    });

    return NextResponse.json({
      id:        webhook.id,
      projectId: webhook.projectId,
      url:       webhook.url,
      label:     webhook.label,
      secret:    webhook.secret ? "••••••••" : null,
      enabled:   webhook.enabled,
      createdAt: webhook.createdAt.toISOString(),
    }, { status: 201 });
  } catch (e) {
    return handleError(e, "webhooks/POST");
  }
}