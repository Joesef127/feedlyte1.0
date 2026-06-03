"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as usersAPI from "@/services/api/users";
import { useRouter } from "next/navigation";

const CURRENT_USER_KEY = ["user", "current"] as const;
const USER_KEY = ["user"] as const;

export function useCurrentUser() {
  return useQuery({
    queryKey: CURRENT_USER_KEY,
    queryFn: usersAPI.fetchCurrentUser,
    retry: 1,
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: [...USER_KEY, id],
    queryFn: () => usersAPI.fetchUser(id),
    enabled: !!id,
  });
}

export function useUsers() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const updateProfileMutation = useMutation({
    mutationFn: usersAPI.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CURRENT_USER_KEY });
    }
  });

  const updatePasswordMutation = useMutation({
    mutationFn: usersAPI.updatePassword,
  });

  const deleteAccountMutation = useMutation({
    mutationFn: usersAPI.deleteAccount,
    onSuccess: () => {
      router.push("/");
    },
  });

  return {
    updateProfile: updateProfileMutation.mutateAsync,
    updateProfileIsPending: updateProfileMutation.isPending,
    updateProfileError: updateProfileMutation.error,

    updatePassword: updatePasswordMutation.mutateAsync,
    updatePasswordIsPending: updatePasswordMutation.isPending,
    updatePasswordError: updatePasswordMutation.error,

    deleteAccount: deleteAccountMutation.mutateAsync,
    deleteAccountIsPending: deleteAccountMutation.isPending,
    deleteAccountError: deleteAccountMutation.error,
  };
}

export function useDeleteAccount() {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: usersAPI.deleteAccount,
    onSuccess: () => {
      router.push("/");
    },
  });

  return {
    deleteAccount: mutation.mutateAsync,
    deleteAccountIsPending: mutation.isPending,
    deleteAccountError: mutation.error,
  };
}