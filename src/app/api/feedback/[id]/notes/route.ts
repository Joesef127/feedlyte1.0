import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { createFeedbackNoteSchema } from "@/lib/validations";
import { handleError, withApiVersionHeaders } from "@/lib/api-helpers";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: feedbackId } = await params;

    const feedback = await prisma.feedback.findFirst({
      where: {
        id: feedbackId,
        project: { userId: session.user.id },
      },
      select: { id: true },
    });

    if (!feedback) {
      return NextResponse.json({ error: "Feedback not found" }, { status: 404 });
    }

    const notes = await prisma.feedbackNote.findMany({
      where: { feedbackId },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(
      notes.map((n) => ({
        id: n.id,
        feedbackId: n.feedbackId,
        userId: n.userId,
        user: n.user,
        content: n.content,
        createdAt: n.createdAt.toISOString(),
        updatedAt: n.updatedAt.toISOString(),
      })),
      { headers: withApiVersionHeaders() },
    );
  } catch (error) {
    return handleError(error, "GET /api/feedback/[id]/notes");
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: feedbackId } = await params;

    const feedback = await prisma.feedback.findFirst({
      where: {
        id: feedbackId,
        project: { userId: session.user.id },
      },
      select: { id: true, firstRespondedAt: true },
    });

    if (!feedback) {
      return NextResponse.json({ error: "Feedback not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = createFeedbackNoteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid note payload" },
        { status: 400 },
      );
    }

    const now = new Date();

    const note = await prisma.feedbackNote.create({
      data: {
        feedbackId,
        userId: session.user.id,
        content: parsed.data.content,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });

    if (!feedback.firstRespondedAt) {
      await prisma.feedback
        .update({
          where: { id: feedbackId },
          data: { firstRespondedAt: now },
        })
        .catch((err) => console.warn("Failed to set firstRespondedAt:", err));
    }

    return NextResponse.json(
      {
        id: note.id,
        feedbackId: note.feedbackId,
        userId: note.userId,
        user: note.user,
        content: note.content,
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString(),
      },
      { status: 201, headers: withApiVersionHeaders() },
    );
  } catch (error) {
    return handleError(error, "POST /api/feedback/[id]/notes");
  }
}
