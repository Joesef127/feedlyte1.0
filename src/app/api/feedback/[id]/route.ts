import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { updateStatusSchema } from "@/lib/validations";

// Helper: verify feedback ownership (user must own the project the feedback belongs to)
async function getOwnedFeedback(id: string, userId: string) {
  return prisma.feedback.findFirst({
    where: {
      id,
      project: { userId },
    },
  });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const feedback = await getOwnedFeedback(id, session.user.id);
  if (!feedback) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.feedback.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const feedback = await getOwnedFeedback(id, session.user.id);
  if (!feedback) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const parsed = updateStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const updated = await prisma.feedback.update({
      where: { id },
      data: { status: parsed.data.status },
    });

    return NextResponse.json({
      id: updated.id,
      status: updated.status,
    });
  } catch (e) {
    console.error("[feedback/PATCH]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
