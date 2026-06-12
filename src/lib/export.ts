import { jsPDF } from "jspdf";
import "jspdf-autotable";
import type { Feedback } from "@/types";

// ── CSV ────────────────────────────────────────────────────────────────────────

export function exportFeedbackCSV(
  feedback: Feedback[],
  projectMap: Record<string, { name: string; color: string }>,
  filename = "feedback-export.csv",
) {
  const headers = [
    "ID",
    "Message",
    "Email",
    "Page URL",
    "Status",
    "Project",
    "Submitted",
  ];

  const rows = feedback.map((f) => [
    f.id,
    f.message,
    f.email ?? "",
    f.pageUrl ?? "",
    f.status,
    projectMap[f.projectId]?.name ?? f.projectId,
    new Date(f.createdAt).toISOString(),
  ]);

  const escape = (val: string) => {
    const str = String(val);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csv = [headers, ...rows]
    .map((row) => row.map(escape).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// ── JSON ───────────────────────────────────────────────────────────────────────

export function exportFeedbackJSON(
  feedback: Feedback[],
  projectMap: Record<string, { name: string; color: string }>,
  filename = "feedback-export.json",
) {
  const data = feedback.map((f) => ({
    id: f.id,
    projectId: f.projectId,
    projectName: projectMap[f.projectId]?.name ?? f.projectId,
    projectColor: projectMap[f.projectId]?.color ?? null,
    message: f.message,
    email: f.email ?? null,
    pageUrl: f.pageUrl ?? null,
    userAgent: f.userAgent ?? null,
    status: f.status,
    createdAt: f.createdAt,
  }));

  const json = JSON.stringify(data, null, 2);

  const blob = new Blob([json], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// ── PDF ────────────────────────────────────────────────────────────────────────

// Brand colors
const AMBER: [number, number, number] = [245, 158, 11];

function hexToRgb(hex: string): [number, number, number] {
  // Normalize and validate
  let clean = hex.trim().replace(/^#/, "");
  
  // Expand 3-digit to 6-digit (#fff -> #ffffff)
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  
  // Validate 6-digit hex
  if (!/^[0-9A-Fa-f]{6}$/.test(clean)) {
    // Return amber fallback color
    return [245, 158, 11];
  }
  
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return [r, g, b];
}

const DARK_BG: [number, number, number] = [15, 15, 15];
const CARD_BG: [number, number, number] = [25, 25, 25];
const BORDER: [number, number, number] = [60, 60, 60];
const TEXT_PRIMARY: [number, number, number] = [240, 237, 232];
const TEXT_MUTED: [number, number, number] = [145, 145, 145];

const STATUS_COLORS: Record<string, [number, number, number]> = {
  unreviewed: [245, 158, 11],
  reviewed: [59, 130, 246],
  resolved: [34, 197, 94],
};

const STATUS_LABELS: Record<string, string> = {
  unreviewed: "Unreviewed",
  reviewed: "Reviewed",
  resolved: "Resolved",
};

function parseUserAgent(ua: string): { browser: string; os: string } {
  if (!ua) return { browser: "Unknown", os: "Unknown" };

  const browser = ua.includes("Edg/")
    ? "Edge"
    : ua.includes("Chrome/")
      ? "Chrome"
      : ua.includes("Firefox/")
        ? "Firefox"
        : ua.includes("Safari/")
          ? "Safari"
          : ua.includes("OPR/")
            ? "Opera"
            : "Unknown";

  const os = ua.includes("Windows NT")
    ? "Windows"
    : ua.includes("Mac OS X")
      ? "macOS"
      : ua.includes("Android")
        ? "Android"
        : ua.includes("iPhone")
          ? "iOS"
          : ua.includes("iPad")
            ? "iPadOS"
            : ua.includes("Linux")
              ? "Linux"
              : "Unknown";

  return { browser, os };
}

function getUniqueProjects(
  feedback: Feedback[],
  projectMap: Record<string, { name: string; color: string }>,
): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const f of feedback) {
    const pid = f.projectId;
    if (!seen.has(pid)) {
      seen.add(pid);
      result.push(pid);
    }
  }
  return result;
}

function drawRoundedRect(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fillColor?: [number, number, number],
) {
  if (fillColor) {
    doc.setFillColor(...fillColor);
    doc.roundedRect(x, y, w, h, r, r, "F");
  }
  doc.roundedRect(x, y, w, h, r, r, "S");
}

export function exportFeedbackPDF(
  feedback: Feedback[],
  projectMap: Record<string, { name: string; color: string }>,
  filename = "feedback-export.pdf",
) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const uniqueProjects = getUniqueProjects(feedback, projectMap);
  const isMultiProject = uniqueProjects.length > 1;

  // ── Helpers ────────────────────────────────────────────────────────────────

  const addPageIfNeeded = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
      drawHeader(doc, pageWidth, margin);
    }
  };

  const drawHeader = (doc: jsPDF, pageWidth: number, margin: number) => {
    // Amber accent bar
    doc.setFillColor(...AMBER);
    doc.rect(0, 0, pageWidth, 8, "F");

    // Title
    doc.setTextColor(...TEXT_PRIMARY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("FEEDLYTE", margin, 5.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Feedback Export", margin + 30, 5.5);

    // Meta on right
    const meta = `Generated: ${new Date().toLocaleString()}  |  ${feedback.length} item${feedback.length !== 1 ? "s" : ""}`;
    const metaWidth = doc.getTextWidth(meta);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(meta, pageWidth - margin - metaWidth, 5.5);

    // Separator
    doc.setDrawColor(...BORDER);
    doc.line(margin, 12, pageWidth - margin, 12);

    y = 18;
  };

  const drawFooter = (
    doc: jsPDF,
    pageWidth: number,
    pageHeight: number,
    margin: number,
    pageNum: number,
    totalPages: number,
  ) => {
    const footerY = pageHeight - 10;
    doc.setDrawColor(...BORDER);
    doc.line(margin, footerY - 3, pageWidth - margin, footerY - 3);
    doc.setTextColor(...TEXT_MUTED);
    doc.setFontSize(8);
    doc.text(
      "Feedlyte — Feedback infrastructure for modern products",
      pageWidth / 2,
      footerY + 4,
      { align: "center" },
    );
    doc.text(
      `Page ${pageNum} of ${totalPages}`,
      pageWidth - margin,
      footerY + 4,
      { align: "right" },
    );
  };

  const drawFeedbackCard = (
    doc: jsPDF,
    fb: Feedback,
    projectName: string,
    projectColor: string,
  ): number => {
    // Calculate card height dynamically
    const messageLines = doc.splitTextToSize(fb.message, contentWidth - 10);
    const messageHeight = messageLines.length * 5;
    const cardHeight = 30 + messageHeight; // base + message

    addPageIfNeeded(cardHeight + 5);

    const cardX = margin;
    const cardY = y;
    const cardW = contentWidth;

    // Card background
    doc.setFillColor(...CARD_BG);
    doc.setDrawColor(...BORDER);
    drawRoundedRect(doc, cardX, cardY, cardW, cardHeight, 3, CARD_BG);

    // Project color indicator (top-left)
    doc.setFillColor(...hexToRgb(projectColor));
    doc.circle(cardX + 4, cardY + 4, 1.5, "F");

    // Status badge (top-right)
    const statusColor = STATUS_COLORS[fb.status] || [100, 100, 100];
    const statusLabel = STATUS_LABELS[fb.status] || fb.status;
    const badgeW = doc.getTextWidth(statusLabel) + 10;
    const badgeX = cardX + cardW - badgeW - 6;
    const badgeY = cardY + 4;
    doc.setFillColor(...statusColor);
    doc.roundedRect(badgeX, badgeY, badgeW, 6, 2, 2, "F");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text(statusLabel, badgeX + 5, badgeY + 4, { align: "center" });

    // Message
    doc.setTextColor(...TEXT_PRIMARY);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(messageLines, cardX + 5, cardY + 14, {
      maxWidth: contentWidth - 10,
    });

    // Divider
    const dividerY = cardY + 16 + messageHeight;
    doc.setDrawColor(...BORDER);
    doc.line(cardX + 5, dividerY, cardX + cardW - 5, dividerY);

    // Metadata (two columns)
    const { browser, os } = parseUserAgent(fb.userAgent);
    const metaStartY = dividerY + 4;
    const lineHeight = 5;
    const colGap = 90;

    const meta = [
      ["Email:", fb.email || "—"],
      ["Page URL:", fb.pageUrl || "—"],
      ["Browser:", `${browser} / ${os}`],
      ["Submitted:", new Date(fb.createdAt).toLocaleString()],
      ["ID:", fb.id],
    ];

    doc.setFontSize(8);
    meta.forEach(([label, value], i) => {
      const lineY = metaStartY + i * lineHeight;
      // Label
      doc.setTextColor(...TEXT_MUTED);
      doc.setFont("helvetica", "bold");
      doc.text(label, cardX + 5, lineY);
      // Value
      doc.setTextColor(...TEXT_PRIMARY);
      doc.setFont("helvetica", "normal");
      const valueX = cardX + 5 + colGap;
      const maxValueWidth = cardW - colGap - 10;
      const valueLines = doc.splitTextToSize(value, maxValueWidth);
      doc.text(valueLines, valueX, lineY);
    });

    return cardHeight;
  };

  // ── Generation ─────────────────────────────────────────────────────────────

  // First page header
  drawHeader(doc, pageWidth, margin);

  if (isMultiProject) {
    // Group by project
    for (const projectId of uniqueProjects) {
      const projectFeedback = feedback.filter((f) => f.projectId === projectId);
      const pName = projectMap[projectId]?.name || projectId;
      const pColor = projectMap[projectId]?.color || "#F59E0B";

      // Project section header
      addPageIfNeeded(12);
      doc.setFillColor(...hexToRgb(pColor));
      doc.roundedRect(margin, y, contentWidth, 10, 2, 2, "F");
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(pName, margin + 5, y + 6.5);
      y += 14;

      // Feedback cards for this project
      for (const fb of projectFeedback) {
        const cardH = drawFeedbackCard(doc, fb, pName, pColor);
        y += cardH + 4;
      }
    }
  } else {
    // Flat list
    const pName = uniqueProjects[0]
      ? projectMap[uniqueProjects[0]]?.name || "Unknown"
      : "Unknown";
    const pColor = uniqueProjects[0]
      ? projectMap[uniqueProjects[0]]?.color || "#F59E0B"
      : "#F59E0B";

    for (const fb of feedback) {
      const cardH = drawFeedbackCard(doc, fb, pName, pColor);
      y += cardH + 4;
    }
  }

  // ── Page Numbers Pass ──────────────────────────────────────────────────────

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawFooter(doc, pageWidth, pageHeight, margin, i, totalPages);
  }

  doc.save(filename);
}
