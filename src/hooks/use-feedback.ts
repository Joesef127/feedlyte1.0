import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Feedback, Status } from "@/types";

const feedbackKey = (projectId?: string) =>
  projectId ? ["feedback", projectId] : ["feedback"];

// ── Fetch helpers ─────────────────────────────────────────────────────────────

async function fetchFeedback(
  projectId: string,
  filters?: { status?: string; q?: string }
): Promise<Feedback[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.q) params.set("q", filters.q);
  const qs = params.size ? `?${params.toString()}` : "";

  const res = await fetch(`/api/projects/${projectId}/feedback${qs}`);
  if (!res.ok) throw new Error("Failed to load feedback");
  return res.json();
}

async function updateFeedbackStatus(id: string, status: Status): Promise<void> {
  const res = await fetch(`/api/feedback/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update status");
}

async function deleteFeedback(id: string): Promise<void> {
  const res = await fetch(`/api/feedback/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete feedback");
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useFeedback(
  projectId: string,
  filters?: { status?: string; q?: string }
) {
  return useQuery({
    queryKey: [...feedbackKey(projectId), filters],
    queryFn: () => fetchFeedback(projectId, filters),
    enabled: !!projectId,
  });
}

export function useUpdateFeedbackStatus(projectId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Status }) =>
      updateFeedbackStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedbackKey(projectId) });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useDeleteFeedback(projectId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFeedback(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedbackKey(projectId) });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

// ── All-feedback hook (cross-project, authenticated) ──────────────────────────

async function fetchAllFeedback(filters?: {
  status?: string;
  q?: string;
}): Promise<Feedback[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.q) params.set("q", filters.q);
  const qs = params.size ? `?${params.toString()}` : "";

  const res = await fetch(`/api/feedback${qs}`);
  if (!res.ok) throw new Error("Failed to load feedback");
  return res.json();
}

export function useAllFeedback(filters?: { status?: string; q?: string }) {
  return useQuery({
    queryKey: ["feedback", "all", filters],
    queryFn: () => fetchAllFeedback(filters),
  });
}
