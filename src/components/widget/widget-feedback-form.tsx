"use client";

import React from "react";
import {
  ChevronDown,
  ChevronUp,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CATEGORY_OPTIONS,
  TECHNICAL_DETAIL_FIELDS,
} from "./widget-types";
import { WidgetThemeToggle } from "./widget-theme-toggle";

interface WidgetFeedbackFormProps {
  open: boolean;
  width: number;
  isSharpCorners: boolean;
  primaryColor: string;
  theme: "dark" | "light";
  onToggleTheme: () => void;
  onClose: () => void;

  categoryEnabled: boolean;
  category: string;
  onCategoryChange: (cat: string) => void;

  message: string;
  onMessageChange: (msg: string) => void;
  messageInputRef: React.RefObject<HTMLTextAreaElement | null>;

  ratingEnabled: boolean;
  rating: number;
  hoveredRating: number;
  onRatingChange: (r: number) => void;
  onHoverRating: (r: number) => void;

  emailEnabled: boolean;
  email: string;
  onEmailChange: (e: string) => void;

  technicalDetailsEnabled: boolean;
  showTechnicalPanel: boolean;
  onToggleTechnicalPanel: () => void;
  technicalSelections: Record<string, boolean>;
  onToggleTechnicalDetail: (key: string, val: boolean) => void;
  onToggleAllTechnicalDetails: (val: boolean) => void;

  consentText?: string;
  consentGiven: boolean;
  onConsentChange: (val: boolean) => void;

  error: string;
  submitting: boolean;
  canSubmit: boolean;
  onSubmit: () => void;

  showBranding: boolean;
  prefersReducedMotion: boolean;
  children?: React.ReactNode;
}

