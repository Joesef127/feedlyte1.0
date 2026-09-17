"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutGrid,
  MessageSquare,
  CheckCircle,
  Eye,
  Plus,
  ArrowRight,
  Filter,
  Layers,
  BarChart3,
  Clock,
} from "lucide-react";
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { FormField } from "@/components/ui/form-field";
import { FeedbackRow } from "@/components/feedback/feedback-row";
import StatCard from "@/components/ui/StatCard";
import { useDashboard } from "@/hooks/use-dashboard";
import { useCreateProject } from "@/hooks/use-projects";
import {
  useUpdateFeedbackStatus,
  useDeleteFeedback,
} from "@/hooks/use-feedback";
import type { Status } from "@/types";
import { toast } from "sonner";
import { friendlyError } from "@/lib/error-messages";

// ── Helpers ───────────────────────────────────────────────────────────────────

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function TrendTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; name?: string; color?: string; dataKey?: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover/95 border border-border backdrop-blur-md rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-muted-foreground font-medium mb-1">{label}</p>
      {payload.map((entry, index) => {
        const isResolved = entry.dataKey === "resolved";
        return (
          <div
            key={index}
            className="flex items-center justify-between gap-4 font-semibold text-foreground py-0.5"
          >
            <div className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: isResolved ? "#22C55E" : "var(--primary)" }}
              />
              <span className="text-muted-foreground capitalize">
                {isResolved ? "Resolved" : "Submissions"}:
              </span>
            </div>
            <span>{entry.value}</span>
          </div>
        );
      })}
    </div>
  );
}

