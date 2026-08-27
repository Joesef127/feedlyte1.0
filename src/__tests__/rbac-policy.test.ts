import { describe, expect, it, vi } from "vitest";
import {
  roleAllowsPermission,
  permissionForRole,
  requireWorkspaceAccess,
  requireProjectPermission,
  requireFeedbackPermission,
} from "@/lib/authorization";
import prisma from "@/lib/prisma";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  default: {
    workspace: { findFirst: vi.fn() },
    project: { findUnique: vi.fn() },
    feedback: { findUnique: vi.fn() },
    membership: { findUnique: vi.fn() },
  },
}));

describe("RBAC policy checks", () => {
  it("grants the expected permissions for each role", () => {
    expect(permissionForRole("OWNER")).toEqual({
      manageWorkspace: true,
      manageProject: true,
      viewFeedback: true,
      changeFeedback: true,
      deleteProject: true,
      manageWebhooks: true,
      exportData: true,
      useAssistant: true,
    });

    expect(permissionForRole("VIEWER")).toEqual({
      manageWorkspace: false,
      manageProject: false,
      viewFeedback: true,
      changeFeedback: false,
      deleteProject: false,
      manageWebhooks: false,
      exportData: false,
      useAssistant: false,
    });
  });

  it("checks role permission boundaries", () => {
    expect(roleAllowsPermission("ADMIN", "manageWorkspace")).toBe(true);
    expect(roleAllowsPermission("ANALYST", "deleteProject")).toBe(false);
    expect(roleAllowsPermission("CONTRIBUTOR", "changeFeedback")).toBe(true);
    expect(roleAllowsPermission("VIEWER", "manageWebhooks")).toBe(false);
  });

  it("allows access only for workspace members and required permissions", async () => {
    vi.mocked(prisma.membership.findUnique).mockResolvedValue({
      id: "m_1",
      workspaceId: "ws_1",
      userId: "user_1",
      role: "OWNER",
      status: "ACTIVE",
      createdAt: new Date(),
      updatedAt: new Date(),
      workspace: { id: "ws_1", name: "Acme", slug: "acme", ownerId: "user_1", createdAt: new Date(), updatedAt: new Date(), description: null },
    } as any);
    vi.mocked(prisma.project.findUnique).mockResolvedValue({
      id: "proj_1",
      name: "Website",
      userId: "user_1",
      workspaceId: "ws_1",
      color: "#000000",
      position: "bottom-right",
      label: "Feedback",
      allowedOrigin: null,
      notifyOnSubmission: false,
      digestFrequency: "none",
      timezone: "UTC",
      notificationCooldown: "15min",
      lastNotificationSent: null,
      unsubscribeToken: null,
      lastDigestSentAt: null,
      createdAt: new Date(),
      workspace: { id: "ws_1", name: "Acme", slug: "acme", ownerId: "user_1", createdAt: new Date(), updatedAt: new Date(), description: null },
    } as any);
    vi.mocked(prisma.feedback.findUnique).mockResolvedValue({
      id: "fb_1",
      projectId: "proj_1",
      message: "hello",
      email: null,
      pageUrl: "https://example.com",
      userAgent: "browser",
      status: "unreviewed",
      createdAt: new Date(),
      project: { id: "proj_1", name: "Website", userId: "user_1", workspaceId: "ws_1", color: "#000000", position: "bottom-right", label: "Feedback", allowedOrigin: null, notifyOnSubmission: false, digestFrequency: "none", timezone: "UTC", notificationCooldown: "15min", lastNotificationSent: null, unsubscribeToken: null, lastDigestSentAt: null, createdAt: new Date(), workspace: { id: "ws_1", name: "Acme", slug: "acme", ownerId: "user_1", createdAt: new Date(), updatedAt: new Date(), description: null } },
    } as any);

    const workspace = await requireWorkspaceAccess("ws_1", "user_1");
    expect(workspace?.id).toBe("ws_1");

    await expect(requireProjectPermission("proj_1", "user_1", "manageProject")).resolves.toMatchObject({ id: "proj_1" });
    await expect(requireFeedbackPermission("fb_1", "user_1", "changeFeedback")).resolves.toMatchObject({ id: "fb_1" });
  });
});
