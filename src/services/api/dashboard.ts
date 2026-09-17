export interface DashboardStats {
  totalProjects:  number;
  totalFeedback:  number;
  unreviewed:     number;
  reviewed:       number;
  in_review?:     number;
  accepted?:      number;
  in_progress?:   number;
  resolved:       number;
  not_feasible?:  number;
  closed?:        number;
  spam?:          number;
  resolutionRate?: number;
}

export interface DashboardProject {
  id:               string;
  name:             string;
  color:            string;
  feedbackCount:    number;
  unreviewedCount:  number;
  createdAt:        string;
}

export interface DashboardFeedback {
  id:        string;
  message:   string;
  status:    string;
  category?: string | null;
  rating?:   number | null;
  createdAt: string;
  project: {
    id:    string;
    name:  string;
    color: string;
  };
}

export interface TopProject {
  id:            string;
  name:          string;
  color:         string;
  totalFeedback: number;
  last30Days:    number;
}

export interface FeedbackTrendPoint {
  date:      string;
  label:     string;
  count:     number;
  resolved?: number;
}

export interface StatusDistributionItem {
  status: string;
  label:  string;
  color:  string;
  count:  number;
}

export interface CategoryDistributionItem {
  category: string;
  label:    string;
  color:    string;
  count:    number;
}

export interface DashboardProjectOption {
  id:    string;
  name:  string;
  color: string;
}

export interface DashboardData {
  stats:                 DashboardStats;
  recentProjects:        DashboardProject[];
  recentFeedback:        DashboardFeedback[];
  topProjects:           TopProject[];
  feedbackTrend?:        FeedbackTrendPoint[];
  statusDistribution?:   StatusDistributionItem[];
  categoryDistribution?: CategoryDistributionItem[];
  allProjects?:          DashboardProjectOption[];
}

export interface DashboardFilters {
  project?:   string;
  timeframe?: "7d" | "30d" | "90d";
}

export async function fetchDashboard(filters?: DashboardFilters): Promise<DashboardData> {
  const params = new URLSearchParams();
  if (filters?.project && filters.project !== "all") {
    params.set("project", filters.project);
  }
  if (filters?.timeframe) {
    params.set("timeframe", filters.timeframe);
  }
  const qs = params.toString();
  const url = qs ? `/api/dashboard?${qs}` : "/api/dashboard";
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load dashboard");
  return res.json();
}