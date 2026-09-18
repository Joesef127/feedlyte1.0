"use client";

import { Check } from "lucide-react";

interface WidgetSuccessViewProps {
  trackingUrl?: string;
  primaryColor: string;
  onClose: () => void;
}

export function WidgetSuccessView({
  trackingUrl,
  primaryColor,
  onClose,
}: WidgetSuccessViewProps) {
  return (
    <div className="text-center py-2">
      <div className="mb-2 p-3 bg-success text-white rounded-full inline-flex items-center justify-center w-14 h-14 font-semibold shadow-md">
        <Check size={28} strokeWidth={3} />
      </div>
      <p
        aria-live="polite"
        className="text-sm font-semibold m-0 mb-1 text-foreground"
      >
        Thanks for your feedback!
      </p>
      <p className="text-sm m-0 text-muted-foreground">
        We appreciate you taking the time.
      </p>
      {trackingUrl && (
        <>
          <p className="text-xs mt-2.5 mb-0 text-muted-foreground">
            Want to check back later?{" "}
            <a
              href={trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline-offset-2 hover:underline"
              style={{ color: primaryColor }}
            >
              Track this feedback
            </a>
          </p>
          <p className="text-xs mt-2.5 mb-0 text-muted-foreground">
            <span className="font-semibold text-foreground">Note:</span> This tracking
            link will only show up once and only applies to this specific feedback
            entry.
          </p>
        </>
      )}
      <button
        type="button"
        onClick={onClose}
        className="mt-3.5 bg-transparent border border-border text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md text-xs px-3.5 py-1.5 cursor-pointer transition-colors"
      >
        Close
      </button>
    </div>
  );
}
