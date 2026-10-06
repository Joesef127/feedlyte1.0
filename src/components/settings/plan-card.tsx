"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Sparkles } from "lucide-react";

export function PlanCard() {
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-foreground">Plan & Limits</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Your current workspace tier and quotas
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold">
          <Shield size={12} />
          Free Tier
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {[
          ["Projects", "1"],
          ["Feedback/mo", "200"],
          ["Retention", "7 days"],
        ].map(([k, v]) => (
          <div key={k} className="p-3 bg-background border border-border/60 rounded-xl">
            <p className="text-[10px] sm:text-xs uppercase text-muted-foreground tracking-widest font-semibold">
              {k}
            </p>
            <p className="text-sm font-bold text-foreground mt-1">{v}</p>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-border/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground/80">
          Need unlimited projects and 90-day retention?
        </p>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
          onClick={() => {
            window.location.href = "/#pricing";
          }}
        >
          <Sparkles size={13} />
          View Pro Plans
        </Button>
      </div>
    </Card>
  );
}