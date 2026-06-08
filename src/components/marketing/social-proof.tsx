"use client";

const stats = [
  { value: "1-line", label: "embed setup" },
  { value: "<2kb", label: "widget size" },
  { value: "99.9%", label: "uptime SLA" },
  { value: "GDPR", label: "compliant" },
];

const logos = ["Vercel", "Netlify", "Railway", "Supabase", "PlanetScale", "Render"];

export function SocialProof() {
  return (
    <section className="py-24 bg-background">
      <div className="mx-auto max-w-7xl px-6">

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-2xl overflow-hidden border border-border mb-14">
          {stats.map((stat) => (
            <div key={stat.value} className="bg-card py-7 px-6 text-center">
              <div className="font-display text-[clamp(1.8rem,3vw,2.6rem)] text-primary tracking-tight mb-1">
                {stat.value}
              </div>
              <div className="text-sm font-medium text-muted-foreground/50">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Logo strip */}
        <div className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/40 mb-7">
            Works on any stack
          </p>
          <div className="flex items-center justify-center gap-10 flex-wrap">
            {logos.map((name) => (
              <span
                key={name}
                className="text-[15px] font-bold tracking-tight text-muted-foreground/30 hover:text-muted-foreground/80 transition-colors cursor-default"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}