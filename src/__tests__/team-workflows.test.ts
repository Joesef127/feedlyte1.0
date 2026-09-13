import { describe, expect, it } from "vitest";
import {
  createWorkspaceMembership,
  createInvitationToken,
  isLastOwner,
  canRemoveMember,
} from "@/lib/workspaces";

describe("team workflow helpers", () => {
  it("creates an owner membership for a new workspace", () => {
    const membership = createWorkspaceMembership("user_1", "OWNER");

    expect(membership).toMatchObject({
      userId: "user_1",
      role: "OWNER",
      status: "ACTIVE",
    });
  });

  it("creates an invitation with an expiring hashed token", () => {
    const invitation = createInvitationToken("user_1", "member@example.com", "ADMIN", 72);

    expect(invitation.email).toBe("member@example.com");
    expect(invitation.role).toBe("ADMIN");
    expect(invitation.expiresAt.getTime()).toBeGreaterThan(Date.now());
    expect(invitation.tokenHash).toMatch(/^[a-f0-9]+$/i);
  });

  it("protects the last owner from removal or demotion", () => {
    expect(isLastOwner(["user_1"], "user_1")).toBe(true);
    expect(canRemoveMember("user_1", ["user_1"], "user_1")).toBe(false);
    expect(canRemoveMember("user_2", ["user_1", "user_2"], "user_1")).toBe(true);
  });
});
