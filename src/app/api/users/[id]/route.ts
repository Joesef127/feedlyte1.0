import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { handleError } from "@/lib/api-helpers";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return handleError(error, "GET /api/users/[id]");
  }
}

// DELETE /api/users/[id] — delete account
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;

    // Users can only delete their own account
    if (id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    // Cascade delete handled by Prisma schema (onDelete: Cascade on projects/feedback)
    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ message: "Account deleted." });
  } catch (e) {
    return handleError(e, "DELETE /api/users/[id]");
  }
}
