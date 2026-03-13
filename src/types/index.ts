export type Status = "new" | "reviewed" | "resolved";
export type Page = "projects" | "feedback" | "settings";
export type ProjectDetailTab = "feedback" | "embed" | "settings";
export type WidgetPosition = "bottom-right" | "bottom-left";

export interface Project {
  id: string;
  name: string;
  apiKey: string;
  createdAt: string;
  feedbackCount: number;
  newCount: number;
  color: string;
  position: WidgetPosition;
  label: string;
}

export interface Feedback {
  id: string;
  projectId: string;
  message: string;
  email: string;
  pageUrl: string;
  userAgent: string;
  status: Status;
  createdAt: string;
}

export interface User {
  name: string;
  email: string;
  plan: string;
}
