import type { Feedback } from "@/types";

export function exportFeedbackCSV(
  feedback: Feedback[],
  projectMap: Record<string, { name: string; color: string }>,
  filename = "feedback-export.csv"
) {
  const headers = ["ID", "Message", "Email", "Page URL", "Status", "Project", "Submitted"];

  const rows = feedback.map((f) => [
    f.id,
    f.message,
    f.email     ?? "",
    f.pageUrl   ?? "",
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
  const url  = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href     = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}