"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import type { Project } from "@/types";
import { Card } from "@/components/ui/card";

interface EmbedCodeProps {
  project: Project;
}

export function EmbedCode({ project }: EmbedCodeProps) {
  const [copied, setCopied] = useState(false);

  const embedCode = `<script src="https://feedlyte.vercel.app/widget.js" data-project="${project.id}"></script>`;

  const copy = () => {
    navigator.clipboard.writeText(embedCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <h3 className="text-[14px] font-bold text-foreground mb-2">Embed Script</h3>
      <p className="text-[13px] text-muted-foreground mb-4">
        Paste this script before the closing{" "}
        <code className="font-mono text-[12px]">&lt;/body&gt;</code> tag on your website.
      </p>
      <div className="bg-background border border-[#2a2a2a] rounded-lg px-4 py-[14px] flex items-center justify-between gap-3">
        <code className="font-mono text-[12px] text-success break-all flex-1">
          {embedCode}
        </code>
        <button
          onClick={copy}
          style={{
            background: copied ? "#10B98120" : "#1F1F1F",
            borderColor: copied ? "#10B981" : "#2A2A2A",
            color: copied ? "#10B981" : "#737373",
          }}
          className="border rounded-md px-2.5 py-1.5 flex items-center gap-1.5 text-[12px] font-medium cursor-pointer shrink-0 transition-all"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="text-[12px] text-[#3d3d3d] mt-4">
        Widget loads asynchronously. No impact on page performance.
      </p>
    </Card>
  );
}
