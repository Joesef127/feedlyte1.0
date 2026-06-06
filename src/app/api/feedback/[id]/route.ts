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

    return NextResponse.json({
      id:        feedback.id,
      projectId: feedback.projectId,
      message:   feedback.message,
      email:     feedback.email    ?? "",
      pageUrl:   feedback.pageUrl  ?? "",
      userAgent: feedback.userAgent ?? "",
      status:    feedback.status,
      createdAt: feedback.createdAt.toISOString(),
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

    const body   = await req.json();
    const parsed = updateStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const updated = await prisma.feedback.update({
      where: { id },
      data:  { status: parsed.data.status },
    });

    return NextResponse.json({ id: updated.id, status: updated.status });
  } catch (e) {
    return handleError(e, "PATCH /api/feedback/[id]");
  }
}