function SectionHeader({
  title,
  href,
  linkLabel = "View all",
}: {
  title: string;
  href: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-sm font-bold text-foreground uppercase tracking-widest">
        {title}
      </h2>
      <Link
        href={href}
        className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        {linkLabel}
        <ArrowRight size={12} />
      </Link>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();

  // Filters state
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [timeframe, setTimeframe] = useState<"7d" | "30d" | "90d">("30d");
  const [distributionView, setDistributionView] = useState<"status" | "category">("status");

  const { data, isLoading } = useDashboard({
    project: selectedProject,
    timeframe,
  });

  const updateStatus = useUpdateFeedbackStatus();
  const deleteFb = useDeleteFeedback();
  const createProject = useCreateProject();

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#F59E0B");
  const [position, setPosition] = useState<"bottom-right" | "bottom-left">(
    "bottom-right",
  );

  const resetForm = () => {
    setName("");
    setColor("#F59E0B");
    setPosition("bottom-right");
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      const project = await createProject.mutateAsync({
        name: name.trim(),
        color,
        position,
      });
      setShowModal(false);

      toast.success("Project created");
      resetForm();
      router.push(`/dashboard/projects/${project.id}`);
    } catch (err) {
      toast.error(friendlyError(err));
    }
  };

  const firstName = session?.user?.name?.split(" ")[0] ?? "there";
  const unreviewed = data?.stats.unreviewed ?? 0;
  const projectsCount = data?.stats.totalProjects ?? 0;
  const totalFeedback = data?.stats.totalFeedback ?? 0;
  const resolutionRate = data?.stats.resolutionRate ?? 0;

  const summaryLine =
    unreviewed === 0
      ? "Everything is up to date."
      : `You have ${unreviewed} unreviewed feedback item${unreviewed !== 1 ? "s" : ""} across ${projectsCount} project${projectsCount !== 1 ? "s" : ""}.`;

  const projectMap = useMemo(() => {
    const projects = data?.recentProjects ?? [];
    return Object.fromEntries(
      projects.map((p) => [p.id, { name: p.name, color: p.color }]),
    );
  }, [data?.recentProjects]);

  const allProjects = useMemo(() => {
    return data?.allProjects ?? data?.recentProjects ?? [];
  }, [data?.allProjects, data?.recentProjects]);

  const recentFeedback = useMemo(() => {
    const feedback = data?.recentFeedback ?? [];
    return feedback.map((f) => ({
      id: f.id,
      projectId: f.project.id,
      message: f.message,
      email: "",
      pageUrl: "",
      userAgent: "",
      status: f.status as Status,
      createdAt: f.createdAt,
    }));
  }, [data?.recentFeedback]);

  // Distribution counts
  const activeStatuses = useMemo(() => {
    return (data?.statusDistribution ?? []).filter((s) => s.count > 0);
  }, [data?.statusDistribution]);

  const activeCategories = useMemo(() => {
    return (data?.categoryDistribution ?? []).filter((c) => c.count > 0);
  }, [data?.categoryDistribution]);

  const trendData = data?.feedbackTrend ?? [];
  const tickInterval = timeframe === "7d" ? 1 : timeframe === "90d" ? 12 : 5;

  return (
    <div className="flex-1 px-5 sm:px-9 py-8 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-[-0.03em] mb-1">
            {greeting()}, {firstName}
          </h1>
          <p className="text-sm text-muted-foreground">{summaryLine}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/feedback">
            <Button variant="secondary" className="gap-1.5">
              <MessageSquare size={14} />
              All Feedback
            </Button>
          </Link>
          <Button onClick={() => setShowModal(true)} className="gap-1.5">
            <Plus size={14} />
            New Project
          </Button>
        </div>
      </div>

      {/* Filter & Controls Bar */}
      <div className="bg-card border border-border rounded-xl p-3 sm:p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Project Selector */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Filter size={15} className="text-muted-foreground shrink-0" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider shrink-0">
            Project:
          </span>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium text-foreground outline-none focus:border-primary transition-colors cursor-pointer w-full sm:w-56"
          >
            <option value="all">All Projects</option>
            {allProjects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Dynamic Timeframe Selector */}
        <div className="flex items-center bg-secondary/80 border border-border p-0.5 rounded-lg w-full sm:w-auto justify-center">
          {(["7d", "30d", "90d"] as const).map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeframe(tf)}
              className={[
                "px-3 py-1 rounded-md text-xs font-semibold transition-all duration-150 cursor-pointer",
                timeframe === tf
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {tf === "7d" ? "7 Days" : tf === "30d" ? "30 Days" : "90 Days"}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-muted-foreground text-sm">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading dashboard...
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            <StatCard
              label="Projects"
              value={data?.stats.totalProjects ?? 0}
              icon={LayoutGrid}
            />
            <StatCard
              label="Total Feedback"
              value={totalFeedback}
              icon={MessageSquare}
            />
            <StatCard
              label="Unreviewed"
              value={data?.stats.unreviewed ?? 0}
              icon={Eye}
              accent="text-amber-500"
            />
            <StatCard
              label="Reviewed"
              value={data?.stats.reviewed ?? 0}
              icon={Eye}
              accent="text-blue-500"
            />
            <StatCard
              label="Resolved"
              value={data?.stats.resolved ?? 0}
              icon={CheckCircle}
              accent="text-green-500"
            />
          </div>

          {/* Interactive Modern Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Feedback Trend Chart (2 cols on lg) */}
            <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 sm:p-6 flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-foreground uppercase tracking-widest">
                      Feedback Activity Trend
                    </h2>
                    {resolutionRate > 0 && (
                      <span className="text-[11px] font-semibold bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full">
                        {resolutionRate}% resolved
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Submissions and resolutions ({timeframe === "7d" ? "last 7 days" : timeframe === "90d" ? "last 90 days" : "last 30 days"})
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                    <span className="text-muted-foreground font-medium">Submissions</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-muted-foreground font-medium">Resolved</span>
                  </div>
                </div>
              </div>

              {trendData.length === 0 ? (
                <div className="h-56 flex items-center justify-center text-xs text-muted-foreground">
                  No activity recorded for this period.
                </div>
              ) : (
                <div className="h-56 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={trendData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="dashboardTrendGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                        tickFormatter={(val, i) => (i % tickInterval === 0 ? val : "")}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <RechartsTooltip content={<TrendTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="count"
                        name="Submissions"
                        stroke="var(--primary)"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#dashboardTrendGradient)"
                        dot={false}
                        activeDot={{ r: 4, fill: "var(--primary)" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="resolved"
                        name="Resolved"
                        stroke="#22C55E"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, fill: "#22C55E" }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Distribution Card (Status vs Category Toggle) */}
            <div className="bg-card border border-border rounded-xl p-5 sm:p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-foreground uppercase tracking-widest">
                    Distribution
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {distributionView === "status" ? "Lifecycle breakdown" : "Category breakdown"}
                  </p>
                </div>
                {/* Distribution View Switcher */}
                <div className="flex items-center bg-secondary/80 border border-border p-0.5 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setDistributionView("status")}
                    className={[
                      "px-2.5 py-1 rounded font-semibold transition-all cursor-pointer",
                      distributionView === "status"
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground",
                    ].join(" ")}
                  >
                    Status
                  </button>
                  <button
                    type="button"
                    onClick={() => setDistributionView("category")}
                    className={[
                      "px-2.5 py-1 rounded font-semibold transition-all cursor-pointer",
                      distributionView === "category"
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground",
                    ].join(" ")}
                  >
                    Category
                  </button>
                </div>
              </div>

              {distributionView === "status" ? (
                /* Status Breakdown */
                activeStatuses.length === 0 ? (
                  <div className="h-56 flex items-center justify-center text-xs text-muted-foreground">
                    No status data available.
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center flex-1">
                    <div className="h-36 w-full flex items-center justify-center relative">
                      <ResponsiveContainer width={150} height={150}>
                        <PieChart>
                          <Pie
                            data={activeStatuses}
                            dataKey="count"
                            nameKey="label"
                            cx="50%"
                            cy="50%"
                            innerRadius={46}
                            outerRadius={68}
                            paddingAngle={3}
                          >
                            {activeStatuses.map((item) => (
                              <Cell key={item.status} fill={item.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip
                            contentStyle={{
                              background: "var(--card)",
                              border: "1px solid var(--border)",
                              borderRadius: "8px",
                              fontSize: "12px",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-xl font-bold text-foreground leading-none">
                          {totalFeedback}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium mt-0.5">
                          Total
                        </span>
                      </div>
                    </div>
                    <div className="w-full flex flex-col gap-1.5 mt-3 pt-3 border-t border-border">
                      {activeStatuses.slice(0, 5).map((item) => {
                        const pct = totalFeedback > 0 ? Math.round((item.count / totalFeedback) * 100) : 0;
                        return (
                          <div key={item.status} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ background: item.color }}
                              />
                              <span className="text-muted-foreground font-medium">{item.label}</span>
                            </div>
                            <div className="flex items-center gap-2 font-semibold">
                              <span className="text-muted-foreground/60 text-[11px] font-normal">{pct}%</span>
                              <span className="text-foreground">{item.count}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )
              ) : (
                /* Category Breakdown */
                activeCategories.length === 0 ? (
                  <div className="h-56 flex items-center justify-center text-xs text-muted-foreground">
                    No categorized feedback yet.
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center flex-1">
                    <div className="h-36 w-full flex items-center justify-center relative">
                      <ResponsiveContainer width={150} height={150}>
                        <PieChart>
                          <Pie
                            data={activeCategories}
                            dataKey="count"
                            nameKey="label"
                            cx="50%"
                            cy="50%"
                            innerRadius={46}
                            outerRadius={68}
                            paddingAngle={3}
                          >
                            {activeCategories.map((item) => (
                              <Cell key={item.category} fill={item.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip
                            contentStyle={{
                              background: "var(--card)",
                              border: "1px solid var(--border)",
                              borderRadius: "8px",
                              fontSize: "12px",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-xl font-bold text-foreground leading-none">
                          {activeCategories.reduce((acc, c) => acc + c.count, 0)}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium mt-0.5">
                          Categorized
                        </span>
                      </div>
                    </div>
                    <div className="w-full flex flex-col gap-1.5 mt-3 pt-3 border-t border-border">
                      {activeCategories.slice(0, 5).map((item) => {
                        const sum = activeCategories.reduce((acc, c) => acc + c.count, 0);
                        const pct = sum > 0 ? Math.round((item.count / sum) * 100) : 0;
                        return (
                          <div key={item.category} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ background: item.color }}
                              />
                              <span className="text-muted-foreground font-medium">{item.label}</span>
                            </div>
                            <div className="flex items-center gap-2 font-semibold">
                              <span className="text-muted-foreground/60 text-[11px] font-normal">{pct}%</span>
                              <span className="text-foreground">{item.count}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Bottom Grid: Recent Feedback and Projects */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 xl:gap-8">
            {/* Left column: Recent Feedback */}
            <div className="flex flex-col gap-6 xl:col-span-2">
              <div className="flex flex-col gap-3">
                <SectionHeader
                  title="Recent Feedback"
                  href="/dashboard/feedback"
                />
                {!recentFeedback.length ? (
                  <Card>
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No feedback yet for this selection.
                    </p>
                  </Card>
                ) : (
                  recentFeedback
                    .slice(0, 6)
                    .map((fb) => (
                      <FeedbackRow
                        key={fb.id}
                        fb={fb}
                        onUpdateStatus={(id, status) =>
                          updateStatus.mutateAsync({ id, status })
                        }
                        onDelete={(id) => deleteFb.mutateAsync(id)}
                        projectName={projectMap[fb.projectId]?.name}
                        projectColor={projectMap[fb.projectId]?.color}
                      />
                    ))
                )}
              </div>
            </div>

            {/* Right column: Recent Projects */}
            <div className="flex flex-col gap-6 xl:gap-8">
              {!data?.recentProjects.length ? (
                <>
                  <SectionHeader
                    title="Recent Projects"
                    href="/dashboard/projects"
                    linkLabel="All projects"
                  />
                  <Card>
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No projects yet.
                    </p>
                    <div className="flex justify-center">
                      <Button
                        onClick={() => setShowModal(true)}
                        className="gap-1.5"
                      >
                        <Plus size={14} />
                        Create project
                      </Button>
                    </div>
                  </Card>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <SectionHeader
                    title="Recent Projects"
                    href="/dashboard/projects"
                    linkLabel="All projects"
                  />
                  {data.recentProjects.slice(0, 4).map((p) => (
                    <Link
                      key={p.id}
                      href={`/dashboard/projects/${p.id}`}
                      className="flex items-center gap-3 p-3.5 bg-card border border-border rounded-xl hover:border-border/70 transition-colors group"
                    >
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: p.color + "20" }}
                      >
                        <LayoutGrid size={14} style={{ color: p.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                          {p.name}
                        </p>
                        <p className="text-xs text-muted-foreground/60">
                          {p.feedbackCount} feedback
                          {p.unreviewedCount > 0 && (
                            <span className="text-amber-500 ml-1.5 font-medium">
                              · {p.unreviewedCount} unreviewed
                            </span>
                          )}
                        </p>
                      </div>
                      <ArrowRight
                        size={14}
                        className="text-muted-foreground/30 group-hover:text-muted-foreground transition-colors shrink-0"
                      />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      <Modal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title="Create New Project"
      >
        <div className="flex flex-col gap-4">
          <FormField
            label="Project Name"
            value={name}
            onChange={setName}
            placeholder="e.g. My SaaS App"
          />

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block mb-2">
              Widget Accent Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent p-0"
              />
              <span className="font-mono text-sm text-muted-foreground">
                {color}
              </span>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block mb-2">
              Widget Position
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["bottom-right", "bottom-left"] as const).map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => setPosition(pos)}
                  style={{
                    borderColor: position === pos ? color : "var(--border)",
                    color: position === pos ? color : "var(--muted-foreground)",
                    background: position === pos ? color + "15" : "transparent",
                  }}
                  className="px-3 py-2.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all capitalize"
                >
                  {pos.replace("-", " ")}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border mt-2">
            <Button
              variant="secondary"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!name.trim() || createProject.isPending}
            >
              {createProject.isPending ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
