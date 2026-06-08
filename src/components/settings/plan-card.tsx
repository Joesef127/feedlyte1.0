"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function PlanCard() {
  return (
    <Card>
      <h3 className="text-sm font-bold">Plan</h3>

      <p className="text-sm text-muted-foreground">
        Free plan active
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {[
          ["Projects", "1"],
          ["Feedback/mo", "200"],
          ["Retention", "7 days"],
        ].map(([k, v]) => (
          <div key={k} className="p-3 bg-background rounded-lg">
            <p className="text-[10px] sm:text-xs uppercase text-muted-foreground tracking-widest text-wrap">
              {k}
            </p>
            <p className="text-sm font-bold">{v}</p>
          </div>
        ))}
      </div>

      <Button variant="secondary" disabled>Manage Billing</Button>
    </Card>
  );
}