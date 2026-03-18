import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { updateProjectSchema } from "@/lib/validations";
import { handleError } from "@/lib/api-helpers";

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
    const project = await prisma.project.findFirst({
      where: { id, userId: session.user.id },
      include: { _count: { select: { feedback: true } } },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    return NextResponse.json({
      id: project.id,
      name: project.name,
      color: project.color,
      position: project.position,
      label: project.label,
      createdAt: project.createdAt.toISOString(),
      feedbackCount: project._count.feedback,
      newCount: 0,
    });
  } catch (e) {
    return handleError(e, "projects/[id]/GET");
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
    const { id } = await params;
    const project = await prisma.project.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    await prisma.project.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    return handleError(e, "projects/[id]/DELETE");
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
    const { id } = await params;
    const body = await req.json();
    const parsed = updateProjectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const project = await prisma.project.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    const updated = await prisma.project.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      color: updated.color,
      position: updated.position,
      label: updated.label,
    });
  } catch (e) {
    return handleError(e, "projects/[id]/PATCH");
  }
}
