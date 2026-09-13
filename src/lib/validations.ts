import { z } from "zod";
import {
  DIGEST_FREQUENCIES,
  FEEDBACK_CATEGORIES,
  FEEDBACK_STATUSES,
  NOTIFICATION_COOLDOWNS,
  WIDGET_CORNER_STYLES,
  WIDGET_LAUNCHER_ICONS,
  WIDGET_POSITIONS,
} from "@/types";

// ── Auth ──────────────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// ── Projects ─────────────────────────────────────────────────────────────────

const originSchema = z
  .string()
  .trim()
  .superRefine((value, context) => {
    try {
      const url = new URL(value);
      if (
        !["http:", "https:"].includes(url.protocol) ||
        url.username ||
        url.password ||
        url.pathname !== "/" ||
        url.search ||
        url.hash
      ) {
        context.addIssue({
          code: "custom",
          message: "Allowed origin must be an http or https origin without a path, query, fragment, or credentials",
        });
      }
    } catch {
      context.addIssue({
        code: "custom",
        message: "Allowed origin must be a valid URL",
      });
    }
  })
  .transform((value) => new URL(value).origin)
  .optional()
  .nullable();

export const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(80),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color")
    .optional()
    .default("#F59E0B"),
  position: z
    .enum(WIDGET_POSITIONS)
    .optional()
    .default("bottom-right"),
  label: z.string().max(30).optional().default("Feedback"),
  allowedOrigin: originSchema,
});

const cooldownSchema = z.enum(NOTIFICATION_COOLDOWNS);

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color")
    .optional(),
  position: z.enum(WIDGET_POSITIONS).optional(),
  label: z.string().max(30).optional(),
  allowedOrigin: originSchema,
  notifyOnSubmission: z.boolean().optional(),
  digestFrequency: z.enum(DIGEST_FREQUENCIES).optional(),
  notificationCooldown: cooldownSchema.optional(),
  timezone: z
    .string()
    .refine((tz) => {
      try {
        new Intl.DateTimeFormat("en-US", { timeZone: tz });
        return true;
      } catch {
        return false;
      }
    }, "Invalid IANA timezone")
    .optional(),
  categoryEnabled: z.boolean().optional(),
  ratingEnabled: z.boolean().optional(),
  technicalDetailsEnabled: z.boolean().optional(),
  launcherIcon: z.enum(WIDGET_LAUNCHER_ICONS).optional(),
  cornerStyle: z.enum(WIDGET_CORNER_STYLES).optional(),
  showBranding: z.boolean().optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

// ── Feedback ─────────────────────────────────────────────────────────────────

export const projectQuerySchema = z.object({
  project: z.string().min(1, "Project ID is required"),
});

export type ProjectQueryInput = z.infer<typeof projectQuerySchema>;

// Technical details are entirely client-selected (opt-in checkboxes) — keep the
// shape narrow and cap each value's length to avoid abuse via the public endpoint.
const technicalDetailsSchema = z
  .record(z.string().max(60), z.string().max(500))
  .refine((value) => Object.keys(value).length <= 12, "Too many technical detail fields")
  .optional();

export const submitFeedbackSchema = z.object({
  message: z.string().min(1, "Message is required").max(2000),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  pageUrl: z
    .string()
    .url("Invalid URL")
    .max(2048, "URL too long")
    .refine(
      (url) => /^https?:\/\//i.test(url),
      "Only http and https URLs are allowed",
    )
    .optional()
    .or(z.literal("")),
  userAgent: z.string().max(300).optional(),
  category: z.enum(FEEDBACK_CATEGORIES).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  technicalDetails: technicalDetailsSchema,
});

export type SubmitFeedbackInput = z.infer<typeof submitFeedbackSchema>;

export const updateStatusSchema = z.object({
  status: z.enum([...FEEDBACK_STATUSES, "reviewed"] as const).transform((val) =>
    val === "reviewed" ? ("in_review" as const) : val
  ),
});

export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
