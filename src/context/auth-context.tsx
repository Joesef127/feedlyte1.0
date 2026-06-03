/**
 * Auth Context
 * Provides authentication state and methods throughout the application
 */

"use client";

import { createContext, useContext, ReactNode, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useAuth } from "@/hooks/useAuth";
import type { Session } from "next-auth";
import type {
  RegisterPayload,
  RegisterResponse,
  PasswordResetPayload,
  PasswordResetTokenPayload,
  VerifyEmailPayload,
} from "@/services/api/auth";

export interface AuthContextType {
  // Session state
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Auth methods
  register: (data: RegisterPayload) => Promise<RegisterResponse>;
  login: (credentials: { email: string; password: string }) => Promise<unknown>;
  logout: () => Promise<unknown>;

  // Password recovery
  requestPasswordReset: (data: PasswordResetPayload) => Promise<{ message: string }>;
  resetPassword: (data: PasswordResetTokenPayload) => Promise<{ message: string }>;


  // Email verification
  verifyEmail: (token: VerifyEmailPayload["token"] | string) => Promise<{ message: string }>;

  // Loading states
  isRegisteringPending: boolean;
  isLoginPending: boolean;
  isLogoutPending: boolean;

  // Error states
  registerError: Error | null;
  loginError: Error | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { data: session, status } = useSession();
  const auth = useAuth();

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

  const handleRegister = useCallback(
    (data: { name: string; email: string; password: string }) => {
      return auth.register(data);
    },
    [auth]
  );

  const handleLogin = useCallback(
    (credentials: { email: string; password: string }) => {
      return auth.login(credentials);
    },
    [auth]
  );

  const handleLogout = useCallback(() => {
    return auth.logout();
  }, [auth]);

  const handleRequestPasswordReset = useCallback(
    (data: { email: string }) => {
      return auth.requestPasswordReset(data);
    },
    [auth]
  );

  const handleResetPassword = useCallback(
    (data: { token: string; password: string }) => {
      return auth.resetPassword(data);
    },
    [auth]
  );

  const handleVerifyEmail = useCallback(
    (token: string) => {
      return auth.verifyEmail(token);
    },
    [auth]
  );

  const value: AuthContextType = {
    session,
    isLoading,
    isAuthenticated,

    register: handleRegister,
    login: handleLogin,
    logout: handleLogout,

    requestPasswordReset: handleRequestPasswordReset,
    resetPassword: handleResetPassword,

    verifyEmail: handleVerifyEmail,

    isRegisteringPending: auth.registerIsPending,
    isLoginPending: auth.loginIsPending,
    isLogoutPending: auth.logoutIsPending,

    registerError: auth.registerError,
    loginError: auth.loginError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use auth context
 * Must be called within an AuthProvider
 */
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
