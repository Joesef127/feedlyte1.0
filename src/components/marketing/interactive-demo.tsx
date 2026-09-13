"use client";

import { useState } from "react";
import {
  MessageSquare,
  Bug,
  Sparkles,
  HelpCircle,
  Check,
  Copy,
  Sliders,
  Maximize2,
} from "lucide-react";

export function InteractiveDemo() {
  const [color, setColor] = useState("#F59E0B");
  const [label, setLabel] = useState("Feedback");
  const [position, setPosition] = useState<"bottom-right" | "bottom-left">("bottom-right");
  const [launcherStyle, setLauncherStyle] = useState<"pill" | "circle">("pill");
  const [iconName, setIconName] = useState<"message" | "bug" | "sparkles" | "help">("message");
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const colors = [
    { name: "Amber", hex: "#F59E0B" },
    { name: "Emerald", hex: "#10B981" },
    { name: "Indigo", hex: "#6366F1" },
    { name: "Rose", hex: "#F43F5E" },
    { name: "Cyan", hex: "#06B6D4" },
  ];

  const generatedScript = `<script
  src="https://feedlyte.vercel.app/widget.js"
  data-project="proj_k9x2m"
  data-color="${color}"
  data-position="${position}"
  data-label="${label}"
  defer
></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderIcon = () => {
    switch (iconName) {
      case "bug":
        return <Bug size={15} strokeWidth={2.5} />;
      case "sparkles":
        return <Sparkles size={15} strokeWidth={2.5} />;
      case "help":
        return <HelpCircle size={15} strokeWidth={2.5} />;
      default:
        return <MessageSquare size={15} strokeWidth={2.5} />;
    }
  };

  return (
    <section id="demo" className="py-24 sm:py-32 bg-background relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border border-border bg-card text-muted-foreground mb-4">
            <Sliders size={12} className="text-primary" /> Live Widget Sandbox
          </span>
          <h2 className="font-display text-[clamp(2.2rem,4.5vw,3.5rem)] tracking-tight text-foreground mb-4">
            Customize and test in real time.
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Tailor the launcher button to match your brand. See the preview update instantly and copy your ready-to-use embed snippet.
          </p>
        </div>

        {/* Interactive Customizer Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto">
          {/* Left: Configuration Controls (5 cols) */}
          <div className="lg:col-span-5 p-6 sm:p-7 rounded-2xl bg-card border border-border/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border/70">
              <span className="text-sm font-bold text-foreground">Widget Controls</span>
              <span className="text-[11px] font-mono text-muted-foreground">Reactive Preview</span>
            </div>

            {/* Accent Color Picker */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-2.5">
                Brand Accent Color
              </label>
              <div className="flex items-center gap-3">
                {colors.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setColor(c.hex)}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 relative"
                    style={{ backgroundColor: c.hex }}
                    aria-label={`Select ${c.name} color`}
                  >
                    {color === c.hex && (
                      <Check size={14} className="text-black stroke-[3]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Launcher Label Input */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-2">
                Button Label
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                maxLength={24}
                className="w-full text-xs rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:border-primary transition-colors font-sans"
                placeholder="e.g. Feedback, Support, Ideas"
              />
            </div>

            {/* Launcher Style Toggle */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-2">
                Launcher Style
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setLauncherStyle("pill")}
                  className={`py-2 px-3 rounded-lg border text-center font-medium transition-colors ${
                    launcherStyle === "pill"
                      ? "border-primary bg-primary/10 text-foreground font-semibold"
                      : "border-border bg-background text-muted-foreground hover:bg-accent"
                  }`}
                >
                  Pill with Label
                </button>
                <button
                  type="button"
                  onClick={() => setLauncherStyle("circle")}
                  className={`py-2 px-3 rounded-lg border text-center font-medium transition-colors ${
                    launcherStyle === "circle"
                      ? "border-primary bg-primary/10 text-foreground font-semibold"
                      : "border-border bg-background text-muted-foreground hover:bg-accent"
                  }`}
                >
                  Icon Only (Circle)
                </button>
              </div>
            </div>

            {/* Screen Placement */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-2">
                Screen Placement
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setPosition("bottom-right")}
                  className={`py-2 px-3 rounded-lg border text-center font-medium transition-colors ${
                    position === "bottom-right"
                      ? "border-primary bg-primary/10 text-foreground font-semibold"
                      : "border-border bg-background text-muted-foreground hover:bg-accent"
                  }`}
                >
                  Bottom Right
                </button>
                <button
                  type="button"
                  onClick={() => setPosition("bottom-left")}
                  className={`py-2 px-3 rounded-lg border text-center font-medium transition-colors ${
                    position === "bottom-left"
                      ? "border-primary bg-primary/10 text-foreground font-semibold"
                      : "border-border bg-background text-muted-foreground hover:bg-accent"
                  }`}
                >
                  Bottom Left
                </button>
              </div>
            </div>

            {/* Launcher Icon Selection */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-2">
                Launcher Icon
              </label>
              <div className="grid grid-cols-4 gap-2 text-xs">
                {(
                  [
                    { id: "message", label: "Chat", icon: MessageSquare },
                    { id: "bug", label: "Bug", icon: Bug },
                    { id: "sparkles", label: "Sparkle", icon: Sparkles },
                    { id: "help", label: "Help", icon: HelpCircle },
                  ] as const
                ).map((item) => {
                  const IconCmp = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setIconName(item.id)}
                      className={`py-2 flex flex-col items-center justify-center rounded-lg border transition-colors ${
                        iconName === item.id
                          ? "border-primary bg-primary/10 text-foreground font-semibold"
                          : "border-border bg-background text-muted-foreground hover:bg-accent"
                      }`}
                    >
                      <IconCmp size={15} />
                      <span className="text-[10px] mt-1">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Live Canvas Preview + Dynamic Code (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Live Canvas Stage */}
            <div className="relative min-h-[380px] rounded-2xl bg-card border border-border/80 shadow-card-elevated p-6 flex flex-col justify-between overflow-hidden">
              {/* Canvas Header */}
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-success inline-block animate-pulse" />
                  <span className="text-xs font-semibold text-foreground">
                    Live Preview Canvas
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground/70 font-mono">
                  Click the launcher to test
                </span>
              </div>

              {/* Center Canvas Watermark */}
              <div className="my-auto text-center py-12">
                <div className="w-12 h-12 rounded-2xl bg-foreground/5 mx-auto flex items-center justify-center text-muted-foreground/40 mb-3">
                  <Maximize2 size={20} />
                </div>
                <h4 className="text-sm font-bold text-foreground mb-1">
                  Your Web Application Content
                </h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  The Feedlyte widget mounts cleanly into the corner of your page without shifting layout or interfering with host styles.
                </p>
              </div>

              {/* Interactive Widget in Chosen Position */}
              <div
                className={`absolute bottom-6 flex ${
                  position === "bottom-right" ? "right-6" : "left-6"
                }`}
              >
                {/* Simulated Widget Dialog if Open */}
                {isWidgetOpen && (
                  <div className="absolute bottom-14 right-0 w-72 bg-card border border-border rounded-xl p-4 shadow-card-deep anim-fade-up z-20">
                    <div className="flex items-center justify-between pb-2 border-b border-border mb-3">
                      <span className="text-xs font-bold text-foreground">
                        {label || "Feedback"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsWidgetOpen(false)}
                        className="text-muted-foreground hover:text-foreground text-xs"
                      >
                        ✕
                      </button>
                    </div>

                    <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                      This is how your live widget dialog renders on any website.
                    </p>

                    <div className="space-y-2">
                      <div className="h-14 bg-background rounded-md border border-border/70 p-2 text-[11px] text-muted-foreground/60 font-mono">
                        User types thoughts here...
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsWidgetOpen(false)}
                        className="w-full py-2 rounded-md text-xs font-bold text-black transition-opacity hover:opacity-90"
                        style={{ backgroundColor: color }}
                      >
                        Send Feedback
                      </button>
                    </div>
                  </div>
                )}

                {/* The Configured Launcher Button */}
                <button
                  type="button"
                  onClick={() => setIsWidgetOpen(!isWidgetOpen)}
                  style={{ backgroundColor: color }}
                  className={`flex items-center gap-2 text-black font-bold shadow-lg hover:scale-105 active:scale-95 transition-transform ${
                    launcherStyle === "pill"
                      ? "px-4 py-2.5 rounded-full text-xs"
                      : "w-11 h-11 rounded-full justify-center"
                  }`}
                >
                  {renderIcon()}
                  {launcherStyle === "pill" && <span>{label || "Feedback"}</span>}
                </button>
              </div>
            </div>

            {/* Live Synchronized Embed Code */}
            <div className="rounded-2xl bg-card border border-border/80 p-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-border/60 mb-3">
                <span className="text-xs font-bold text-foreground font-mono">
                  Your Custom Embed Code
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md border border-border hover:bg-accent text-foreground transition-colors"
                >
                  {copied ? (
                    <>
                      <Check size={12} className="text-success" />
                      <span className="text-success">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} className="text-muted-foreground" />
                      <span>Copy snippet</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="text-xs font-mono text-muted-foreground overflow-x-auto bg-background/60 p-3 rounded-lg leading-relaxed">
                <code>{generatedScript}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
