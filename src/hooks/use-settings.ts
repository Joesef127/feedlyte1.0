"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useCurrentUser, useUsers } from "@/hooks";

export function useSettings() {
  const { data: user } = useCurrentUser();
  const { update } = useSession();

  const accountSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const passwordSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (accountSaveTimerRef.current) clearTimeout(accountSaveTimerRef.current);
      if (passwordSaveTimerRef.current) clearTimeout(passwordSaveTimerRef.current);
    };
  }, []);

  const {
    updateProfile,
    updateProfileIsPending,
    updatePassword,
    updatePasswordIsPending,
    deleteAccount,
    deleteAccountIsPending,
  } = useUsers();

  // ── Account state ─────────────────────────────

  const [name,  setName]  = useState(user?.name  ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [accountState, setAccountState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [accountError, setAccountError] = useState("");

  useEffect(() => {
    if (user) {
      setName((prev) => (prev !== user.name ? user.name ?? "" : prev));
      setEmail((prev) => (prev !== user.email ? user.email ?? "" : prev));
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
  }, [user?.name, user?.email]);

  const saveAccount = async (): Promise<boolean> => {
    setAccountError("");
    setAccountState("saving");

    try {
      const updated = await updateProfile({ name, email });

      await update({
        name:  updated.name,
        email: updated.email,
      });

      setAccountState("saved");

      if (accountSaveTimerRef.current) clearTimeout(accountSaveTimerRef.current);
      accountSaveTimerRef.current = setTimeout(() => {
        setAccountState("idle");
      }, 2500);
      return true;
    } catch (err) {
      setAccountError(
        err instanceof Error ? err.message : "Failed to update profile"
      );
      setAccountState("error");
      return false;
    }
  };

  const resetAccount = () => {
    setName(user?.name   ?? "");
    setEmail(user?.email ?? "");
    setAccountError("");
    setAccountState("idle");
  };

  const isAccountDirty =
    name  !== (user?.name  ?? "") ||
    email !== (user?.email ?? "");

  // ── Password state ────────────────────────────

  const [current, setCurrent] = useState("");
  const [next,    setNext]    = useState("");
  const [confirm, setConfirm] = useState("");
  const [passwordState, setPasswordState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [passwordError, setPasswordError] = useState("");

  const changePassword = async (): Promise<boolean> => {
    setPasswordError("");

    if (!current || !next || !confirm) {
      setPasswordError("All fields required");
      return false;
    }
    if (next !== confirm) {
      setPasswordError("Passwords do not match");
      return false;
    }
    if (next.length < 8) {
      setPasswordError("Password too short");
      return false;
    }

    setPasswordState("saving");

    try {
      await updatePassword({ currentPassword: current, newPassword: next });

      setCurrent("");
      setNext("");
      setConfirm("");
      setPasswordState("saved");

      if (passwordSaveTimerRef.current) clearTimeout(passwordSaveTimerRef.current);
      passwordSaveTimerRef.current = setTimeout(() => {
        setPasswordState("idle");
      }, 2500);
      return true;
    } catch (err) {
      setPasswordError(
        err instanceof Error ? err.message : "Failed to update password"
      );
      setPasswordState("error");
      return false;
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

  const [modal,      setModal]      = useState(false);
  const [input,      setInput]      = useState("");
  const [dangerState, setDangerState] = useState<"idle" | "deleting" | "error">("idle");
  const [dangerError, setDangerError] = useState("");

  const confirmed = input.toLowerCase() === "delete my account";

  const deleteUser = async (): Promise<boolean> => {
    if (!confirmed || !user?.id) return false;

    setDangerError("");
    setDangerState("deleting");

    try {
      await deleteAccount(user.id);
      return true;
    } catch (err) {
      setDangerError(
        err instanceof Error ? err.message : "Failed to delete account"
      );
      setDangerState("error");
      return false;
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