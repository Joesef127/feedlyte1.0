import { z } from "zod";

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
  .url("Allowed origin must be a valid URL")
  .regex(/^https?:\/\//, "Origin must start with http:// or https://")
  .transform((val) => val.replace(/\/$/, ""))
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
    .enum(["bottom-right", "bottom-left"])
    .optional()
    .default("bottom-right"),
  label: z.string().max(30).optional().default("Feedback"),
  allowedOrigin: originSchema,
});

const cooldownSchema = z.enum(["none", "5min", "15min", "30min", "1hour"]);

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color")
    .optional(),
  position: z.enum(["bottom-right", "bottom-left"]).optional(),
  label: z.string().max(30).optional(),
  allowedOrigin: originSchema,
  notifyOnSubmission: z.boolean().optional(),
  digestFrequency: z.enum(["none", "daily"]).optional(),
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
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

// ── Feedback ─────────────────────────────────────────────────────────────────

export const projectQuerySchema = z.object({
  project: z.string().min(1, "Project ID is required"),
});

export type ProjectQueryInput = z.infer<typeof projectQuerySchema>;

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
});

export type SubmitFeedbackInput = z.infer<typeof submitFeedbackSchema>;

export const updateStatusSchema = z.object({
  status: z.enum(["unreviewed", "reviewed", "resolved"]),
});

export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
