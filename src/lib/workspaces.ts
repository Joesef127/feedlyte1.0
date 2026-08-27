import crypto from "node:crypto";

export type WorkspaceRole = "OWNER" | "ADMIN" | "ANALYST" | "CONTRIBUTOR" | "VIEWER";
export type MembershipStatus = "ACTIVE" | "INVITED" | "PENDING" | "REMOVED";

export function createWorkspaceMembership(userId: string, role: WorkspaceRole = "OWNER") {
  return {
    userId,
    role,
    status: "ACTIVE" as MembershipStatus,
  };
}

export function createInvitationToken(
  invitedBy: string,
  email: string,
  role: WorkspaceRole = "VIEWER",
  expiresInHours = 72,
) {
  const token = crypto.randomBytes(24).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

  return {
    invitedBy,
    email,
    role,
    token,
    tokenHash,
    expiresAt,
  };
}

export function isLastOwner(ownerIds: string[], targetUserId: string) {
  return ownerIds.length === 1 && ownerIds[0] === targetUserId;
}

export function canRemoveMember(targetUserId: string, ownerIds: string[], currentUserId: string) {
  if (targetUserId === currentUserId) return false;
  if (isLastOwner(ownerIds, targetUserId)) return false;
  return true;
}
