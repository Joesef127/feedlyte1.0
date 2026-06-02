"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useCurrentUser, useUsers } from "@/hooks";

export function useSettings() {
  const { data: user } = useCurrentUser();
  const { update } = useSession();

  const {
    updateProfile,
    updateProfileIsPending,
    updatePassword,
    updatePasswordIsPending,
    deleteAccount,
    deleteAccountIsPending,
  } = useUsers();

  // ── Account state ─────────────────────────────

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [accountState, setAccountState] =
    useState<"idle" | "saving" | "saved" | "error">("idle");
  const [accountError, setAccountError] = useState("");

  useEffect(() => {
    if (!user) return;
    setName(user.name ?? "");
    setEmail(user.email ?? "");
  }, [user]);

  const saveAccount = async () => {
    setAccountError("");
    setAccountState("saving");

    try {
      const updated = await updateProfile({ name, email });

      await update({
        name: updated.name,
        email: updated.email,
      });

      setAccountState("saved");
      setTimeout(() => setAccountState("idle"), 2500);
    } catch (err) {
      setAccountError(
        err instanceof Error ? err.message : "Failed to update profile"
      );
      setAccountState("error");
    }
  };

  const resetAccount = () => {
    setName(user?.name ?? "");
    setEmail(user?.email ?? "");
    setAccountError("");
    setAccountState("idle");
  };

  const isAccountDirty =
    name !== (user?.name ?? "") || email !== (user?.email ?? "");

  // ── Password state ────────────────────────────

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [passwordState, setPasswordState] =
    useState<"idle" | "saving" | "saved" | "error">("idle");
  const [passwordError, setPasswordError] = useState("");

  const changePassword = async () => {
    setPasswordError("");

    if (!current || !next || !confirm) {
      setPasswordError("All fields required");
      return;
    }

    if (next !== confirm) {
      setPasswordError("Passwords do not match");
      return;
    }

    if (next.length < 8) {
      setPasswordError("Password too short");
      return;
    }

    setPasswordState("saving");

    try {
      await updatePassword({
        currentPassword: current,
        newPassword: next,
      });

      setCurrent("");
      setNext("");
      setConfirm("");

      setPasswordState("saved");
      setTimeout(() => setPasswordState("idle"), 2500);
    } catch (err) {
      setPasswordError(
        err instanceof Error ? err.message : "Failed to update password"
      );
      setPasswordState("error");
    }
  };

  const resetPassword = () => {
    setCurrent("");
    setNext("");
    setConfirm("");
    setPasswordError("");
    setPasswordState("idle");
  };

  const isPasswordValid =
    current.length > 0 &&
    next.length >= 8 &&
    confirm.length > 0 &&
    next === confirm;

  // ── Danger state ──────────────────────────────

  const [modal, setModal] = useState(false);
  const [input, setInput] = useState("");
  const [dangerState, setDangerState] =
    useState<"idle" | "deleting" | "error">("idle");
  const [dangerError, setDangerError] = useState("");

  const confirmed = input.toLowerCase() === "delete my account";

  const deleteUser = async () => {
    if (!confirmed || !user?.id) return;

    setDangerError("");
    setDangerState("deleting");

    try {
      await deleteAccount(user.id);
    } catch (err) {
      setDangerError(
        err instanceof Error ? err.message : "Failed to delete account"
      );
      setDangerState("error");
    }
  };

  return {
    // account
    name,
    email,
    setName,
    setEmail,
    saveAccount,
    resetAccount,
    accountState,
    accountError,
    isAccountDirty,
    updateProfileIsPending,

    // password
    current,
    next,
    confirm,
    setCurrent,
    setNext,
    setConfirm,
    changePassword,
    resetPassword,
    passwordState,
    passwordError,
    isPasswordValid,
    updatePasswordIsPending,

    // danger
    modal,
    setModal,
    input,
    setInput,
    confirmed,
    deleteUser,
    dangerState,
    dangerError,
    deleteAccountIsPending,
  };
}