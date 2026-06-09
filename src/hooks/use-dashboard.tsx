import { fetchDashboard } from "@/services/api/dashboard";
import { useQuery } from "@tanstack/react-query";

export function useDashboard() {
  return useQuery({
    queryKey:    ["dashboard"],
    queryFn:     fetchDashboard,
    staleTime:   30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  });
}