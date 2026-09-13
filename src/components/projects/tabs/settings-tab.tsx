"use client";

import { useState } from "react";
import type { Project, WidgetCornerStyle, WidgetLauncherIcon, WidgetPosition } from "@/types";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";

const COMMON_TIMEZONES = Intl.supportedValuesOf("timeZone");

interface SettingsTabProps {
  project: Project;
  onUpdate: (project: Project) => void;
  isSaving: boolean;
  isError: boolean;
  errorMsg: string;
  onSave: (data: {
    color: string;
    position: WidgetPosition;
    label: string;
    allowedOrigin: string;
    notifyOnSubmission: boolean;
    digestFrequency: "none" | "daily";
    timezone: string;
    notificationCooldown: "none" | "5min" | "15min" | "30min" | "1hour";
    categoryEnabled: boolean;
    ratingEnabled: boolean;
    technicalDetailsEnabled: boolean;
    launcherIcon: WidgetLauncherIcon;
    cornerStyle: WidgetCornerStyle;
    showBranding: boolean;
  }) => void;
}

export function SettingsTab({
  project,
  isSaving,
  isError,
  errorMsg,
  onSave,
}: SettingsTabProps) {
  const [color, setColor] = useState(project.color);
  const [position, setPosition] = useState<WidgetPosition>(project.position);
  const [label, setLabel] = useState(project.label);
  const [allowedOrigin, setAllowedOrigin] = useState(
    project.allowedOrigin ?? "",
  );
  const [notifyOnSubmission, setNotifyOnSubmission] = useState(
    project.notifyOnSubmission ?? false,
  );
  const [digestFrequency, setDigestFrequency] = useState<"none" | "daily">(
    project.digestFrequency ?? "none",
  );
  const [timezone, setTimezone] = useState(project.timezone ?? "UTC");
  const [notificationCooldown, setNotificationCooldown] = useState<
    "none" | "5min" | "15min" | "30min" | "1hour"
  >(project.notificationCooldown ?? "15min");
  const [categoryEnabled, setCategoryEnabled] = useState(project.categoryEnabled ?? false);
  const [ratingEnabled, setRatingEnabled] = useState(project.ratingEnabled ?? false);
  const [technicalDetailsEnabled, setTechnicalDetailsEnabled] = useState(
    project.technicalDetailsEnabled ?? false,
  );
  const [launcherIcon, setLauncherIcon] = useState<WidgetLauncherIcon>(project.launcherIcon ?? "message-square");
  const [cornerStyle, setCornerStyle] = useState<WidgetCornerStyle>(project.cornerStyle ?? "rounded");
  const [showBranding, setShowBranding] = useState(project.showBranding ?? true);

  const handleSave = () => {
    // In handleSave:
    onSave({
      color,
      position,
      label,
      allowedOrigin,
      notifyOnSubmission,
      digestFrequency,
      timezone,
      notificationCooldown,
      categoryEnabled,
      ratingEnabled,
      technicalDetailsEnabled,
      launcherIcon,
      cornerStyle,
      showBranding,
    });
  };

  return (
    <div className="xl:max-w-4/5 2xl:max-w-3/5">
      <Card>
        <h3 className="text-sm font-bold text-foreground">
          Widget Configuration
        </h3>
        <div className="flex flex-col gap-4">
          {/* Accent color */}
          <div>
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-[0.04em] mb-2">
              Accent Color
            </p>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-12 h-8 rounded cursor-pointer border-0 bg-transparent p-0"
                title="Pick a color"
              />
              <span className="text-sm text-muted-foreground font-mono">
                {color}
              </span>
            </div>
          </div>

          {/* Position */}
          <div>
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-[0.04em] mb-2">
              Position
            </p>
            <div className="flex gap-2">
              {(["bottom-right", "bottom-left"] as const).map((pos) => (
                <button
                  key={pos}
                  onClick={() => setPosition(pos)}
                  style={{
                    borderColor: position === pos ? color : "var(--border)",
                    color: position === pos ? color : "var(--muted-foreground)",
                    background: position === pos ? color + "15" : "transparent",
                  }}
                  className="px-3 py-2 rounded-[7px] border text-sm font-medium cursor-pointer transition-all"
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>

          {/* Button label */}
          <FormField
            label="Button Label"
            value={label}
            onChange={setLabel}
            placeholder="Feedback"
          />

          {/* Allowed origin */}
          <div>
            <FormField
              label="Allowed Origin"
              value={allowedOrigin}
              onChange={setAllowedOrigin}
              placeholder="https://yoursite.com"
            />
            <p className="text-sm text-muted-foreground/60 mt-1.5">
              The domain your widget is embedded on. Only submissions from this
              origin will be accepted. Leave blank to use the default allowlist.
            </p>
          </div>

          {/* Optional widget features — all default to off, keeping the widget minimal unless enabled */}
          <div className="border-t border-border pt-4">
            <h4 className="text-sm font-bold text-foreground mb-4">
              Widget Features
            </h4>
            <p className="text-sm text-muted-foreground/60 mb-3">
              These are all optional — visitors can always skip them and just submit a message.
            </p>

            <div className="flex items-center gap-3 mb-3">
              <input
                type="checkbox"
                id="categoryEnabled"
                checked={categoryEnabled}
                onChange={(e) => setCategoryEnabled(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <label htmlFor="categoryEnabled" className="text-sm font-medium text-foreground">
                Let visitors optionally tag feedback (Bug / Idea / Praise / Question)
              </label>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <input
                type="checkbox"
                id="ratingEnabled"
                checked={ratingEnabled}
                onChange={(e) => setRatingEnabled(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <label htmlFor="ratingEnabled" className="text-sm font-medium text-foreground">
                Show an optional 1-5 star rating
              </label>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                id="technicalDetailsEnabled"
                checked={technicalDetailsEnabled}
                onChange={(e) => setTechnicalDetailsEnabled(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <label htmlFor="technicalDetailsEnabled" className="text-sm font-medium text-foreground">
                Offer an opt-in &quot;Include technical details&quot; section
              </label>
            </div>

            <div className="mb-4">
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-[0.04em] mb-2">
                Launcher Icon
              </p>
              <select
                value={launcherIcon}
                onChange={(e) => setLauncherIcon(e.target.value as WidgetLauncherIcon)}
                className="w-full max-w-xs bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              >
                <option value="message-square">Message</option>
                <option value="bug">Bug</option>
                <option value="lightbulb">Idea</option>
                <option value="heart">Heart</option>
                <option value="help-circle">Question</option>
              </select>
            </div>

            <div className="mb-4">
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-[0.04em] mb-2">
                Corner Style
              </p>
              <div className="flex gap-2">
                {(["rounded", "sharp"] as const).map((style) => (
                  <button
                    key={style}
                    onClick={() => setCornerStyle(style)}
                    style={{
                      borderColor: cornerStyle === style ? color : "var(--border)",
                      color: cornerStyle === style ? color : "var(--muted-foreground)",
                      background: cornerStyle === style ? color + "15" : "transparent",
                    }}
                    className="px-3 py-2 rounded-[7px] border text-sm font-medium cursor-pointer capitalize transition-all"
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="showBranding"
                checked={showBranding}
                onChange={(e) => setShowBranding(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <label htmlFor="showBranding" className="text-sm font-medium text-foreground">
                Show &ldquo;Powered by Feedlyte&rdquo; in the widget
              </label>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="border-t border-border pt-4">
            <h4 className="text-sm font-bold text-foreground mb-4">
              Email Notifications
            </h4>

            {/* Immediate notifications toggle */}
            <div className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                id="notifyOnSubmission"
                checked={notifyOnSubmission}
                onChange={(e) => setNotifyOnSubmission(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <label
                htmlFor="notifyOnSubmission"
                className="text-sm font-medium text-foreground"
              >
                Email me immediately when new feedback is submitted
              </label>
            </div>

            {/* Cooldown dropdown */}
            {notifyOnSubmission && (
              <div className="mb-4 ml-7">
                <label
                  htmlFor="notificationCooldown"
                  className="text-sm text-muted-foreground font-medium uppercase tracking-[0.04em] mb-2 block"
                >
                  Rate Limit (max one email per)
                </label>
                <select
                  id="notificationCooldown"
                  value={notificationCooldown}
                  onChange={(e) =>
                    setNotificationCooldown(
                      e.target.value as "none" | "5min" | "15min" | "30min" | "1hour",
                    )
                  }
                  className="w-full max-w-xs bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                >
                  <option value="none">No limit (every submission)</option>
                  <option value="5min">5 minutes</option>
                  <option value="15min">15 minutes</option>
                  <option value="30min">30 minutes</option>
                  <option value="1hour">1 hour</option>
                </select>
                <p className="text-sm text-muted-foreground/60 mt-1.5">
                  Prevents email floods during feedback bursts.
                </p>
              </div>
            )}

            {/* Daily digest */}
            <div className="border-t border-border pt-4">
              <label
                htmlFor="digestFrequency"
                className="text-sm font-medium text-foreground flex items-center gap-2"
              >
                <input
                  type="checkbox"
                  id="digestFrequency"
                  checked={digestFrequency === "daily"}
                  onChange={(e) =>
                    setDigestFrequency(e.target.checked ? "daily" : "none")
                  }
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                Daily digest email at 8:00 AM
              </label>

              {digestFrequency === "daily" && (
                <div className="ml-7 mt-3 space-y-3">
                  <div>
                    <label
                      htmlFor="timezone"
                      className="text-sm text-muted-foreground font-medium uppercase tracking-[0.04em] mb-2 block"
                    >
                      Timezone
                    </label>
                    <select
                      id="timezone"
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full max-w-xs bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                    >
                      {COMMON_TIMEZONES.map((tz) => (
                        <option key={tz} value={tz}>
                          {tz}
                        </option>
                      ))}
                    </select>
                    <p className="text-sm text-muted-foreground/60">
                      Digest will be sent at 8:00 AM in this timezone.
                    </p>
                  </div>
                </div>
              )}

              <p className="text-sm text-muted-foreground/60 mt-3">
                Receive a single email each morning summarizing all feedback
                from the previous day. Includes one-click unsubscribe link.
              </p>
            </div>
          </div>

          {isError && <p className="text-destructive text-sm">{errorMsg}</p>}

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
