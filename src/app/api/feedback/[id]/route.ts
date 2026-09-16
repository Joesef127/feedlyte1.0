import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { updateStatusSchema } from "@/lib/validations";
import { handleError } from "@/lib/api-helpers";

// Helper: verify feedback ownership
async function getOwnedFeedback(id: string, userId: string) {
  return prisma.feedback.findFirst({
    where: { id, project: { userId } },
  });
}

// GET /api/feedback/[id] — fetch single feedback item with project context
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const feedback = await prisma.feedback.findFirst({
      where: {
        id,
        project: { userId: session.user.id },
      },
      include: {
        project: {
          select: { id: true, name: true, color: true },
        },
        assignedTo: {
          select: { id: true, name: true, email: true, image: true },
        },
        notes: {
          include: {
            user: { select: { id: true, name: true, email: true, image: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!feedback) {
      return NextResponse.json({ error: "Feedback not found." }, { status: 404 });
    }

    // Fetch similar feedback from the same page URL
    const similar = feedback.pageUrl
      ? await prisma.feedback.findMany({
          where: {
            pageUrl:   feedback.pageUrl,
            projectId: feedback.projectId,
            id:        { not: feedback.id },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id:        true,
            message:   true,
            status:    true,
            createdAt: true,
          },
        })
      : [];

    let technicalDetails: Record<string, string> | null = null;
    if (feedback.technicalDetails) {
      try {
        const parsed = JSON.parse(feedback.technicalDetails);
        technicalDetails = parsed && typeof parsed === "object" ? parsed : null;
      } catch {
        technicalDetails = null;
      }
    }

    return NextResponse.json({
      id:               feedback.id,
      projectId:        feedback.projectId,
      message:          feedback.message,
      email:            feedback.email    ?? "",
      pageUrl:          feedback.pageUrl  ?? "",
      userAgent:        feedback.userAgent ?? "",
      status:           feedback.status,
      category:         feedback.category ?? null,
      rating:           feedback.rating ?? null,
      technicalDetails,
      tags:             feedback.tags,
      assignedToId:     feedback.assignedToId,
      assignedTo:       feedback.assignedTo,
      resolvedAt:       feedback.resolvedAt?.toISOString() ?? null,
      firstRespondedAt: feedback.firstRespondedAt?.toISOString() ?? null,
      notes: feedback.notes.map((n) => ({
        id:         n.id,
        feedbackId: n.feedbackId,
        userId:     n.userId,
        user:       n.user,
        content:    n.content,
        createdAt:  n.createdAt.toISOString(),
        updatedAt:  n.updatedAt.toISOString(),
      })),
      notesCount:       feedback.notes.length,
      createdAt:        feedback.createdAt.toISOString(),
      updatedAt:        feedback.updatedAt.toISOString(),
      project: {
        id:    feedback.project.id,
        name:  feedback.project.name,
        color: feedback.project.color,
      },
      similar: similar.map((s) => ({
        id:        s.id,
        message:   s.message,
        status:    s.status,
        createdAt: s.createdAt.toISOString(),
      })),
    });
  } catch (e) {
    return handleError(e, "GET /api/feedback/[id]");
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id }     = await params;
    const feedback   = await getOwnedFeedback(id, session.user.id);
    if (!feedback) {
      return NextResponse.json({ error: "Feedback not found." }, { status: 404 });
    }

    await prisma.feedback.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    return handleError(e, "DELETE /api/feedback/[id]");
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id }   = await params;
    const feedback = await getOwnedFeedback(id, session.user.id);
    if (!feedback) {
      return NextResponse.json({ error: "Feedback not found." }, { status: 404 });
    }

    const body = await req.json();
    const { updateFeedbackDetailsSchema } = await import("@/lib/validations");
    const parsed = updateFeedbackDetailsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid update payload" },
        { status: 400 }
      );
    }

    const dataToUpdate: Record<string, unknown> = {};

    if (parsed.data.status !== undefined) {
      dataToUpdate.status = parsed.data.status;
      if (parsed.data.status === "resolved") {
        if (!feedback.resolvedAt) {
          dataToUpdate.resolvedAt = new Date();
        }
      } else {
        dataToUpdate.resolvedAt = null;
      }
    }

    if (parsed.data.tags !== undefined) {
      dataToUpdate.tags = parsed.data.tags;
    }

    if (parsed.data.assignedToId !== undefined) {
      if (parsed.data.assignedToId) {
        const userExists = await prisma.user.findUnique({
          where: { id: parsed.data.assignedToId },
          select: { id: true },
        });
        if (!userExists) {
          return NextResponse.json({ error: "Assignee does not exist" }, { status: 400 });
        }
      }
      dataToUpdate.assignedToId = parsed.data.assignedToId;
    }

    const updated = await prisma.feedback.update({
      where: { id },
      data:  dataToUpdate,
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });

    return NextResponse.json({
      id:               updated.id,
      status:           updated.status,
      tags:             updated.tags,
      assignedToId:     updated.assignedToId,
      assignedTo:       updated.assignedTo,
      resolvedAt:       updated.resolvedAt?.toISOString() ?? null,
      firstRespondedAt: updated.firstRespondedAt?.toISOString() ?? null,
      updatedAt:        updated.updatedAt.toISOString(),
    });
  } catch (e) {
    return handleError(e, "PATCH /api/feedback/[id]");
  }
}