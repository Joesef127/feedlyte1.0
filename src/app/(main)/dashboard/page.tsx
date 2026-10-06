import type { Metadata } from "next";
import { Suspense } from "react";
import { DashboardPage } from "@/components/dashboard/dashboard-page";
import DashboardLoading from "./loading";

export const metadata: Metadata = {
  title: "Overview",
  description: "Real-time dashboard overview of incoming user feedback and triage metrics.",
};

export default function DashboardRoute() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardPage />
    </Suspense>
  );
}