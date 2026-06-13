import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { handleError } from "@/lib/api-helpers";

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

    const webhook = await prisma.webhook.findFirst({
      where: { id, project: { userId: session.user.id } },
    });
    if (!webhook) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const deliveries = await prisma.webhookDelivery.findMany({
      where:   { webhookId: id },
      orderBy: { createdAt: "desc" },
      take:    20,
    });

    return NextResponse.json(deliveries.map((d: { id: string; success: boolean; statusCode: number | null; error: string | null; createdAt: Date }) => ({
      id:         d.id,
      success:    d.success,
      statusCode: d.statusCode,
      error:      d.error,
      createdAt:  d.createdAt.toISOString(),
    })));
  } catch (e) {
    return handleError(e, "webhooks/[id]/deliveries/GET");
  }
}