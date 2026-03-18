"use client";

import { useState } from "react";
import { MessageSquare, X, Check } from "lucide-react";
import type { Project } from "@/types";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface WidgetPreviewProps {
  project: Project;
}

export function WidgetPreview({ project }: WidgetPreviewProps) {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const color = project.color || "#F59E0B";

  const submit = () => {
    if (!msg.trim()) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 800);
  };

  const reset = () => {
    setOpen(false);
    setSubmitted(false);
    setMsg("");
    setEmail("");
  };

  return (
    <div
      className="bg-background border border-sidebar-border rounded-[10px] relative overflow-hidden flex items-center justify-center"
      style={{ height: 240 }}
    >
      <span className="text-[#2a2a2a] text-[12px]">Your website here</span>

      {/* Floating widget */}
      <div className="absolute bottom-4 right-4">
        {!open ? (
          <button
            onClick={() => setOpen(true)}
            style={{
              background: color,
              boxShadow: `0 4px 20px ${color}50`,
            }}
            className="border-none rounded-[20px] px-4 py-[9px] text-white text-[12px] font-semibold cursor-pointer flex items-center gap-1.5"
          >
            <MessageSquare size={13} strokeWidth={2} />
            {project.label || "Feedback"}
          </button>
        ) : (
          <div className="bg-card border border-[#2a2a2a] rounded-xl p-3.5 w-[240px] shadow-2xl">
            {submitted ? (
              <div className="text-center py-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center mx-auto mb-2"
                  style={{ background: color + "20" }}
                >
                  <Check size={18} style={{ color }} strokeWidth={2.5} />
                </div>
                <p className="text-sm text-foreground font-semibold m-0">
                  Thanks for your feedback!
                </p>
                <p className="text-[11px] text-muted-foreground mt-1 mb-3">
                  We read every submission.
                </p>
                <button
                  onClick={reset}
                  className="bg-transparent border-none text-muted-foreground text-[12px] cursor-pointer"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-sm font-bold text-foreground">
                    Share Feedback
                  </span>
                  <button
                    onClick={() => setOpen(false)}
                    className="bg-transparent border-none text-muted-foreground cursor-pointer p-0"
                  >
                    <X size={14} />
                  </button>
                </div>
                <Textarea
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  placeholder="Tell us what you think..."
                  className="h-[72px] mb-2 text-[12px]"
                />
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email (optional)"
                  className="h-8 text-[12px] mb-2"
                />
                <button
                  onClick={submit}
                  disabled={!msg.trim() || submitting}
                  style={{ background: color, opacity: !msg.trim() || submitting ? 0.6 : 1 }}
                  className="w-full border-none rounded-[7px] py-2 text-white text-[12px] font-semibold cursor-pointer disabled:cursor-not-allowed"
                >
                  {submitting ? "Sending..." : "Send Feedback"}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
