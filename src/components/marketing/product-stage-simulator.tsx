"use client";

import { useState } from "react";
import {
  MessageSquare,
  Bug,
  Lightbulb,
  Heart,
  HelpCircle,
  Star,
  CheckCircle2,
  Globe,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { simulatorScenarios, SampleFeedbackScenario } from "./marketing-data";

export function ProductStageSimulator() {
  // Widget interactive state
  const [widgetOpen, setWidgetOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<"bug" | "idea" | "praise" | "question">("bug");
  const [rating, setRating] = useState(4);
  const [feedbackText, setFeedbackText] = useState("");
  const [includeContext, setIncludeContext] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [trackingToken, setTrackingToken] = useState<string | null>(null);

  // Live Feedlyte inbox feed state
  const [feedItems, setFeedItems] = useState<SampleFeedbackScenario[]>(simulatorScenarios);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const handleSimulatedSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!feedbackText.trim()) return;

    const token = `tk_${Math.random().toString(36).substring(2, 10)}`;
    const newItem: SampleFeedbackScenario = {
      id: `sim-${Date.now()}`,
      title: selectedCategory.toUpperCase(),
      category: selectedCategory,
      rating: rating,
      message: feedbackText.trim(),
      pageUrl: "https://your-site.com/app",
      device: "Desktop",
      browser: "Chrome 132.0",
      os: "macOS Sonoma",
      status: "unreviewed",
    };

    setFeedItems([newItem, ...feedItems]);
    setTrackingToken(token);
    setSubmitted(true);
    setFeedbackText("");
  };

  const loadScenario = (scenario: SampleFeedbackScenario) => {
    setSelectedCategory(scenario.category);
    setRating(scenario.rating);
    setFeedbackText(scenario.message);
    setWidgetOpen(true);
    setSubmitted(false);
    setTrackingToken(null);
  };

  const handleUpdateStatus = (id: string, newStatus: "reviewed" | "resolved") => {
    setFeedItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  const filteredFeed = feedItems.filter((item) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "bugs") return item.category === "bug";
    if (activeFilter === "ideas") return item.category === "idea";
    if (activeFilter === "praise") return item.category === "praise";
    return true;
  });

  return (
    <div className="w-full max-w-6xl mx-auto mt-12 bg-card/90 border border-border/80 rounded-2xl shadow-card-elevated overflow-hidden">
      {/* Simulation Top Bar */}
      <div className="h-12 border-b border-border/80 px-4 sm:px-6 flex items-center justify-between bg-card">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-destructive/70 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-primary/70 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-success/70 inline-block" />
          </div>
          <div className="hidden sm:flex items-center gap-1.5 ml-3 px-2.5 py-1 rounded bg-background border border-border/50 text-[11px] font-mono text-muted-foreground">
            <Globe size={11} className="text-muted-foreground/60" />
            <span>Interactive Live Product Simulator</span>
          </div>
        </div>

        {/* Quick Scenario Triggers */}
        <div className="flex items-center gap-1.5">
          <span className="hidden md:inline text-[11px] text-muted-foreground/60 mr-1 font-medium">
            Try scenario:
          </span>
          <button
            type="button"
            onClick={() => loadScenario(simulatorScenarios[0])}
            className="text-[11px] font-medium px-2 py-1 rounded bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20 transition-colors"
          >
            🐛 Bug
          </button>
          <button
            type="button"
            onClick={() => loadScenario(simulatorScenarios[1])}
            className="text-[11px] font-medium px-2 py-1 rounded bg-info/10 text-info hover:bg-info/20 border border-info/20 transition-colors"
          >
            💡 Idea
          </button>
          <button
            type="button"
            onClick={() => loadScenario(simulatorScenarios[2])}
            className="text-[11px] font-medium px-2 py-1 rounded bg-success/10 text-success hover:bg-success/20 border border-success/20 transition-colors"
          >
            ⭐ Praise
          </button>
        </div>
      </div>

      {/* Dual Pane Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
        {/* Left Pane: Host Application with Embedded Feedlyte Widget (7 cols on desktop) */}
        <div className="lg:col-span-6 p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-border/70 flex flex-col justify-between bg-background/50 relative overflow-hidden">
          {/* Mock Browser Frame Header */}
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-border/50 mb-5">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-foreground/10 flex items-center justify-center text-xs font-bold">
                  A
                </div>
                <span className="text-xs font-semibold tracking-tight text-foreground">
                  Acme Analytics App
                </span>
                <span className="text-[10px] text-muted-foreground/60 font-mono">
                  /dashboard
                </span>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                Your Host Website
              </span>
            </div>

            {/* Mock Site Content */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-card border border-border/60">
                <div className="text-xs font-medium text-muted-foreground mb-1">
                  Quarterly Net Revenue
                </div>
                <div className="text-2xl font-bold text-foreground font-sans">
                  $142,890.00
                </div>
                <div className="text-[11px] text-success font-medium mt-1">
                  +18.4% vs last quarter
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-lg bg-card border border-border/50">
                  <div className="text-[11px] text-muted-foreground">Active Users</div>
                  <div className="text-base font-bold text-foreground">18,240</div>
                </div>
                <div className="p-3 rounded-lg bg-card border border-border/50">
                  <div className="text-[11px] text-muted-foreground">Checkout Rate</div>
                  <div className="text-base font-bold text-foreground">4.82%</div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground/70 leading-relaxed pt-2">
                Click the <span className="text-primary font-semibold">Feedback</span> launcher below to test the real sandboxed widget. No CSS bleed, no framework dependencies.
              </p>
            </div>
          </div>

          {/* Interactive Widget Area inside Host App */}
          <div className="mt-8 pt-4 relative">
            {/* Widget Dialog Popup */}
            {widgetOpen ? (
              <div className="w-full max-w-sm ml-auto bg-card border border-border shadow-card-deep rounded-xl p-4 anim-fade-up">
                <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-primary/15 text-primary flex items-center justify-center">
                      <MessageSquare size={12} strokeWidth={2.5} />
                    </div>
                    <span className="text-xs font-bold text-foreground">
                      Share Feedback
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setWidgetOpen(false)}
                    className="text-muted-foreground hover:text-foreground text-xs"
                    aria-label="Close widget preview"
                  >
                    ✕
                  </button>
                </div>

                {submitted ? (
                  /* Success Confirmation with Public Tracking Token */
                  <div className="py-5 text-center space-y-3 anim-fade-up">
                    <CheckCircle2 size={32} className="text-success mx-auto" />
                    <div>
                      <div className="text-sm font-bold text-foreground">
                        Feedback Sent!
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Persisted atomically to Feedlyte triage inbox.
                      </p>
                    </div>

                    {trackingToken && (
                      <div className="bg-background border border-border/70 rounded-lg p-2.5 text-left text-[11px]">
                        <span className="text-muted-foreground/70 block text-[10px] uppercase tracking-wider font-semibold">
                          Anonymous Tracking URL:
                        </span>
                        <code className="text-primary font-mono text-[11px] truncate block mt-0.5">
                          feedlyte.com/track/{trackingToken}
                        </code>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setSubmitted(false);
                        setTrackingToken(null);
                        setWidgetOpen(false);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline pt-1"
                    >
                      <RotateCcw size={12} />
                      <span>Submit another response</span>
                    </button>
                  </div>
                ) : (
                  /* Feedback Submission Form */
                  <form onSubmit={handleSimulatedSubmit} className="space-y-3">
                    {/* Category Selector */}
                    <div>
                      <label className="block text-[11px] font-medium text-muted-foreground mb-1.5">
                        Category
                      </label>
                      <div className="grid grid-cols-4 gap-1">
                        {(
                          [
                            { id: "bug", label: "Bug", icon: Bug, color: "text-destructive" },
                            { id: "idea", label: "Idea", icon: Lightbulb, color: "text-info" },
                            { id: "praise", label: "Praise", icon: Heart, color: "text-success" },
                            { id: "question", label: "Ask", icon: HelpCircle, color: "text-primary" },
                          ] as const
                        ).map((cat) => {
                          const IconComponent = cat.icon;
                          const active = selectedCategory === cat.id;
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => setSelectedCategory(cat.id)}
                              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-md border text-[10px] font-semibold transition-all ${
                                active
                                  ? "border-primary/50 bg-primary/10 text-foreground shadow-sm"
                                  : "border-border/60 bg-background/50 text-muted-foreground hover:bg-accent"
                              }`}
                            >
                              <IconComponent size={13} className={active ? cat.color : "text-muted-foreground/70"} />
                              <span className="mt-0.5">{cat.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Star Rating Sentiment */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground mb-1">
                        <span>Sentiment Rating</span>
                        <span className="text-primary font-bold">{rating}/5</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="p-1 text-muted-foreground/40 hover:text-primary transition-colors"
                            aria-label={`Rate ${star} stars`}
                          >
                            <Star
                              size={16}
                              className={
                                star <= rating
                                  ? "fill-primary text-primary"
                                  : "text-muted-foreground/30"
                              }
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Message Textarea */}
                    <div>
                      <textarea
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="What's on your mind? Tell us what you experienced..."
                        rows={3}
                        className="w-full text-xs rounded-lg border border-border bg-background p-2.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors resize-none"
                        required
                      />
                    </div>

                    {/* Technical Context Capture Checkbox */}
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <input
                        type="checkbox"
                        id="include-ctx"
                        checked={includeContext}
                        onChange={(e) => setIncludeContext(e.target.checked)}
                        className="rounded border-border accent-primary cursor-pointer"
                      />
                      <label htmlFor="include-ctx" className="cursor-pointer">
                        Include URL & device details for bug triage
                      </label>
                    </div>

                    {/* Submit Action */}
                    <button
                      type="submit"
                      disabled={!feedbackText.trim()}
                      className="w-full py-2 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-amber-sm hover:shadow-amber-glow transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>Send to Feedlyte</span>
                      <ArrowRight size={12} strokeWidth={2.5} />
                    </button>
                  </form>
                )}
              </div>
            ) : (
              /* The Host Page Floating Widget Launcher */
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setWidgetOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-amber-glow hover:scale-105 active:scale-95 transition-all"
                >
                  <MessageSquare size={14} strokeWidth={2.5} />
                  <span>Feedback</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Feedlyte Central Triage Dashboard (5 cols on desktop) */}
        <div className="lg:col-span-6 p-4 sm:p-6 flex flex-col justify-between bg-card">
          <div>
            {/* Dashboard Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border/80 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-primary flex items-center justify-center text-primary-foreground">
                  <MessageSquare size={12} strokeWidth={2.5} />
                </div>
                <div>
                  <span className="text-xs font-bold text-foreground block leading-tight">
                    Feedlyte Triage Stream
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    Real-time ingestion inbox
                  </span>
                </div>
              </div>

              {/* Feed Filters */}
              <div className="flex items-center gap-1 bg-background border border-border/60 p-0.5 rounded-lg text-[10px] font-medium">
                {["all", "bugs", "ideas", "praise"].map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setActiveFilter(filter)}
                    className={`px-2 py-1 rounded capitalize transition-colors ${
                      activeFilter === filter
                        ? "bg-secondary text-foreground font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Ingestion Stream List */}
            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {filteredFeed.map((item, idx) => {
                const isNew = idx === 0 && item.id.startsWith("sim-");
                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-xl border transition-all ${
                      isNew
                        ? "bg-primary/5 border-primary/40 shadow-sm"
                        : "bg-background border-border/70 hover:border-border"
                    }`}
                  >
                    {/* Top Row: Category Tag, Stars, Status */}
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            item.category === "bug"
                              ? "bg-destructive/15 text-destructive border border-destructive/20"
                              : item.category === "idea"
                              ? "bg-info/15 text-info border border-info/20"
                              : item.category === "praise"
                              ? "bg-success/15 text-success border border-success/20"
                              : "bg-primary/15 text-primary border border-primary/20"
                          }`}
                        >
                          {item.category}
                        </span>

                        <div className="flex items-center text-[10px] text-primary font-bold">
                          <Star size={10} className="fill-primary text-primary mr-0.5" />
                          <span>{item.rating}/5</span>
                        </div>

                        {isNew && (
                          <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.2 rounded bg-primary text-primary-foreground animate-pulse">
                            Just Now
                          </span>
                        )}
                      </div>

                      {/* Status pill & Actions */}
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${
                            item.status === "unreviewed"
                              ? "bg-primary/10 text-primary"
                              : item.status === "reviewed"
                              ? "bg-info/10 text-info"
                              : "bg-success/10 text-success"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    </div>

                    {/* Message Body */}
                    <p className="text-xs text-foreground leading-snug font-medium mb-2">
                      {item.message}
                    </p>

                    {/* Captured Technical Context */}
                    <div className="flex items-center justify-between pt-2 border-t border-border/50 text-[10px] font-mono text-muted-foreground/70">
                      <span className="truncate max-w-[180px] text-muted-foreground">
                        {item.pageUrl}
                      </span>
                      <span>
                        {item.browser} • {item.os}
                      </span>
                    </div>

                    {/* Triage Quick Actions */}
                    {item.status === "unreviewed" && (
                      <div className="mt-2.5 pt-2 border-t border-border/40 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(item.id, "reviewed")}
                          className="text-[10px] font-semibold text-muted-foreground hover:text-foreground px-2 py-0.5 rounded border border-border/60 hover:bg-accent"
                        >
                          Mark Reviewed
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(item.id, "resolved")}
                          className="text-[10px] font-semibold text-success hover:text-success/90 px-2 py-0.5 rounded bg-success/10 border border-success/20 hover:bg-success/20"
                        >
                          Resolve
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Outbox & Webhook Verification Footer */}
          <div className="mt-4 pt-3 border-t border-border/70 flex items-center justify-between text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-success inline-block" />
              <span>Durable Outbox: Connected (Slack / Discord)</span>
            </div>
            <span className="font-mono text-[10px]">HMAC SHA-256</span>
          </div>
        </div>
      </div>
    </div>
  );
}
