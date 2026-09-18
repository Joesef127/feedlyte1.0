"use client";

import {
  Calendar,
  Mail,
  Globe,
  ExternalLink,
  Monitor,
  Tag,
  Sliders,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatDate, REDUNDANT_TECH_KEYS } from "./feedback-detail-utils";

interface FeedbackSubmissionDetailsProps {
  createdAt: string;
  email?: string | null;
  pageUrl?: string | null;
  browser: string;
  os: string;
  technicalDetails?: Record<string, string> | null;
}

export function FeedbackSubmissionDetails({
  createdAt,
  email,
  pageUrl,
  browser,
  os,
  technicalDetails,
}: FeedbackSubmissionDetailsProps) {
  const nonRedundantTech = technicalDetails
    ? Object.entries(technicalDetails).filter(
        ([key]) => !REDUNDANT_TECH_KEYS.has(key.toLowerCase().trim()),
      )
    : [];

  return (
    <>
      {/* Submission Details */}
      <Card>
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
          Submission Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-start gap-3 p-3 bg-background rounded-lg border border-border">
            <Calendar
              size={15}
              className="text-muted-foreground/60 mt-0.5 shrink-0"
            />
            <div>
              <p className="text-[11px] text-muted-foreground/50 uppercase tracking-widest font-semibold mb-0.5">
                Submitted
              </p>
              <p className="text-sm text-foreground font-medium">
                {formatDate(createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-background rounded-lg border border-border">
            <Mail
              size={15}
              className="text-muted-foreground/60 mt-0.5 shrink-0"
            />
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground/50 uppercase tracking-widest font-semibold mb-0.5">
                Email
              </p>
              {email ? (
                <a
                  href={`mailto:${email}`}
                  className="text-sm text-primary hover:text-primary/80 transition-colors break-all"
                >
                  {email}
                </a>
              ) : (
                <p className="text-sm text-muted-foreground/50">
                  Not provided
                </p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-background rounded-lg border border-border sm:col-span-2">
            <Globe
              size={15}
              className="text-muted-foreground/60 mt-0.5 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-muted-foreground/50 uppercase tracking-widest font-semibold mb-0.5">
                Page URL
              </p>
              {pageUrl ? (
                <div className="flex items-center gap-2">
                  <p className="text-sm text-foreground font-mono break-all flex-1">
                    {pageUrl}
                  </p>
                  <a
                    href={pageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  >
                    <ExternalLink size={13} />
                  </a>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground/50">
                  Not captured
                </p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-background rounded-lg border border-border">
            <Monitor
              size={15}
              className="text-muted-foreground/60 mt-0.5 shrink-0"
            />
            <div>
              <p className="text-[11px] text-muted-foreground/50 uppercase tracking-widest font-semibold mb-0.5">
                Browser
              </p>
              <p className="text-sm text-foreground font-medium">{browser}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-background rounded-lg border border-border">
            <Tag
              size={15}
              className="text-muted-foreground/60 mt-0.5 shrink-0"
            />
            <div>
              <p className="text-[11px] text-muted-foreground/50 uppercase tracking-widest font-semibold mb-0.5">
                Operating System
              </p>
              <p className="text-sm text-foreground font-medium">{os}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Technical details (filtered of redundant fields) */}
      {nonRedundantTech.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sliders size={16} className="text-primary" />
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Technical Details
              </h3>
            </div>
            <span className="text-xs text-muted-foreground/60 font-medium">
              Captured with visitor consent
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {nonRedundantTech.map(([label, value]) => (
              <div
                key={label}
                className="flex flex-col gap-1 p-3 bg-background rounded-lg border border-border"
              >
                <p className="text-[11px] text-muted-foreground/50 uppercase tracking-widest font-semibold">
                  {label}
                </p>
                <p className="text-xs sm:text-sm text-foreground font-mono break-all leading-relaxed select-all">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </>
  );
}
