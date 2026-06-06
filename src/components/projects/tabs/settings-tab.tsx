"use client";

import { useState } from "react";
import type { Project, WidgetPosition } from "@/types";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";

interface SettingsTabProps {
  project:  Project;
  onUpdate: (project: Project) => void;
  isSaving: boolean;
  isError:  boolean;
  errorMsg: string;
  onSave:   (data: {
    color:         string;
    position:      string;
    label:         string;
    allowedOrigin: string;
  }) => void;
}

export function SettingsTab({
  project,
  isSaving,
  isError,
  errorMsg,
  onSave,
}: SettingsTabProps) {
  const [color,         setColor]         = useState(project.color);
  const [position,      setPosition]      = useState<string>(project.position);
  const [label,         setLabel]         = useState(project.label);
  const [allowedOrigin, setAllowedOrigin] = useState(project.allowedOrigin ?? "");

  const handleSave = () => {
    onSave({ color, position, label, allowedOrigin });
  };

  return (
    <div className="max-w-120">
      <Card>
        <h3 className="text-[14px] font-bold text-foreground mb-4">
          Widget Configuration
        </h3>
        <div className="flex flex-col gap-4">

          {/* Accent color */}
          <div>
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-[0.04em] mb-2">
              Accent Color
            </p>
            <div className="flex items-center gap-3">
              <div
                style={{ background: color }}
                className="w-8 h-8 rounded-full border-2 border-sidebar-border shrink-0"
              />
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent p-0"
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
                    color:       position === pos ? color : "var(--muted-foreground)",
                    background:  position === pos ? color + "15" : "transparent",
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
            <p className="text-xs text-muted-foreground/60 mt-1.5">
              The domain your widget is embedded on. Only submissions from this
              origin will be accepted. Leave blank to use the default allowlist.
            </p>
          </div>

          {isError && (
            <p className="text-destructive text-sm">{errorMsg}</p>
          )}

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