"use client";

import { useState, useEffect, useRef, use } from "react";
import { cn } from "@/lib/utils";
import {
  WidgetSearchParams,
  EMPTY_PARAMS_PROMISE,
  LAUNCHER_ICONS,
  TECHNICAL_DETAIL_FIELDS,
  sanitizePageUrl,
  sanitizeWidgetColor,
  sanitizeWidgetLabel,
  sanitizeWidgetNumber,
  sanitizeWidgetTheme,
  sanitizeWidgetFields,
  computeTechnicalDetail,
} from "@/components/widget/widget-types";
import { WidgetLauncher } from "@/components/widget/widget-launcher";
import { WidgetFeedbackForm } from "@/components/widget/widget-feedback-form";
import { WidgetSuccessView } from "@/components/widget/widget-success-view";

export default function WidgetPage({
  searchParams = EMPTY_PARAMS_PROMISE,
}: {
  searchParams?: Promise<WidgetSearchParams>;
}) {
  const resolvedParams = use(searchParams);

  const [projectId, setProjectId] = useState(resolvedParams?.project ?? "");
  const [position, setPosition] = useState(resolvedParams?.position ?? "");
  const [widgetColor, setWidgetColor] = useState(sanitizeWidgetColor(resolvedParams?.color));
  const [widgetLabel, setWidgetLabel] = useState(sanitizeWidgetLabel(resolvedParams?.label));
  const [width, setWidth] = useState(sanitizeWidgetNumber(resolvedParams?.width, 360, 320, 480));
  const [offset, setOffset] = useState(sanitizeWidgetNumber(resolvedParams?.offset, 24, 8, 80));
  const [theme, setTheme] = useState(sanitizeWidgetTheme(resolvedParams?.theme));
  const [fields, setFields] = useState(sanitizeWidgetFields(resolvedParams?.fields));
  const [consentText, setConsentText] = useState((resolvedParams?.consent ?? "").slice(0, 160));
  const [consentGiven, setConsentGiven] = useState(false);
  const [launcherStyle] = useState<"tab" | "pill">(
    resolvedParams?.launcher === "tab" ? "tab" : "pill"
  );
  const telemetryEnabled = resolvedParams?.telemetry === "true";
  const [isRtl, setIsRtl] = useState(Boolean(resolvedParams?.rtl === "true" || resolvedParams?.rtl === "1"));
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [categoryEnabled, setCategoryEnabled] = useState(false);
  const [ratingEnabled, setRatingEnabled] = useState(false);
  const [technicalDetailsEnabled, setTechnicalDetailsEnabled] = useState(false);
  const [launcherIcon, setLauncherIcon] = useState("message-square");
  const [cornerStyle, setCornerStyle] = useState("rounded");
  const [showLabel, setShowLabel] = useState(true);
  const [showBranding, setShowBranding] = useState(true);
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);

  const [category, setCategory] = useState<string>("");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [showTechnicalPanel, setShowTechnicalPanel] = useState(false);
  const [technicalSelections, setTechnicalSelections] = useState<Record<string, boolean>>({});
  const [trackingToken, setTrackingToken] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  const [pageUrl, setPageUrl] = useState(resolvedParams?.url ?? "");

  // Synchronize data-theme on the document root
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, [theme]);

  // Fallback search params parsing for bare iframe environments
  useEffect(() => {
    if (resolvedParams.project) return;
    const params = new URLSearchParams(window.location.search);
    setProjectId(params.get("project") ?? "");
    setPosition(params.get("position") ?? "bottom-right");
    setWidgetColor(sanitizeWidgetColor(params.get("color") ?? undefined));
    setWidgetLabel(sanitizeWidgetLabel(params.get("label") ?? undefined));
    setWidth(sanitizeWidgetNumber(params.get("width") ?? undefined, 360, 320, 480));
    setOffset(sanitizeWidgetNumber(params.get("offset") ?? undefined, 24, 8, 80));
    setTheme(sanitizeWidgetTheme(params.get("theme") ?? undefined));
    setFields(sanitizeWidgetFields(params.get("fields") ?? undefined));
    setConsentText((params.get("consent") ?? "").slice(0, 160));
    setIsRtl(params.get("rtl") === "true" || params.get("rtl") === "1");
    setPageUrl(params.get("url") ?? document.referrer ?? "");
  }, [resolvedParams]);

  const reportMetric = (name: "open" | "submission_success" | "submission_failure", durationMs?: number) => {
    if (!telemetryEnabled || typeof window === "undefined") return;
    try {
      const targetOrigin = new URL(pageUrl || document.referrer).origin;
      if (targetOrigin === "null") return;
      window.parent.postMessage({ type: "feedlyte:metric", name, durationMs }, targetOrigin);
    } catch {
      // Ignored if origin cannot be derived
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (typeof window.matchMedia !== "function") {
      setPrefersReducedMotion(false);
      return;
    }

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateReducedMotion = () => setPrefersReducedMotion(media.matches);
    updateReducedMotion();

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", updateReducedMotion);
      return () => media.removeEventListener("change", updateReducedMotion);
    }

    media.addListener(updateReducedMotion);
    return () => media.removeListener(updateReducedMotion);
  }, []);

  // Fetch project config
  useEffect(() => {
    const id = projectId || resolvedParams?.project;
    if (!id) {
      setIsConfigLoaded(true);
      return;
    }

    // Check localStorage cache for instant render on refresh / subsequent visits
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(`feedlyte_cfg_${id}`);
        if (cached) {
          const data = JSON.parse(cached);
          if (data) {
            if (data.color) setWidgetColor(sanitizeWidgetColor(data.color));
            if (data.label) setWidgetLabel(sanitizeWidgetLabel(data.label));
            if (data.position) setPosition(data.position);
            if (data.offset) setOffset(sanitizeWidgetNumber(String(data.offset), 24, 8, 80));
            setCategoryEnabled(Boolean(data.categoryEnabled));
            setRatingEnabled(Boolean(data.ratingEnabled));
            setTechnicalDetailsEnabled(Boolean(data.technicalDetailsEnabled));
            if (data.launcherIcon && LAUNCHER_ICONS[data.launcherIcon]) setLauncherIcon(data.launcherIcon);
            if (data.cornerStyle === "sharp" || data.cornerStyle === "rounded") setCornerStyle(data.cornerStyle);
            if (typeof data.showLabel === "boolean") setShowLabel(data.showLabel);
            setShowBranding(data.showBranding !== false);
            setIsConfigLoaded(true);
          }
        }
      } catch {
        // Ignore cache parse error
      }
    }

    let isMounted = true;
    const base = typeof window !== "undefined" ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || "");
    fetch(`${base}/api/widget-config?project=${encodeURIComponent(id)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!isMounted) return;
        if (data) {
          if (data.color) setWidgetColor(sanitizeWidgetColor(data.color));
          if (data.label) setWidgetLabel(sanitizeWidgetLabel(data.label));
          if (data.position) setPosition(data.position);
          if (data.offset) setOffset(sanitizeWidgetNumber(String(data.offset), 24, 8, 80));
          setCategoryEnabled(Boolean(data.categoryEnabled));
          setRatingEnabled(Boolean(data.ratingEnabled));
          setTechnicalDetailsEnabled(Boolean(data.technicalDetailsEnabled));
          if (data.launcherIcon && LAUNCHER_ICONS[data.launcherIcon]) setLauncherIcon(data.launcherIcon);
          if (data.cornerStyle === "sharp" || data.cornerStyle === "rounded") setCornerStyle(data.cornerStyle);
          if (typeof data.showLabel === "boolean") setShowLabel(data.showLabel);
          setShowBranding(data.showBranding !== false);

          try {
            localStorage.setItem(`feedlyte_cfg_${id}`, JSON.stringify(data));
          } catch {
            // Ignore storage quota
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) {
          setIsConfigLoaded(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [projectId, resolvedParams?.project]);

  // Notify parent of size changes
  useEffect(() => {
    if (!isConfigLoaded || typeof window === "undefined") return;
    const targetOrigin = (() => {
      try {
        const origin = new URL(pageUrl || document.referrer).origin;
        return origin && origin !== "null" ? origin : "*";
      } catch {
        return "*";
      }
    })();
    const notifySize = () => {
      const height = Math.max(containerRef.current?.scrollHeight ?? 44, 44);
      window.parent.postMessage({ type: "feedlyte:resize", height }, targetOrigin);
    };
    notifySize();
    if (typeof ResizeObserver === "undefined" || !containerRef.current) return;
    const observer = new ResizeObserver(notifySize);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [open, submitted, pageUrl, isConfigLoaded]);

  // Escape key handler
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        requestAnimationFrame(() => launcherRef.current?.focus());
      }
    };

    window.addEventListener("keydown", onKeyDown);
    requestAnimationFrame(() => messageInputRef.current?.focus());
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const toggleAllTechnicalDetails = (selectAll: boolean) => {
    const updated: Record<string, boolean> = {};
    TECHNICAL_DETAIL_FIELDS.forEach((field) => {
      updated[field.key] = selectAll;
    });
    setTechnicalSelections(updated);
  };

  const handleSubmit = async () => {
    if (!message.trim() || submitting) return;

    const activeProjectId = projectId || resolvedParams?.project;
    if (!activeProjectId) {
      setError("Project ID is missing. Check your embed snippet.");
      return;
    }

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setError("You appear to be offline. Please check your connection and try again.");
      return;
    }

    const payload: {
      projectId: string;
      message: string;
      email?: string;
      category?: string;
      rating?: number;
      metadata?: Record<string, string>;
      pageUrl?: string;
      referrer?: string;
    } = {
      projectId: activeProjectId,
      message: message.trim(),
    };

    if (fields.email && email.trim()) {
      payload.email = email.trim();
    }

    if (categoryEnabled && category) {
      payload.category = category;
    }

    if (ratingEnabled && rating > 0) {
      payload.rating = rating;
    }

    const sanitizedUrl = sanitizePageUrl(pageUrl);
    if (sanitizedUrl) {
      payload.pageUrl = sanitizedUrl;
    }

    const sanitizedReferrer = typeof document !== "undefined" ? sanitizePageUrl(document.referrer) : "";
    if (sanitizedReferrer) {
      payload.referrer = sanitizedReferrer;
    }

    if (technicalDetailsEnabled) {
      const metadata: Record<string, string> = {};
      TECHNICAL_DETAIL_FIELDS.forEach((field) => {
        if (technicalSelections[field.key]) {
          metadata[field.key] = computeTechnicalDetail(field.key, sanitizedUrl);
        }
      });
      if (Object.keys(metadata).length > 0) {
        payload.metadata = metadata;
      }
    }

    const submitStartedAt = performance.now();
    setSubmitting(true);
    setError("");

    try {
      const base = typeof window !== "undefined" ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || "");
      const res = await fetch(`${base}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        reportMetric("submission_failure", performance.now() - submitStartedAt);
        if (res.status === 429) {
          const data = await res.json().catch(() => ({}));
          setError(data.error || "Too many requests. Please try again in a minute.");
          return;
        }
        if (res.status >= 500) {
          setError("Server error. Your feedback could not be saved. Please try again later.");
          return;
        }
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to submit feedback.");
        return;
      }

      const resData = await res.json().catch(() => ({}));
      reportMetric("submission_success", performance.now() - submitStartedAt);
      setSubmitted(true);
      setMessage("");
      setEmail("");
      setCategory("");
      setRating(0);
      setTechnicalSelections({});
      setConsentGiven(false);
      setTrackingToken(resData.trackingToken || "");
    } catch {
      reportMetric("submission_failure", performance.now() - submitStartedAt);
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        setError("You appear to be offline. Please check your connection and try again.");
      } else {
        setError("Network error. Please check your connection and try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const normalizedPosition = position === "bottom-left" ? "bottom-left" : "bottom-right";
  const primaryColor = widgetColor;
  const isRight = normalizedPosition !== "bottom-left";
  const canSubmit =
    message.trim().length > 0 &&
    !submitting &&
    (!fields.email || !email.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) &&
    (!consentText || consentGiven);
  const isSharpCorners = cornerStyle === "sharp";
  const trackingUrl =
    trackingToken && typeof window !== "undefined"
      ? `${window.location.origin}/track/${trackingToken}`
      : "";

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    if (next) {
      const openedAt = performance.now();
      requestAnimationFrame(() => reportMetric("open", performance.now() - openedAt));
      requestAnimationFrame(() => messageInputRef.current?.focus());
    } else {
      requestAnimationFrame(() => launcherRef.current?.focus());
    }
  };

  const handleClose = () => {
    setOpen(false);
    requestAnimationFrame(() => launcherRef.current?.focus());
  };

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <div
      ref={containerRef}
      dir={isRtl ? "rtl" : "ltr"}
      lang={resolvedParams?.lang ?? "en"}
      data-theme={theme}
      className={cn(
        "w-full flex flex-col justify-end p-0 bg-transparent font-sans transition-opacity duration-150",
        !isConfigLoaded && "opacity-0 pointer-events-none",
        isRight ? "items-end" : "items-start",
      )}
    >
      {/* Feedback modal panel */}
      {open && (
        <WidgetFeedbackForm
          open={open}
          width={width}
          isSharpCorners={isSharpCorners}
          primaryColor={primaryColor}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onClose={handleClose}
          categoryEnabled={categoryEnabled}
          category={category}
          onCategoryChange={setCategory}
          message={message}
          onMessageChange={setMessage}
          messageInputRef={messageInputRef}
          ratingEnabled={ratingEnabled}
          rating={rating}
          hoveredRating={hoveredRating}
          onRatingChange={setRating}
          onHoverRating={setHoveredRating}
          emailEnabled={fields.email}
          email={email}
          onEmailChange={setEmail}
          technicalDetailsEnabled={technicalDetailsEnabled}
          showTechnicalPanel={showTechnicalPanel}
          onToggleTechnicalPanel={() => setShowTechnicalPanel((prev) => !prev)}
          technicalSelections={technicalSelections}
          onToggleTechnicalDetail={(key, val) =>
            setTechnicalSelections((prev) => ({ ...prev, [key]: val }))
          }
          onToggleAllTechnicalDetails={toggleAllTechnicalDetails}
          consentText={consentText}
          consentGiven={consentGiven}
          onConsentChange={setConsentGiven}
          error={error}
          submitting={submitting}
          canSubmit={canSubmit}
          onSubmit={handleSubmit}
          showBranding={showBranding}
          prefersReducedMotion={prefersReducedMotion}
        >
          {submitted ? (
            <WidgetSuccessView
              trackingUrl={trackingUrl}
              primaryColor={primaryColor}
              onClose={() => {
                setSubmitted(false);
                setOpen(false);
                setTrackingToken("");
              }}
            />
          ) : undefined}
        </WidgetFeedbackForm>
      )}

      {/* Launcher trigger button */}
      {isConfigLoaded && (
        <WidgetLauncher
          open={open}
          onToggle={handleToggle}
          launcherRef={launcherRef}
          primaryColor={primaryColor}
          widgetLabel={widgetLabel}
          showLabel={showLabel}
          launcherIcon={launcherIcon}
          launcherStyle={launcherStyle}
          isSharpCorners={isSharpCorners}
          prefersReducedMotion={prefersReducedMotion}
        />
      )}
    </div>
  );
}
