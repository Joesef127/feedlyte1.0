export const FEEDBACK_STATUSES = [
  "unreviewed",
  "in_review",
  "accepted",
  "in_progress",
  "resolved",
  "not_feasible",
  "closed",
  "spam",
] as const;
export const WIDGET_POSITIONS = ["bottom-right", "bottom-left"] as const;
export const DIGEST_FREQUENCIES = ["none", "daily"] as const;
export const NOTIFICATION_COOLDOWNS = ["none", "5min", "15min", "30min", "1hour"] as const;
export const FEEDBACK_CATEGORIES = ["bug", "idea", "praise", "question"] as const;
export const WIDGET_LAUNCHER_ICONS = ["message-square", "bug", "lightbulb", "heart", "help-circle"] as const;
export const WIDGET_CORNER_STYLES = ["rounded", "sharp"] as const;

export type Status         = (typeof FEEDBACK_STATUSES)[number] | "reviewed";
export type Page           = "dashboard" | "projects" | "feedback" | "settings" | "profile";
export type ProjectDetailTab = "feedback" | "analytics" | "integrations" | "embed" | "settings";
export type WidgetPosition = (typeof WIDGET_POSITIONS)[number];
export type DigestFrequency = (typeof DIGEST_FREQUENCIES)[number];
export type NotificationCooldown = (typeof NOTIFICATION_COOLDOWNS)[number];
export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];
export type WidgetLauncherIcon = (typeof WIDGET_LAUNCHER_ICONS)[number];
export type WidgetCornerStyle = (typeof WIDGET_CORNER_STYLES)[number];

export interface Project {
  id:                      string;
  name:                    string;
  createdAt:               string;
  updatedAt?:              string;
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
  categoryEnabled?:         boolean;
  ratingEnabled?:           boolean;
  technicalDetailsEnabled?: boolean;
  launcherIcon?:            WidgetLauncherIcon;
  cornerStyle?:             WidgetCornerStyle;
  showBranding?:            boolean;
}

export interface Feedback {
  id:        string;
  projectId: string;
  message:   string;
  email:     string;
  pageUrl:   string;
  userAgent: string;
  status:    Status;
  category?:  FeedbackCategory | null;
  rating?:    number | null;
  technicalDetails?: Record<string, string> | null;
  createdAt: string;
  updatedAt?: string;
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


