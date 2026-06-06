"use client";

import { useSession } from "next-auth/react";
import { useCurrentUser } from "@/hooks";
import { useProjects } from "@/hooks/use-projects";
import { useAllFeedback } from "@/hooks/use-feedback";
import { Card } from "@/components/ui/card";
import { User, Mail, Calendar, LayoutGrid, MessageSquare, CheckCircle, Shield } from "lucide-react";
import Link from "next/link";

function Avatar({ name, size = 72 }: { name: string; size?: number }) {
  const initials = name
    .split(" ")
    .filter((n) => n.length > 0)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div
      className="rounded-full bg-primary/15 border-2 border-primary/30 flex items-center justify-center shrink-0 font-bold text-primary"
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {initials}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: React.FC<{ size?: number; className?: string }>;
}) {
  return (
    <Card className="w-full">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
          {label}
        </span>
        <Icon size={14} className="text-muted-foreground/50" />
      </div>
      <span className="text-[28px] font-bold text-foreground tracking-tight">
        {value}
      </span>
    </Card>
  );
}

export function ProfilePage() {
  const { data: session } = useSession();
  const { data: user }    = useCurrentUser();
  const { data: projects = [] } = useProjects();
  const { data: feedback = [] } = useAllFeedback();

  const name      = user?.name  ?? session?.user?.name  ?? "User";
  const email     = user?.email ?? session?.user?.email ?? "";
  const joinDate  = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        year:  "numeric",
        month: "long",
        day:   "numeric",
      })
    : "—";

  const isVerified   = !!session?.user?.emailVerified;
  const resolvedCount = feedback.filter((f) => f.status === "resolved").length;
  const newCount      = feedback.filter((f) => f.status === "new").length;

  return (
    <div className="flex-1 px-9 py-8 overflow-y-auto">
      <div className="mb-7">
        <h1 className="text-[22px] font-bold text-foreground tracking-[-0.03em] m-0">
          Profile
        </h1>
        <p className="text-sm text-muted-foreground mt-1 m-0">
          Your account overview
        </p>
      </div>

      <div className="max-w-full xl:max-w-4/5 flex flex-col gap-4">

        {/* Identity card */}
        <Card>
          <div className="flex items-start gap-5">
            <Avatar name={name} />
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-foreground tracking-tight mb-0.5">
                {name}
              </h2>
              <div className="flex items-center gap-1.5 mb-3">
                <Mail size={13} className="text-muted-foreground/60" />
                <span className="text-sm text-muted-foreground">{email}</span>
              </div>

              {/* Verification badge */}
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={[
                    "inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full",
                    isVerified
                      ? "bg-success/10 text-success border border-success/20"
                      : "bg-destructive/10 text-destructive border border-destructive/20",
                  ].join(" ")}
                >
                  <CheckCircle size={11} />
                  {isVerified ? "Email verified" : "Email not verified"}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                  <Shield size={11} />
                  Free plan
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Account details */}
        <Card>
          <h3 className="text-[13px] font-bold mb-4 uppercase tracking-widest text-muted-foreground">
            Account Details
          </h3>
          <div className="flex flex-col gap-4">
            {[
              { label: "Full name",   value: name,      Icon: User },
              { label: "Email",       value: email,     Icon: Mail },
              { label: "Member since", value: joinDate, Icon: Calendar },
            ].map(({ label, value, Icon }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center shrink-0">
                  <Icon size={14} className="text-muted-foreground" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground/50 uppercase tracking-widest font-semibold m-0">
                    {label}
                  </p>
                  <p className="text-sm font-medium text-foreground m-0">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Usage stats */}
        <div>
          <h3 className="text-[13px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
            Usage Overview
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Projects"  value={projects.length}  icon={LayoutGrid} />
            <StatCard label="Total Feedback" value={feedback.length} icon={MessageSquare} />
            <StatCard label="Resolved"  value={resolvedCount}    icon={CheckCircle} />
            <StatCard label="Unreviewed" value={newCount}         icon={MessageSquare} />
          </div>
        </div>

        {/* Quick links */}
        <Card>
          <h3 className="text-[13px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
            Quick Actions
          </h3>
          <div className="flex flex-col gap-2">
            {[
              { label: "Edit name or email",  href: "/dashboard/settings" },
              { label: "Change password",     href: "/dashboard/settings" },
              { label: "Manage billing",      href: "/dashboard/settings" },
              { label: "Go to projects",      href: "/dashboard/projects" },
            ].map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-accent transition-colors group"
              >
                <span className="text-sm font-medium text-foreground">{label}</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  className="text-muted-foreground group-hover:text-foreground transition-colors"
                >
                  <path
                    d="M3 7h8M7 3l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            ))}          </div>
        </Card>
      </div>
    </div>
  );
}