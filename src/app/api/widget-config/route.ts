import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withWidgetVersionHeaders, WIDGET_CONFIG_VERSION } from "@/lib/api-helpers";
import { WIDGET_CORNER_STYLES, WIDGET_LAUNCHER_ICONS } from "@/types";

function sanitizeColor(value: string): string {
  return /^#[0-9A-Fa-f]{6}$/.test(value) ? value : "#F59E0B";
}

function sanitizeLabel(value: string): string {
  return value.length > 0 && value.length <= 30 ? value : "Feedback";
}

function sanitizeLauncherIcon(value?: string | null): string {
  return value && (WIDGET_LAUNCHER_ICONS as readonly string[]).includes(value) ? value : "message-square";
}

function sanitizeCornerStyle(value?: string | null): string {
  return value && (WIDGET_CORNER_STYLES as readonly string[]).includes(value) ? value : "rounded";
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
    select: {
      color: true,
      position: true,
      label: true,
      allowedOrigin: true,
      categoryEnabled: true,
      ratingEnabled: true,
      technicalDetailsEnabled: true,
      launcherIcon: true,
      cornerStyle: true,
      showBranding: true,
    },
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
      categoryEnabled: Boolean(project.categoryEnabled),
      ratingEnabled: Boolean(project.ratingEnabled),
      technicalDetailsEnabled: Boolean(project.technicalDetailsEnabled),
      launcherIcon: sanitizeLauncherIcon(project.launcherIcon),
      cornerStyle: sanitizeCornerStyle(project.cornerStyle),
      showBranding: project.showBranding !== false,
    },
    {
      headers: withWidgetVersionHeaders(),
    },
  );
}