"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";

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
      <h3 className="text-[14px] font-bold mb-4">Password</h3>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          props.changePassword();
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
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        <div className="relative">
          <FormField
            label="New"
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
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
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
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {props.passwordError && (
          <p className="text-xs text-destructive">
            {props.passwordError}
          </p>
        )}

        <div className="flex justify-end gap-2.5">
          <Button variant="secondary" onClick={props.resetPassword}>
            Clear
          </Button>

          <Button
            disabled={
              !props.isPasswordValid ||
              props.passwordState === "saving" ||
              props.updatePasswordIsPending
            }
          >
            {props.passwordState === "saving"
              ? "Updating..."
              : "Update"}
          </Button>
        </div>
      </form>
    </Card>
  );
}