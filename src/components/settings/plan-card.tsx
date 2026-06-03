"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function PlanCard() {
  return (
    <Card>
      <h3 className="text-[14px] font-bold mb-1">Plan</h3>

      <p className="text-sm text-muted-foreground mb-4">
        Free plan active
      </p>

      <div className="grid grid-cols-3 gap-2.5 mb-4">
        {[
          ["Projects", "1"],
          ["Feedback/mo", "200"],
          ["Retention", "7 days"],
        ].map(([k, v]) => (
          <div key={k} className="p-3 bg-background rounded-lg">
            <p className="text-[11px] uppercase text-muted-foreground">
              {k}
            </p>
            <p className="text-[14px] font-bold">{v}</p>
          </div>
        ))}
      </div>

      <Button variant="secondary" disabled>Manage Billing</Button>
    </Card>
  );
}