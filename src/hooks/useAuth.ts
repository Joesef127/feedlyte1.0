/**
 * useAuth Hook
 * Custom hook for authentication operations using the auth service
 */

"use client";

import { useMutation } from "@tanstack/react-query";
import { signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import * as authAPI from "@/services/api/auth";

export interface UseAuthOptions {
  redirectTo?: string;
}

export function useAuth(options?: UseAuthOptions) {
  const router = useRouter();

  // ─── Register ────────────────────────────────────────────────────────────────

  const registerMutation = useMutation({
    mutationFn: authAPI.register,
    onSuccess: () => {
      // After successful registration, user should verify email
      // No automatic redirect - let the component handle the UX
    },
  });

  // ─── Login ────────────────────────────────────────────────────────────────────

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const result = await signIn("credentials", {
        email: credentials.email.toLowerCase(),
        password: credentials.password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error("Invalid email or password");
      }

      return result;
    },
    onSuccess: () => {
      router.push(options?.redirectTo ?? "/dashboard");
    },
  });

  // ─── Logout ───────────────────────────────────────────────────────────────────

  const logoutMutation = useMutation({
    mutationFn: () => signOut({ redirect: false }),
    onSuccess: () => {
      router.push("/");
    },
  });

  // ─── Password Reset ──────────────────────────────────────────────────────────

  const requestPasswordResetMutation = useMutation({
    mutationFn: authAPI.requestPasswordReset,
  });

  const resetPasswordMutation = useMutation({
    mutationFn: authAPI.resetPassword,
    onSuccess: () => {
      router.push("/auth?mode=login");
    },
  });

  // ─── Email Verification ──────────────────────────────────────────────────────

  const verifyEmailMutation = useMutation({
    mutationFn: authAPI.verifyEmail,
    onSuccess: () => {
      router.push("/dashboard");
    },
  });

  return {
    register: registerMutation.mutateAsync,
    registerIsPending: registerMutation.isPending,
    registerError: registerMutation.error,

    login: loginMutation.mutateAsync,
    loginIsPending: loginMutation.isPending,
    loginError: loginMutation.error,

    logout: logoutMutation.mutateAsync,
    logoutIsPending: logoutMutation.isPending,

    requestPasswordReset: requestPasswordResetMutation.mutateAsync,
    requestPasswordResetIsPending: requestPasswordResetMutation.isPending,
    requestPasswordResetError: requestPasswordResetMutation.error,

    resetPassword: resetPasswordMutation.mutateAsync,
    resetPasswordIsPending: resetPasswordMutation.isPending,
    resetPasswordError: resetPasswordMutation.error,

    verifyEmail: verifyEmailMutation.mutateAsync,
    verifyEmailIsPending: verifyEmailMutation.isPending,
    verifyEmailError: verifyEmailMutation.error,
  };
}
