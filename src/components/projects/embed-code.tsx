"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import type { Project } from "@/types";
import { Card } from "@/components/ui/card";

interface EmbedCodeProps {
  project: Project;
}

const WIDGET_SCRIPT_VERSION = "1";

function escapeAttribute(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function EmbedCode({ project }: EmbedCodeProps) {
  const [copied, setCopied] = useState(false);

  const prodUrl = process.env.PROD_URL || "https://feedlyte.vercel.app";

  const embedCode = `<script src="${prodUrl}/widget.js?v=${WIDGET_SCRIPT_VERSION}" data-project="${escapeAttribute(project.id)}" data-position="${project.position}" data-color="${escapeAttribute(project.color)}" data-label="${escapeAttribute(project.label)}" data-offset="24" data-width="360" data-theme="dark" data-fields="message,email" data-launcher="pill"></script>`;

  const copy = () => {
    navigator.clipboard.writeText(embedCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <h3 className="text-sm font-bold text-foreground">Embed Script</h3>
      <p className="text-sm text-muted-foreground">
        Paste this script before the closing{" "}
        <code className="font-mono text-sm">&lt;/body&gt;</code> tag on your website.
      </p>
      <div className="bg-background border border-[#2a2a2a] rounded-lg px-4 py-3.5 flex flex-col sm:flex-row item-start sm:items-center justify-between gap-3">
        <code className="font-mono text-xs lg:text-sm text-success break-all flex-1">
          {embedCode}
        </code>
        <button
          onClick={copy}
          style={{
            background: copied ? "#10B98120" : "#949494",
            borderColor: copied ? "#10B981" : "#949494",
            color: copied ? "#10B981" : "#ffffff",
          }}
          className="w-fit border rounded-md px-2.5 py-1.5 flex items-center gap-1.5 text-sm font-medium cursor-pointer shrink-0 transition-all"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="text-sm text-foreground mt-4">
        Widget loads asynchronously. No impact on page performance.
      </p>
    </Card>
  );
}
