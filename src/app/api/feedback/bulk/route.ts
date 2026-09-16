import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { bulkFeedbackActionSchema } from "@/lib/validations";
import { handleError, withApiVersionHeaders } from "@/lib/api-helpers";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = bulkFeedbackActionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid bulk action request" },
        { status: 400 },
      );
    }

    const { action, feedbackIds } = parsed.data;

    // Secure tenancy check: verify all targeted items belong to projects owned by the user
    const accessibleFeedback = await prisma.feedback.findMany({
      where: {
        id: { in: feedbackIds },
        project: { userId: session.user.id },
      },
      select: { id: true, tags: true, resolvedAt: true },
    });

    const validIds = accessibleFeedback.map((f) => f.id);
    if (validIds.length === 0) {
      return NextResponse.json(
        { error: "No matching feedback items found or unauthorized." },
        { status: 404 },
      );
    }

    if (action === "status") {
      const now = new Date();
      const isResolving = parsed.data.status === "resolved";

      await prisma.feedback.updateMany({
        where: { id: { in: validIds } },
        data: {
          status: parsed.data.status,
          resolvedAt: isResolving ? now : null,
        },
      });

      return NextResponse.json(
        {
          success: true,
          count: validIds.length,
          action: "status",
          status: parsed.data.status,
        },
        { headers: withApiVersionHeaders() },
      );
    }

    if (action === "delete") {
      await prisma.feedback.deleteMany({
        where: { id: { in: validIds } },
      });

      return NextResponse.json(
        {
          success: true,
          count: validIds.length,
          action: "delete",
        },
        { headers: withApiVersionHeaders() },
      );
    }

    if (action === "assign") {
      const { assigneeId } = parsed.data;

      // If assigning to a user, verify assignee exists
      if (assigneeId) {
        const assigneeExists = await prisma.user.findUnique({
          where: { id: assigneeId },
          select: { id: true },
        });

        if (!assigneeExists) {
          return NextResponse.json(
            { error: "Assignee user does not exist" },
            { status: 400 },
          );
        }
      }

      await prisma.feedback.updateMany({
        where: { id: { in: validIds } },
        data: { assignedToId: assigneeId },
      });

      return NextResponse.json(
        {
          success: true,
          count: validIds.length,
          action: "assign",
          assigneeId,
        },
        { headers: withApiVersionHeaders() },
      );
    }

    if (action === "tag") {
      const { tags, operation } = parsed.data;

      if (operation === "set") {
        await prisma.feedback.updateMany({
          where: { id: { in: validIds } },
          data: { tags },
        });
      } else {
        // Atomic update per item for set union/difference
        await prisma.$transaction(
          accessibleFeedback.map((item) => {
            let nextTags = item.tags;
            if (operation === "add") {
              nextTags = Array.from(new Set([...item.tags, ...tags]));
            } else if (operation === "remove") {
              nextTags = item.tags.filter((t) => !tags.includes(t));
            }
            return prisma.feedback.update({
              where: { id: item.id },
              data: { tags: nextTags },
            });
          }),
        );
      }

      return NextResponse.json(
        {
          success: true,
          count: validIds.length,
          action: "tag",
          operation,
          tags,
        },
        { headers: withApiVersionHeaders() },
      );
    }

    return NextResponse.json({ error: "Unsupported bulk action" }, { status: 400 });
  } catch (error) {
    return handleError(error, "POST /api/feedback/bulk");
  }
}
