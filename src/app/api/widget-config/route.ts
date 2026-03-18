import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Public — no auth. Returns only non-sensitive widget config for a given project.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("project") ?? "";

  if (!id) {
    return NextResponse.json({ error: "Missing project id." }, { status: 400 });
  }

  const project = await prisma.project.findUnique({
    where: { id },
    select: { color: true, label: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  return NextResponse.json({ color: project.color, label: project.label });
}
