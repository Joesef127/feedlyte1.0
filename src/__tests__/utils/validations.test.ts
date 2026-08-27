import { describe, expect, it } from "vitest";
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
});
