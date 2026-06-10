import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Webhook {
  id:        string;
  projectId: string;
  url:       string;
  label:     string;
  secret:    string | null;
  enabled:   boolean;
  createdAt: string;
}

export interface WebhookDelivery {
  id:         string;
  success:    boolean;
  statusCode: number | null;
  error:      string | null;
  createdAt:  string;
}

// ── Fetchers ──────────────────────────────────────────────────────────────────

async function fetchWebhooks(projectId: string): Promise<Webhook[]> {
  const res = await fetch(`/api/projects/${projectId}/webhooks`);
  if (!res.ok) throw new Error("Failed to load webhooks");
  return res.json();
}

async function fetchDeliveries(webhookId: string): Promise<WebhookDelivery[]> {
  const res = await fetch(`/api/webhooks/${webhookId}/deliveries`);
  if (!res.ok) throw new Error("Failed to load deliveries");
  return res.json();
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useWebhooks(projectId: string) {
  return useQuery({
    queryKey: ["webhooks", projectId],
    queryFn:  () => fetchWebhooks(projectId),
    enabled:  !!projectId,
  });
}

export function useWebhookDeliveries(webhookId: string | null) {
  return useQuery({
    queryKey: ["webhook-deliveries", webhookId],
    queryFn:  () => fetchDeliveries(webhookId!),
    enabled:  !!webhookId,
  });
}

export function useCreateWebhook(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { url: string; label: string; secret?: string }) =>
      fetch(`/api/projects/${projectId}/webhooks`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(data),
      }).then((r) => r.ok ? r.json() : r.json().then((e) => Promise.reject(new Error(e.error)))),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["webhooks", projectId] }),
  });
}

export function useUpdateWebhook(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Pick<Webhook, "url" | "label" | "enabled">> }) =>
      fetch(`/api/webhooks/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(data),
      }).then((r) => r.ok ? r.json() : r.json().then((e) => Promise.reject(new Error(e.error)))),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["webhooks", projectId] }),
  });
}

export function useDeleteWebhook(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/webhooks/${id}`, { method: "DELETE" }).then((r) => {
        if (!r.ok && r.status !== 204) throw new Error("Failed to delete");
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["webhooks", projectId] }),
  });
}