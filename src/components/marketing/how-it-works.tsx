"use client";

const steps = [
  {
    number: "01",
    title: "Create a project",
    description:
      "Sign up and create a project in under a minute. Name it, set the domain, and Feedlyte generates a unique embed code tied to that project.",
    visual: "project" as const,
  },
  {
    number: "02",
    title: "Paste one script tag",
    description:
      "Copy the generated script tag and drop it into your site's HTML. That is the entire integration. No npm install, no bundler config, no API keys in your frontend.",
    visual: "code" as const,
  },
  {
    number: "03",
    title: "Review feedback in your dashboard",
    description:
      "Every submission lands in your Feedlyte dashboard in real time. Filter by status, search by keyword, and mark items as reviewed or resolved.",
    visual: "dashboard" as const,
  },
];

function CodeVisual() {
  return (
    <div className="mt-5 bg-background border border-border/70 rounded-xl p-5 font-mono text-[13px]">
      <pre className="whitespace-pre-wrap break-words m-0">
        <span className="code-keyword">{"<script"}</span>
        {"\n  "}
        <span className="code-attr">src</span>
        {"="}
        <span className="code-string">{'"https://feedlyte.com/widget.js"'}</span>
        {"\n  "}
        <span className="code-attr">data-project-id</span>
        {"="}
        <span className="code-string">{'"proj_k9x2m"'}</span>
        {"\n  "}
        <span className="code-attr">defer</span>
        {"\n"}
        <span className="code-keyword">{"</script>"}</span>
      </pre>
    </div>
  );
}

function ProjectVisual() {
  const projects = [
    { name: "Marketing Site", count: 12, color: "bg-primary" },
    { name: "Mobile App", count: 5, color: "bg-info" },
    { name: "Docs Portal", count: 8, color: "bg-success" },
  ];

  return (
    <div className="mt-5 bg-background border border-border/70 rounded-xl p-5 flex flex-col gap-2.5">
      {projects.map((p) => (
        <div key={p.name} className="flex items-center justify-between px-3.5 py-2.5 bg-card border border-border rounded-lg">
          <div className="flex items-center gap-2.5">
            <div className={`w-2 h-2 rounded-full ${p.color}`} />
            <span className="text-sm font-medium text-foreground">{p.name}</span>
          </div>
          <span className="text-[11px] text-muted-foreground/50 bg-background border border-border px-2 py-0.5 rounded-full">
            {p.count} entries
          </span>
        </div>
      ))}
    </div>
  );
}

function DashboardVisual() {
  const items = [
    { msg: "Checkout fails on mobile Safari", status: "new", cls: "text-primary bg-primary/10" },
    { msg: "Can you add CSV export?", status: "reviewed", cls: "text-info bg-info/10" },
    { msg: "Love the new onboarding flow!", status: "resolved", cls: "text-success bg-success/10" },
  ];

  return (
    <div className="mt-5 bg-background border border-border/70 rounded-xl p-5 flex flex-col gap-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center justify-between gap-3 px-3.5 py-2.5 bg-card border border-border rounded-lg">
          <span className="text-xs text-muted-foreground flex-1 truncate">{item.msg}</span>
          <span className={`text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full shrink-0 ${item.cls}`}>
            {item.status}
          </span>
        </div>
      ))}
    </div>
  );
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24">
      <div className="mx-auto max-w-[1120px] px-6">

        {/* Header */}
        <div className="text-center mb-18">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest border border-border text-muted-foreground bg-card mb-5">
            How it works
          </span>
          <h2 className="font-display text-[clamp(2rem,4vw,3.2rem)] tracking-tight mb-4 text-foreground">
            Up and running in minutes
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-[480px] mx-auto">
            Three steps from signup to live feedback on your product.
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden border border-border">
          {steps.map((step) => (
            <div key={step.number} className="bg-card p-9">
              <div className="font-display text-[3.5rem] text-border/80 leading-none mb-5 tracking-tighter">
                {step.number}
              </div>
              <h3 className="text-base font-bold text-foreground mb-2.5 tracking-tight">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
              {step.visual === "code" && <CodeVisual />}
              {step.visual === "project" && <ProjectVisual />}
              {step.visual === "dashboard" && <DashboardVisual />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}