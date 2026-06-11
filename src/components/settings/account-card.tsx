"use client";

import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface AccountCardProps {
  name: string;
  email: string;
  setName: (v: string) => void;
  setEmail: (v: string) => void;
  saveAccount: () => Promise<void>;
  resetAccount: () => void;
  accountState: "idle" | "saving" | "saved" | "error";
  accountError: string;
  isAccountDirty: boolean;
  updateProfileIsPending: boolean;
}

export function AccountCard(props: AccountCardProps) {
  return (
    <Card>
      <h3 className="text-sm font-bold">Account</h3>

      <div className="flex flex-col gap-3">
        <FormField label="Name" value={props.name} onChange={props.setName} />

        <FormField
          label="Email"
          value={props.email}
          onChange={props.setEmail}
        />

        {props.accountError && (
          <p className="text-sm text-destructive">{props.accountError}</p>
        )}

        {props.accountState === "saved" && (
          <p className="text-sm text-success">Saved</p>
        )}

        <div className="flex justify-end gap-2.5">
          <Button
            variant="secondary"
            onClick={props.resetAccount}
            disabled={!props.isAccountDirty}
          >
            Clear
          </Button>

          <Button
            onClick={async () => {
              await props.saveAccount();
              toast.success("Profile updated");
            }}
            disabled={
              !props.isAccountDirty ||
              props.accountState === "saving" ||
              props.updateProfileIsPending
            }
          >
            {props.accountState === "saving" ? "Saving..." : "Save"}
          </Button>        </div>
      </div>
    </Card>
  );
}
