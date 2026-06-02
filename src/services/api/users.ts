/**
 * Users API Service
 * Centralized API calls for user-related operations
 */

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  createdAt: string;
}

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

// ─── Fetch ───────────────────────────────────────────────────────────────────

/**
 * Fetch the current authenticated user
 */
export async function fetchCurrentUser(): Promise<User> {
  const res = await fetch("/api/users/me");
  if (!res.ok) {
    if (res.status === 401) throw new Error("Unauthorized");
    throw new Error("Failed to fetch user");
  }
  return res.json();
}

/**
 * Fetch a user by ID
 */
export async function fetchUser(id: string): Promise<User> {
  const res = await fetch(`/api/users/${id}`);
  if (!res.ok) {
    if (res.status === 404) throw new Error("User not found");
    throw new Error("Failed to fetch user");
  }
  return res.json();
}

// ─── Delete ──────────────────────────────────────────────────────────────────

/**
 * Delete user account (self-only - can only delete own account)
 */
export async function deleteAccount(id: string): Promise<{ message: string }> {
  const res = await fetch(`/api/users/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    if (res.status === 401) throw new Error("Unauthorized");
    if (res.status === 403) throw new Error("Cannot delete another user's account");
    const error = await res.json();
    throw new Error(error.error ?? "Failed to delete account");
  }

  return res.json();
}

// ─── Update ──────────────────────────────────────────────────────────────────

/**
 * Update current user's account details
 */
export async function updateProfile(
  payload: UpdateProfilePayload,
) {
  const res = await fetch("/api/users", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error ?? "Failed to update account");
  }

  return data;
}

/**
 * Change current user's password
 */
export async function updatePassword(
  payload: ChangePasswordPayload,
) {
  const res = await fetch("/api/users", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error ?? "Failed to update password");
  }

  return data;
}