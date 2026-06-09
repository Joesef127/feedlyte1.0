export interface DashboardStats {
  totalProjects:  number;
  totalFeedback:  number;
  unreviewed:     number;
  reviewed:       number;
  resolved:       number;
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

export interface DashboardData {
  stats:          DashboardStats;
  recentProjects: DashboardProject[];
  recentFeedback: DashboardFeedback[];
  topProjects:    TopProject[];
}

export async function fetchDashboard(): Promise<DashboardData> {
  const res = await fetch("/api/dashboard");
  if (!res.ok) throw new Error("Failed to load dashboard");
  return res.json();
}