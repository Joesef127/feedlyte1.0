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
  TrendingUp,
} from "lucide-react";
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

// ── Helpers ───────────────────────────────────────────────────────────────────

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
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
  const { data, isLoading } = useDashboard();

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
    } catch {
      // error shown via createProject.isError
    }
  };

  const firstName = session?.user?.name?.split(" ")[0] ?? "there";
  const unreviewed = data?.stats.unreviewed ?? 0;
  const projects = data?.stats.totalProjects ?? 0;

  const summaryLine =
    unreviewed === 0
      ? "Everything is up to date."
      : `You have ${unreviewed} unreviewed feedback item${unreviewed !== 1 ? "s" : ""} across ${projects} project${projects !== 1 ? "s" : ""}.`;

  const projectMap = useMemo(() => {
    const projects = data?.recentProjects ?? [];

    return Object.fromEntries(
      projects.map((p) => [p.id, { name: p.name, color: p.color }]),
    );
  }, [data?.recentProjects]);

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

  return (
    <div className="flex-1 px-9 py-8 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-3">
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

      {isLoading ? (
        <div className="text-center py-20 text-muted-foreground text-sm">
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
              value={data?.stats.totalFeedback ?? 0}
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

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 xl:gap-8">
            {/* Left column */}
            <div className="flex flex-col gap-6 xl:col-span-2">
              <div className="flex flex-col gap-3">
                <SectionHeader
                  title="Recent Feedback"
                  href="/dashboard/feedback"
                />
                {!recentFeedback.length ? (
                  <Card>
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No feedback yet.
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
                          updateStatus.mutate({ id, status })
                        }
                        onDelete={(id) => deleteFb.mutate(id)}
                        projectName={projectMap[fb.projectId]?.name}
                        projectColor={projectMap[fb.projectId]?.color}
                      />
                    ))
                )}
              </div>
            </div>

            {/* Right column */}
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
                  {data.recentProjects.slice(0, 3).map((p) => (
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
                        <p className="text-xs text-muted-foreground/50">
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

              {/* Top projects */}
              <div className="mt-2">
                <SectionHeader
                  title="Top Projects (30 days)"
                  href="/dashboard/projects"
                  linkLabel="All projects"
                />
                {!data?.topProjects.length ? (
                  <Card>
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No projects yet.
                    </p>
                  </Card>
                ) : (
                  <div className="flex flex-col gap-2">
                    {data.topProjects.slice(0, 3).map((p, i) => (
                      <Link
                        key={p.id}
                        href={`/dashboard/projects/${p.id}`}
                        className="flex items-center gap-3 p-3.5 bg-card border border-border rounded-xl hover:border-border/70 transition-colors group"
                      >
                        <span className="text-xs font-bold text-muted-foreground/30 w-4 shrink-0">
                          {i + 1}
                        </span>
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: p.color + "20" }}
                        >
                          <TrendingUp size={14} style={{ color: p.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                            {p.name}
                          </p>
                          <p className="text-xs text-muted-foreground/50">
                            {p.totalFeedback} total · {p.last30Days} this month
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
        </div>
      )}

      {/* Create project modal */}
      <Modal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title="Create Project"
      >
        <div className="flex flex-col gap-4">
          <FormField
            label="Project Name"
            value={name}
            onChange={setName}
            placeholder="My Website"
          />
          <div>
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-[0.04em] mb-2">
              Widget Color
            </p>
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full border-2 border-sidebar-border shrink-0"
                style={{ background: color }}
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
          <div>
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-[0.04em] mb-2">
              Widget Position
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
                  className="px-3 py-[7px] rounded-[7px] border text-sm font-medium cursor-pointer transition-all"
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>

          {createProject.isError && (
            <p className="text-destructive text-sm">
              {(createProject.error as Error)?.message ??
                "Failed to create project."}
            </p>
          )}

          <div className="flex gap-2 justify-end mt-2">
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
