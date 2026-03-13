import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  type?: string;
  monospace?: boolean;
  className?: string;
  disabled?: boolean;
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  monospace,
  className,
  disabled,
}: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && <Label>{label}</Label>}
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={monospace ? "font-mono" : undefined}
      />
    </div>
  );
}

export { FormField };
