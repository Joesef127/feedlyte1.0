export type Status         = "unreviewed" | "reviewed" | "resolved";
export type Page           = "dashboard" | "projects" | "feedback" | "settings" | "profile";
export type ProjectDetailTab = "feedback" | "embed" | "settings";
export type WidgetPosition = "bottom-right" | "bottom-left";

export interface Project {
  id:            string;
  name:          string;
  createdAt:     string;
  feedbackCount: number;
  newCount:      number;
  color:         string;
  position:      WidgetPosition;
  label:         string;
  allowedOrigin?: string | null;
}

export interface Feedback {
  id:        string;
  projectId: string;
  message:   string;
  email:     string;
  pageUrl:   string;
  userAgent: string;
  status:    Status;
  createdAt: string;
}

export interface User {
  id?:        string;
  name:      string;
  email:     string;
  image?:    string | null;
  createdAt?: string;
  plan?: string;
}