import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withWidgetVersionHeaders, WIDGET_CONFIG_VERSION } from "@/lib/api-helpers";

function sanitizeColor(value: string): string {
  return /^#[0-9A-Fa-f]{6}$/.test(value) ? value : "#F59E0B";
}

function sanitizeLabel(value: string): string {
  return value.length > 0 && value.length <= 30 ? value : "Feedback";
}

// Public — no auth. Returns only non-sensitive widget config for a given project.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("project") ?? "";

  if (!id) {
    return NextResponse.json({ error: "Missing project id." }, { status: 400 });
  }

  const project = await prisma.project.findUnique({
    where:  { id },
    select: { color: true, position: true, label: true, allowedOrigin: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  return NextResponse.json(
    {
      version: WIDGET_CONFIG_VERSION,
      color: sanitizeColor(project.color),
      position: project.position === "bottom-left" ? "bottom-left" : "bottom-right",
      label: sanitizeLabel(project.label),
      allowedOrigin: project.allowedOrigin ?? null,
    },
    {
      headers: withWidgetVersionHeaders(),
    },
  );
}