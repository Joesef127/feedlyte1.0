import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const project = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const url = new URL(req.url);
  const limitParam = url.searchParams.get("limit");
  const cursorParam = url.searchParams.get("cursor");
  const q = (url.searchParams.get("q") ?? "").trim().slice(0, 200);
  const status = url.searchParams.get("status") ?? "";
  const requestedLimit = limitParam ? Number.parseInt(limitParam, 10) : 100;
  const take = Number.isFinite(requestedLimit)
    ? Math.min(Math.max(requestedLimit, 1), 100)
    : 100;

  const feedback = await prisma.feedback.findMany({
    where: {
      projectId: id,
      ...(status ? { status } : {}),
      ...(q ? {
        OR: [
          { message: { contains: q, mode: "insensitive" } },
          { email:   { contains: q, mode: "insensitive" } },
          { pageUrl: { contains: q, mode: "insensitive" } },
        ],
      } : {}),
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take,
    ...(cursorParam ? { cursor: { id: cursorParam }, skip: 1 } : {}),
  });

  const headers = new Headers();
  if (feedback.length === take && feedback.at(-1)) {
    headers.set("x-next-cursor", feedback.at(-1)!.id);
  }

  return NextResponse.json(
    feedback.map((f) => ({
      id:        f.id,
      projectId: f.projectId,
      message:   f.message,
      email:     f.email     ?? "",
      pageUrl:   f.pageUrl   ?? "",
      userAgent: f.userAgent ?? "",
      status:    f.status,
      createdAt: f.createdAt.toISOString(),
    })),
    { headers },
  );
}