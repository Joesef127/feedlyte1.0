import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Status } from "@/types";
import * as feedbackAPI from "@/services/api/feedback";

const feedbackKey = (projectId?: string) =>
  projectId ? ["feedback", projectId] : ["feedback"];

export function useFeedback(
  projectId: string,
  filters?: { status?: string; q?: string }
) {
  return useQuery({
    queryKey: [...feedbackKey(projectId), filters],
    queryFn:  () => feedbackAPI.fetchFeedback(projectId, filters),
    enabled:  !!projectId,
  });
}

export function useFeedbackItem(id: string) {
  return useQuery({
    queryKey: ["feedback", "item", id],
    queryFn:  () => feedbackAPI.fetchFeedbackItem(id),
    enabled:  !!id,
  });
}

export function useUpdateFeedbackStatus(projectId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Status }) =>
      feedbackAPI.updateFeedbackStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: feedbackKey(projectId) });
      queryClient.invalidateQueries({ queryKey: ["feedback", "item", id] });
      queryClient.invalidateQueries({ queryKey: ["feedback", "all"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteFeedback(projectId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => feedbackAPI.deleteFeedback(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedbackKey(projectId) });
      queryClient.invalidateQueries({ queryKey: ["feedback", "all"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useAllFeedback(filters?: { status?: string; q?: string }) {
  return useQuery({
    queryKey: ["feedback", "all", filters],
    queryFn:  () => feedbackAPI.fetchAllFeedback(filters),
  });
}