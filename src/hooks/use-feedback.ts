import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Status } from "@/types";
import * as feedbackAPI from "@/services/api/feedback";

const feedbackKey = (projectId?: string) =>
  projectId ? ["feedback", projectId] : ["feedback"];

export function useFeedback(
  projectId: string,
  filters?: { status?: string; q?: string; category?: string }
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

export function useAllFeedback(filters?: feedbackAPI.FeedbackFiltersQuery) {
  return useQuery({
    queryKey: ["feedback", "all", filters],
    queryFn:  () => feedbackAPI.fetchAllFeedback(filters),
  });
}

export function useUpdateFeedbackDetails() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      details,
    }: {
      id: string;
      details: {
        status?:       Status;
        tags?:         string[];
        assignedToId?: string | null;
      };
    }) => feedbackAPI.updateFeedbackDetails(id, details),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["feedback"] });
      queryClient.invalidateQueries({ queryKey: ["feedback", "item", id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useBulkFeedbackAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof feedbackAPI.bulkFeedbackAction>[0]) =>
      feedbackAPI.bulkFeedbackAction(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useFeedbackNotes(feedbackId: string) {
  return useQuery({
    queryKey: ["feedback", feedbackId, "notes"],
    queryFn:  () => feedbackAPI.fetchFeedbackNotes(feedbackId),
    enabled:  !!feedbackId,
  });
}

export function useAddFeedbackNote(feedbackId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => feedbackAPI.addFeedbackNote(feedbackId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback", feedbackId, "notes"] });
      queryClient.invalidateQueries({ queryKey: ["feedback", "item", feedbackId] });
      queryClient.invalidateQueries({ queryKey: ["feedback"] });
    },
  });
}

export function useDeleteFeedbackNote(feedbackId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (noteId: string) => feedbackAPI.deleteFeedbackNote(feedbackId, noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback", feedbackId, "notes"] });
      queryClient.invalidateQueries({ queryKey: ["feedback", "item", feedbackId] });
      queryClient.invalidateQueries({ queryKey: ["feedback"] });
    },
  });
}