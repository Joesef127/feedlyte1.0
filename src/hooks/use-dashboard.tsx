import { fetchDashboard, type DashboardFilters } from "@/services/api/dashboard";
import { useQuery } from "@tanstack/react-query";

export function useDashboard(filters?: DashboardFilters) {
  return useQuery({
    queryKey:    ["dashboard", filters],
    queryFn:     () => fetchDashboard(filters),
    staleTime:   30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  });
}