export function WidgetFeedbackForm({
  width,
  isSharpCorners,
  primaryColor,
  theme,
  onToggleTheme,
  onClose,
  categoryEnabled,
  category,
  onCategoryChange,
  message,
  onMessageChange,
  messageInputRef,
  ratingEnabled,
  rating,
  hoveredRating,
  onRatingChange,
  onHoverRating,
  emailEnabled,
  email,
  onEmailChange,
  technicalDetailsEnabled,
  showTechnicalPanel,
  onToggleTechnicalPanel,
  technicalSelections,
  onToggleTechnicalDetail,
  onToggleAllTechnicalDetails,
  consentText,
  consentGiven,
  onConsentChange,
  error,
  submitting,
  canSubmit,
  onSubmit,
  showBranding,
  prefersReducedMotion,
  children,
}: WidgetFeedbackFormProps) {
  const roundedClass = isSharpCorners ? "rounded-[3px]" : "rounded-[7px]";
  const isAllTechnicalSelected = TECHNICAL_DETAIL_FIELDS.every(
    (field) => technicalSelections[field.key],
  );

  return (
    <div
      id="feedlyte-feedback-form"
      role="dialog"
      aria-label="Feedback form"
      className={cn(
        "p-4 mb-2.5 max-w-[calc(100vw-2px)] border border-border bg-card text-card-foreground shadow-2xl font-sans",
        isSharpCorners ? "rounded" : "rounded-xl",
      )}
      style={{ width: `${width}px`, maxWidth: "100%" }}
    >
      {children ? (
        children
      ) : (
        <div className="overflow-y-auto no-scrollbar max-h-150">
          {/* Header */}
          <div className="flex justify-between items-center mb-3">
            <p className="text-lg font-semibold m-0 text-foreground">
              Share your feedback
            </p>
            <div className="flex items-center gap-2">
              <WidgetThemeToggle theme={theme} onToggle={onToggleTheme} />
              <button
                type="button"
                onClick={onClose}
                className="bg-transparent border-none text-lg cursor-pointer leading-none px-1 py-0.5 text-muted-foreground hover:text-foreground transition-colors rounded"
                aria-label="Close"
              >
                ×
              </button>
            </div>
          </div>

          {/* Category selection */}
          {categoryEnabled && (
            <div className="mb-2.5">
              <p className="m-0 mb-1.5 text-sm font-semibold text-foreground">
                What&apos;s this about?{" "}
                <span className="font-normal text-muted-foreground text-xs">
                  (optional)
                </span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORY_OPTIONS.map(({ value, label, Icon }) => {
                  const selected = category === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => onCategoryChange(selected ? "" : value)}
                      aria-pressed={selected}
                      className={cn(
                        "flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.25 cursor-pointer font-sans transition-all border",
                        roundedClass,
                        !selected && "border-border text-muted-foreground bg-transparent hover:bg-secondary/60 hover:text-foreground",
                      )}
                      style={
                        selected
                          ? {
                              background: `${primaryColor}20`,
                              borderColor: primaryColor,
                              color: primaryColor,
                            }
                          : undefined
                      }
                    >
                      <Icon size={12} strokeWidth={2.25} />
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Feedback message */}
          <label
            htmlFor="feedlyte-message"
            className="block mb-1.5 text-sm font-semibold text-foreground"
          >
            Feedback message
          </label>
          <textarea
            ref={messageInputRef}
            id="feedlyte-message"
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            placeholder="What's on your mind?"
            maxLength={2000}
            rows={3}
            aria-label="Feedback message"
            className={cn(
              "w-full text-sm px-2.5 py-2 resize-y outline-none mb-2 font-sans border border-border bg-input text-foreground placeholder:text-muted-foreground transition-colors box-border",
              roundedClass,
            )}
            onFocus={(e) => (e.target.style.borderColor = primaryColor)}
            onBlur={(e) => (e.target.style.borderColor = "")}
          />

          {/* Experience rating */}
          {ratingEnabled && (
            <div className="mb-2.5">
              <p className="m-0 mb-1.5 text-sm font-semibold text-foreground">
                How would you rate your experience?{" "}
                <span className="font-normal text-muted-foreground text-xs">
                  (optional)
                </span>
              </p>
              <div role="radiogroup" aria-label="Rating" className="flex gap-1">
                {[1, 2, 3, 4, 5].map((value) => {
                  const filled = value <= (hoveredRating || rating);
                  return (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={rating === value}
                      aria-label={`${value} star${value > 1 ? "s" : ""}`}
                      onClick={() => onRatingChange(rating === value ? 0 : value)}
                      onMouseEnter={() => onHoverRating(value)}
                      onMouseLeave={() => onHoverRating(0)}
                      className="bg-transparent border-none cursor-pointer p-0.5 transition-transform hover:scale-110"
                    >
                      <Star
                        size={20}
                        strokeWidth={1.75}
                        color={filled ? primaryColor : "var(--muted-foreground)"}
                        fill={filled ? primaryColor : "none"}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Email input */}
          {emailEnabled && (
            <>
              <label
                htmlFor="feedlyte-email"
                className="block mb-1.5 text-sm font-semibold text-foreground"
              >
                Email
              </label>
              <input
                id="feedlyte-email"
                type="email"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                placeholder="Email (optional)"
                aria-label="Email"
                className={cn(
                  "w-full text-sm px-2.5 py-1.75 outline-none mb-2.5 font-sans border border-border bg-input text-foreground placeholder:text-muted-foreground transition-colors box-border",
                  roundedClass,
                )}
                onFocus={(e) => (e.target.style.borderColor = primaryColor)}
                onBlur={(e) => (e.target.style.borderColor = "")}
              />
            </>
          )}

          {/* Technical details toggle & checklist */}
          {technicalDetailsEnabled && (
            <div className="mb-2.5">
              <button
                type="button"
                onClick={onToggleTechnicalPanel}
                aria-expanded={showTechnicalPanel}
                className="flex items-center gap-1.25 bg-transparent border-none text-xs font-semibold p-0 cursor-pointer font-sans transition-colors text-muted-foreground hover:text-foreground"
              >
                {showTechnicalPanel ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                Include technical details (optional)
              </button>
              {showTechnicalPanel && (
                <div
                  className={cn(
                    "mt-2 px-2.5 py-2 border border-border bg-secondary/30 font-sans",
                    roundedClass,
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onToggleAllTechnicalDetails(!isAllTechnicalSelected)}
                    className="bg-transparent border-none text-[11px] font-semibold p-0 mb-1.5 cursor-pointer font-sans hover:underline"
                    style={{ color: primaryColor }}
                  >
                    {isAllTechnicalSelected ? "Deselect all" : "Select all"}
                  </button>
                  {TECHNICAL_DETAIL_FIELDS.map((field) => (
                    <label
                      key={field.key}
                      className="flex items-center gap-1.75 text-xs py-0.75 cursor-pointer select-none text-foreground"
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(technicalSelections[field.key])}
                        onChange={(e) => onToggleTechnicalDetail(field.key, e.target.checked)}
                        className="accent-primary"
                      />
                      {field.label}
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Consent */}
          {consentText && (
            <label className="flex gap-2 items-start text-[11px] mb-2.5 cursor-pointer select-none text-muted-foreground">
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={(e) => onConsentChange(e.target.checked)}
                aria-label="Consent"
                className="accent-primary mt-0.5"
              />
              <span>{consentText}</span>
            </label>
          )}

          {/* Error notice */}
          {error && (
            <p aria-live="polite" className="text-destructive text-sm m-0 mb-2 font-medium">
              {error}
            </p>
          )}

          {/* Submit action */}
          <button
            type="button"
            onClick={onSubmit}
            disabled={!canSubmit}
            aria-label={error ? "Try again" : "Send feedback"}
            className={cn(
              "w-full border-none text-base font-semibold px-4 py-2 font-sans transition-all",
              roundedClass,
              !canSubmit
                ? "bg-muted text-muted-foreground/60 cursor-not-allowed"
                : prefersReducedMotion
                  ? "transition-none cursor-pointer"
                  : "transition-[background,transform] duration-150 cursor-pointer hover:opacity-95 active:scale-[0.99]",
            )}
            style={canSubmit ? { background: primaryColor, color: "#ffffff" } : undefined}
          >
            {submitting ? "Sending..." : error ? "Try again" : "Send feedback"}
          </button>

          {/* Feedlyte Branding */}
          {showBranding && (
            <p className="text-center text-[10px] text-muted-foreground m-0 mt-2 font-sans">
              Powered by{" "}
              <a
                href="https://feedlyte.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-muted-foreground hover:text-foreground hover:underline"
              >
                Feedlyte
              </a>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
