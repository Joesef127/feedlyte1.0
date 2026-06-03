"use client";

import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export interface DangerCardProps {
  modal: boolean;
  setModal: (v: boolean) => void;
  input: string;
  setInput: (v: string) => void;
  confirmed: boolean;
  deleteUser: () => Promise<void>;
  dangerState: "idle" | "deleting" | "error";
  dangerError: string;
  deleteAccountIsPending: boolean;
}

export function DangerCard(props: DangerCardProps) {
  return (
    <>
      <Card className="border-destructive/30">
        <h3 className="text-[14px] font-bold text-destructive mb-1">
          Danger Zone
        </h3>

        <p className="text-sm text-muted-foreground mb-3">
          Delete account permanently
        </p>

        <Button onClick={() => props.setModal(true)} variant="destructive">
          Delete Account
        </Button>
      </Card>

      <Modal
        open={props.modal}
        onClose={() => props.setModal(false)}
        title="Delete Account"
      >
        <p className="text-sm mb-4">
          Type &quot;delete my account&quot;
        </p>

        <FormField
          value={props.input}
          onChange={props.setInput}
        />

        {props.dangerError && (
          <p className="text-xs text-destructive">
            {props.dangerError}
          </p>
        )}

        <div className="flex justify-end gap-2 mt-5">
          <Button
            variant="secondary"
            onClick={() => props.setModal(false)}
          >
            Cancel
          </Button>

          <Button
            variant="destructive"
            onClick={props.deleteUser}
            disabled={
              !props.confirmed ||
              props.dangerState === "deleting" ||
              props.deleteAccountIsPending
            }
          >
            {props.dangerState === "deleting"
              ? "Deleting..."
              : "Delete"}
          </Button>
        </div>
      </Modal>
    </>
  );
}