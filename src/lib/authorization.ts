import prisma from "@/lib/prisma";

export type MembershipRoleName =
  | "OWNER"
  | "ADMIN"
  | "ANALYST"
  | "CONTRIBUTOR"
  | "VIEWER";

export type PermissionName =
  | "manageWorkspace"
  | "manageProject"
  | "viewFeedback"
  | "changeFeedback"
  | "deleteProject"
  | "manageWebhooks"
  | "exportData"
  | "useAssistant";

export const permissionMatrix: Record<MembershipRoleName, Record<PermissionName, boolean>> = {
  OWNER: {
    manageWorkspace: true,
    manageProject: true,
    viewFeedback: true,
    changeFeedback: true,
    deleteProject: true,
    manageWebhooks: true,
    exportData: true,
    useAssistant: true,
  },
  ADMIN: {
    manageWorkspace: true,
    manageProject: true,
    viewFeedback: true,
    changeFeedback: true,
    deleteProject: false,
    manageWebhooks: true,
    exportData: true,
    useAssistant: true,
  },
  ANALYST: {
    manageWorkspace: false,
    manageProject: false,
    viewFeedback: true,
    changeFeedback: true,
    deleteProject: false,
    manageWebhooks: false,
    exportData: true,
    useAssistant: true,
  },
  CONTRIBUTOR: {
    manageWorkspace: false,
    manageProject: false,
    viewFeedback: true,
    changeFeedback: true,
    deleteProject: false,
    manageWebhooks: false,
    exportData: false,
    useAssistant: false,
  },
  VIEWER: {
    manageWorkspace: false,
    manageProject: false,
    viewFeedback: true,
    changeFeedback: false,
    deleteProject: false,
    manageWebhooks: false,
    exportData: false,
    useAssistant: false,
  },
};

export function permissionForRole(role: MembershipRoleName) {
  return permissionMatrix[role];
}

export function roleAllowsPermission(role: MembershipRoleName, permission: PermissionName) {
  return permissionForRole(role)[permission];
}

export async function getWorkspaceMembershipForUser(workspaceId: string, userId: string) {
  return prisma.membership.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
    include: { workspace: true },
  });
}

export async function requireWorkspaceAccess(workspaceId: string, userId: string) {
  const membership = await getWorkspaceMembershipForUser(workspaceId, userId);
  if (!membership || membership.status !== "ACTIVE") {
    return null;
  }

  return membership.workspace;
}

export async function requireProjectPermission(projectId: string, userId: string, permission: PermissionName) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { workspace: true },
  });

  if (!project) return null;
  if (!project.workspaceId) {
    return project.userId === userId ? project : null;
  }

  const membership = await getWorkspaceMembershipForUser(project.workspaceId, userId);
  if (!membership || membership.status !== "ACTIVE") return null;

  const role = membership.role as MembershipRoleName;
  return roleAllowsPermission(role, permission) ? project : null;
}

export async function requireFeedbackPermission(feedbackId: string, userId: string, permission: PermissionName) {
  const feedback = await prisma.feedback.findUnique({
    where: { id: feedbackId },
    include: { project: { include: { workspace: true } } },
  });

  if (!feedback) return null;
  if (!feedback.project.workspaceId) {
    return feedback.project.userId === userId ? feedback : null;
  }

  const membership = await getWorkspaceMembershipForUser(feedback.project.workspaceId, userId);
  if (!membership || membership.status !== "ACTIVE") return null;

  const role = membership.role as MembershipRoleName;
  return roleAllowsPermission(role, permission) ? feedback : null;
}
