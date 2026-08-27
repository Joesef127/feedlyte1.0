export const FEEDBACK_STATUSES = ["unreviewed", "reviewed", "resolved"] as const;
export const WIDGET_POSITIONS = ["bottom-right", "bottom-left"] as const;
export const DIGEST_FREQUENCIES = ["none", "daily"] as const;
export const NOTIFICATION_COOLDOWNS = ["none", "5min", "15min", "30min", "1hour"] as const;

export type Status         = (typeof FEEDBACK_STATUSES)[number];
export type Page           = "dashboard" | "projects" | "feedback" | "settings" | "profile";
export type ProjectDetailTab = "feedback" | "analytics" | "integrations" | "embed" | "settings";
export type WidgetPosition = (typeof WIDGET_POSITIONS)[number];
export type DigestFrequency = (typeof DIGEST_FREQUENCIES)[number];
export type NotificationCooldown = (typeof NOTIFICATION_COOLDOWNS)[number];

export interface Project {
  id:                      string;
  name:                    string;
  createdAt:               string;
  feedbackCount:           number;
  newCount:                number;
  color:                   string;
  position:                WidgetPosition;
  label:                   string;
  allowedOrigin?:          string | null;
  notifyOnSubmission?:     boolean;
  digestFrequency?:        DigestFrequency;
  timezone?:               string;          
  notificationCooldown?:   NotificationCooldown;
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

export type BannerState = "idle" | "sending" | "sent" | "error";


