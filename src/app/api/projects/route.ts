import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { createProjectSchema } from "@/lib/validations";
import { handleError } from "@/lib/api-helpers";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const projects = await prisma.project.findMany({
      where:   { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count:   { select: { feedback: true } },
        feedback: { where: { status: "new" }, select: { id: true } },
      },
    });

    return NextResponse.json(
      projects.map((p) => ({
        id:            p.id,
        name:          p.name,
        color:         p.color,
        position:      p.position,
        label:         p.label,
        allowedOrigin: p.allowedOrigin ?? null,
        createdAt:     p.createdAt.toISOString(),
        feedbackCount: p._count.feedback,
        newCount:      p.feedback.length,
      }))
    );
  } catch (e) {
    return handleError(e, "projects/GET");
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body   = await req.json();
    const parsed = createProjectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({
      data: { ...parsed.data, userId: session.user.id },
    });

    return NextResponse.json(
      {
        id:            project.id,
        name:          project.name,
        color:         project.color,
        position:      project.position,
        label:         project.label,
        allowedOrigin: project.allowedOrigin ?? null,
        createdAt:     project.createdAt.toISOString(),
        feedbackCount: 0,
        newCount:      0,
      },
      { status: 201 }
    );
  } catch (e) {
    return handleError(e, "projects/POST");
  }
}