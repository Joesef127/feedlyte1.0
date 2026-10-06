import type { Metadata } from "next";
import { MetricsPage } from "@/components/metrics/metrics-page";

export const metadata: Metadata = {
  title: "Analytics & Metrics",
  description: "Cross-project performance, response rates, and customer sentiment analytics.",
};

export default function MetricsRoute() {
  return <MetricsPage />;
}
