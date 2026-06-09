import { useQuery } from "@tanstack/react-query";

export interface AnalyticsData {
  total:   number;
  volumeByDay: { date: string; count: number }[];
  statusBreakdown: { status: string; count: number }[];
  topPages: { page: string; count: number }[];
  byDayOfWeek: { label: string; count: number }[];
}

async function fetchAnalytics(projectId: string): Promise<AnalyticsData> {
  const res = await fetch(`/api/projects/${projectId}/analytics`);
  if (!res.ok) throw new Error("Failed to load analytics");
  return res.json();
}

export function useAnalytics(projectId: string) {
  return useQuery({
    queryKey:  ["analytics", projectId],
    queryFn:   () => fetchAnalytics(projectId),
    enabled:   !!projectId,
    staleTime: 60 * 1000,
  });
}