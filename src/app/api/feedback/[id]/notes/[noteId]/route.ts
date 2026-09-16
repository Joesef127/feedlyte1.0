import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { handleError, withApiVersionHeaders } from "@/lib/api-helpers";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; noteId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: feedbackId, noteId } = await params;

    const note = await prisma.feedbackNote.findUnique({
      where: { id: noteId },
      include: {
        feedback: {
          include: {
            project: { select: { userId: true } },
          },
        },
      },
    });

    if (!note || note.feedbackId !== feedbackId) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // Only note author or project owner can delete the note
    const isAuthor = note.userId === session.user.id;
    const isProjectOwner = note.feedback.project.userId === session.user.id;

    if (!isAuthor && !isProjectOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.feedbackNote.delete({
      where: { id: noteId },
    });

    return new NextResponse(null, {
      status: 204,
      headers: withApiVersionHeaders(),
    });
  } catch (error) {
    return handleError(error, "DELETE /api/feedback/[id]/notes/[noteId]");
  }
}
