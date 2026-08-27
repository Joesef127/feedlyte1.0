import { describe, expect, it } from "vitest";
import type { Feedback, Project } from "@/types";
import {
  createProjectSchema,
  updateProjectSchema,
  updateStatusSchema,
} from "@/lib/validations";

describe("shared validation contracts", () => {
  it("accepts the shared project and feedback values", () => {
    expect(
      createProjectSchema.safeParse({
        name: "Acme",
        position: "bottom-left",
      }).success,
    ).toBe(true);

    expect(
      updateProjectSchema.safeParse({
        digestFrequency: "daily",
        notificationCooldown: "15min",
      }).success,
    ).toBe(true);

    expect(updateStatusSchema.safeParse({ status: "resolved" }).success).toBe(
      true,
    );
  });

  it("rejects values outside the centralized contracts", () => {
    expect(
      updateProjectSchema.safeParse({ notificationCooldown: "2hours" })
        .success,
    ).toBe(false);
    expect(updateStatusSchema.safeParse({ status: "pending" }).success).toBe(
      false,
    );
  });

  it("normalizes a configured origin and rejects non-origin URL parts", () => {
    expect(
      createProjectSchema.parse({
        name: "Acme",
        allowedOrigin: "HTTPS://Example.COM:443/",
      }).allowedOrigin,
    ).toBe("https://example.com");
    expect(
      createProjectSchema.safeParse({
        name: "Acme",
        allowedOrigin: "https://example.com/embed?preview=true",
      }).success,
    ).toBe(false);
  });

  it("keeps update timestamps on the typed project and feedback contract", () => {
    const project: Project = {
      id: "proj_123",
      name: "Acme",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-02T00:00:00.000Z",
      feedbackCount: 1,
      newCount: 1,
      color: "#F59E0B",
      position: "bottom-right",
      label: "Feedback",
      allowedOrigin: "https://example.com",
      notifyOnSubmission: true,
      digestFrequency: "daily",
      timezone: "UTC",
      notificationCooldown: "15min",
    };

    const feedback: Feedback = {
      id: "fb_123",
      projectId: project.id,
      message: "The widget is visible",
      email: "hello@example.com",
      pageUrl: "https://example.com",
      userAgent: "vitest",
      status: "unreviewed",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-02T00:00:00.000Z",
    };

    expect(project.updatedAt).toBeTruthy();
    expect(feedback.updatedAt).toBeTruthy();
  });
});
