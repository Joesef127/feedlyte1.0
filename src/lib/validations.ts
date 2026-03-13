import { z } from "zod";

// ── Auth ──────────────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

// ── Projects ─────────────────────────────────────────────────────────────────

export const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(80),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color")
    .optional()
    .default("#F59E0B"),
  position: z.enum(["bottom-right", "bottom-left"]).optional().default("bottom-right"),
  label: z.string().max(30).optional().default("Feedback"),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

// ── Feedback ─────────────────────────────────────────────────────────────────

export const submitFeedbackSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  message: z.string().min(1, "Message is required").max(2000),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  pageUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  userAgent: z.string().max(300).optional(),
});

export type SubmitFeedbackInput = z.infer<typeof submitFeedbackSchema>;

export const updateStatusSchema = z.object({
  status: z.enum(["new", "reviewed", "resolved"]),
});

export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
