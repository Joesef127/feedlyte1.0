import { useQuery } from "@tanstack/react-query";

export interface MetricsKPIs {
  totalFeedback: number;
  unreviewed: number;
  inProgress: number;
  resolved: number;
  resolutionRate: number;
  avgRating: number | null;
  avgResolutionTime: string;
  activeProjects: number;
}

export interface VolumeTrendPoint {
  date: string;
  label: string;
  count: number;
}

export interface StatusDistributionItem {
  status: string;
  label: string;
  color: string;
  count: number;
}

export interface CategoryDistributionItem {
  category: string;
  label: string;
  color: string;
  count: number;
}

export interface ProjectVolumeItem {
  id: string;
  name: string;
  color: string;
  count: number;
}

export interface MetricsData {
  days: number;
  kpis: MetricsKPIs;
  volumeTrend: VolumeTrendPoint[];
  statusDistribution: StatusDistributionItem[];
  categoryDistribution: CategoryDistributionItem[];
  projectVolume: ProjectVolumeItem[];
}

async function fetchMetrics(days: number): Promise<MetricsData> {
  const res = await fetch(`/api/metrics?days=${days}`);
  if (!res.ok) {
    throw new Error("Failed to load metrics");
  }
  return res.json();
}

export function useMetrics(days: 7 | 30 | 90 = 30) {
  return useQuery({
    queryKey: ["metrics", days],
    queryFn: () => fetchMetrics(days),
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });
}
