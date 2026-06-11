"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Zap,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import {
  useWebhooks,
  useWebhookDeliveries,
  useCreateWebhook,
  useUpdateWebhook,
  useDeleteWebhook,
  type Webhook,
} from "@/hooks/use-webhooks";
import { toast } from "sonner";

interface IntegrationsTabProps {
  projectId: string;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return "Just now";
}

// ── Delivery log for a single webhook ────────────────────────────────────────
function DeliveryLog({ webhookId }: { webhookId: string }) {
  const { data: deliveries = [], isLoading } = useWebhookDeliveries(webhookId);

  if (isLoading) {
    return (
      <p className="text-xs text-muted-foreground py-3">
        Loading deliveries...
      </p>
    );
  }

  if (!deliveries.length) {
    return (
      <p className="text-xs text-muted-foreground py-3">
        No deliveries yet. Deliveries appear here when feedback is submitted.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 mt-3">
      {deliveries.map((d) => (
        <div
          key={d.id}
          className="flex items-center gap-3 px-3 py-2 bg-background border border-border rounded-lg"
        >
          {d.success ? (
            <Check size={13} className="text-green-500 shrink-0" />
          ) : (
            <X size={13} className="text-destructive shrink-0" />
          )}
          <span
            className={[
              "text-xs font-semibold shrink-0",
              d.success ? "text-green-500" : "text-destructive",
            ].join(" ")}
          >
            {d.statusCode ?? "ERR"}
          </span>
          <span className="text-xs text-muted-foreground flex-1 truncate">
            {d.error ?? "OK"}
          </span>
          <span className="text-xs text-muted-foreground/40 shrink-0">
            {timeAgo(d.createdAt)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Single webhook row ────────────────────────────────────────────────────────
function WebhookRow({
  webhook,
  projectId,
}: {
  webhook: Webhook;
  projectId: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  const updateWebhook = useUpdateWebhook(projectId);
  const deleteWebhook = useDeleteWebhook(projectId);

  const toggleEnabled = () =>
    updateWebhook.mutate({
      id: webhook.id,
      data: { enabled: !webhook.enabled },
    });

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 py-3.5">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">
            {webhook.label}
          </p>
          <p className="text-xs text-muted-foreground/60 font-mono truncate mt-0.5">
            {webhook.url}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Enable/disable toggle */}
          <button
            onClick={toggleEnabled}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors bg-transparent border-none cursor-pointer"
          >
            {webhook.enabled ? (
              <ToggleRight size={18} className="text-primary" />
            ) : (
              <ToggleLeft size={18} />
            )}
            {webhook.enabled ? "Enabled" : "Disabled"}
          </button>

          {/* Delete */}
          <button
            onClick={() => setDeleteModal(true)}
            className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors bg-transparent border-none cursor-pointer"
          >
            <Trash2 size={13} />
          </button>

          {/* Expand delivery log */}
          <button
            onClick={() => setExpanded((e) => !e)}
            className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors bg-transparent border-none cursor-pointer"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Delivery log */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-3 mb-1">
            Recent Deliveries
          </p>
          <DeliveryLog webhookId={webhook.id} />
        </div>
      )}

      {/* Delete modal */}
      <Modal
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Delete Webhook"
      >
        <p className="text-sm text-secondary-foreground mb-6">
          This will permanently delete the webhook{" "}
          <strong className="text-foreground">{webhook.label}</strong> and all
          its delivery history. This cannot be undone.
        </p>
        {deleteWebhook.isError && (
          <p className="text-destructive text-sm mb-4">
            Failed to delete. Please try again.
          </p>
        )}
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={() => setDeleteModal(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              deleteWebhook
                .mutateAsync(webhook.id)
                .then(() => {
                  toast.success("Webhook deleted");
                  setDeleteModal(false);
                });
            }}
            disabled={deleteWebhook.isPending}
          >
            {deleteWebhook.isPending ? "Deleting..." : "Delete Webhook"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

// ── Main tab ──────────────────────────────────────────────────────────────────
export function IntegrationsTab({ projectId }: IntegrationsTabProps) {
  const { data: webhooks = [], isLoading } = useWebhooks(projectId);
  const createWebhook = useCreateWebhook(projectId);

  const [showModal, setShowModal] = useState(false);
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  const [secret, setSecret] = useState("");

  const resetForm = () => {
    setUrl("");
    setLabel("");
    setSecret("");
  };

  const handleCreate = async () => {
    if (!url.trim()) return;
    try {
      await createWebhook.mutateAsync({
        url: url.trim(),
        label: label.trim() || "My Webhook",
        secret: secret.trim() || undefined,
      });
      toast.success("Webhook added");
      setShowModal(false);
      resetForm();
    } catch {
      // error shown via createWebhook.isError
    }
  };

  return (
    <div className="flex flex-col gap-5 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground">Webhooks</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Receive a POST request when new feedback is submitted.
          </p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="gap-1.5"
          size="sm"
        >
          <Plus size={13} />
          Add Webhook
        </Button>
      </div>

      {/* Payload info */}
      <div className="bg-card border border-border rounded-xl px-4 py-3.5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
          Payload format
        </p>
        <pre className="text-xs text-muted-foreground font-mono leading-relaxed overflow-x-auto">{`{
  "event": "feedback.created",
  "feedback": {
    "id": "...",
    "projectId": "...",
    "message": "...",
    "email": "...",
    "pageUrl": "...",
    "status": "unreviewed",
    "createdAt": "..."
  }
}`}</pre>
        <p className="text-xs text-muted-foreground/60 mt-2">
          If a secret is set, each request includes an{" "}
          <code className="font-mono text-xs bg-accent px-1 py-0.5 rounded">
            X-Feedlyte-Signature
          </code>{" "}
          header (HMAC-SHA256 of the raw body).
        </p>
      </div>

      {/* Webhook list */}
      {isLoading ? (
        <p className="text-sm text-muted-foreground py-4">
          Loading webhooks...
        </p>
      ) : webhooks.length === 0 ? (
        <EmptyState
          icon={<Zap size={22} />}
          title="No webhooks yet"
          description="Add a webhook to get notified when new feedback arrives."
          action={
            <Button
              onClick={() => setShowModal(true)}
              className="gap-1.5"
              size="sm"
            >
              <Plus size={13} />
              Add your first webhook
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {webhooks.map((w) => (
            <WebhookRow key={w.id} webhook={w} projectId={projectId} />
          ))}
        </div>
      )}

      {/* Create modal */}
      <Modal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title="Add Webhook"
      >
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block mb-1.5">
              Endpoint URL
            </label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-site.com/webhook"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block mb-1.5">
              Label
            </label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="My Webhook"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block mb-1.5">
              Secret{" "}
              <span className="normal-case text-muted-foreground/50 tracking-normal">
                (optional)
              </span>
            </label>
            <input
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Used to sign the payload"
              type="password"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary transition-colors"
            />
          </div>

          {createWebhook.isError && (
            <p className="text-destructive text-sm">
              {(createWebhook.error as Error)?.message ??
                "Failed to create webhook."}
            </p>
          )}

          <div className="flex gap-2 justify-end mt-1">
            <Button
              variant="secondary"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!url.trim() || createWebhook.isPending}
            >
              {createWebhook.isPending ? "Adding..." : "Add Webhook"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
