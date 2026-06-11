"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface PasswordCardProps {
  current: string;
  next: string;
  confirm: string;
  setCurrent: (v: string) => void;
  setNext: (v: string) => void;
  setConfirm: (v: string) => void;
  changePassword: () => Promise<void>;
  resetPassword: () => void;
  passwordState: "idle" | "saving" | "saved" | "error";
  passwordError: string;
  isPasswordValid: boolean;
  updatePasswordIsPending: boolean;
}

export function PasswordCard(props: PasswordCardProps) {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <Card>
      <h3 className="text-sm font-bold">Password</h3>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          props.changePassword();
          toast.success("Password changed");
        }}
        className="flex flex-col gap-3"
      >
        <div className="relative">
          <FormField
            label="Current"
            type={showCurrent ? "text" : "password"}
            value={props.current}
            onChange={props.setCurrent}
          />

          {props.current && (
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-8 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showCurrent ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        <div className="relative">
          <FormField
            label="Unreviewed"
            type={showNext ? "text" : "password"}
            value={props.next}
            onChange={props.setNext}
          />

          {props.next && (
            <button
              type="button"
              onClick={() => setShowNext(!showNext)}
              className="absolute right-3 top-8 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showNext ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        <div className="relative">
          <FormField
            label="Confirm"
            type={showConfirm ? "text" : "password"}
            value={props.confirm}
            onChange={props.setConfirm}
          />

          {props.confirm && (
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-8 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showConfirm ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {props.passwordError && (
          <p className="text-sm text-destructive">{props.passwordError}</p>
        )}

        <div className="flex justify-end gap-2.5">
          <Button
            type="button"
            variant="secondary"
            onClick={props.resetPassword}
          >
            Clear
          </Button>

          <Button
            type="submit"
            disabled={
              !props.isPasswordValid ||
              props.passwordState === "saving" ||
              props.updatePasswordIsPending
            }
          >
            {props.passwordState === "saving" ? "Updating..." : "Update"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
