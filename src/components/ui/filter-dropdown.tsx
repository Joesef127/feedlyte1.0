"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface FilterOption {
  id:    string;
  label: string;
  dot?:  string; // optional color dot (hex)
}

interface FilterDropdownProps {
  label:     string;
  options:   FilterOption[];
  value:     string;
  onChange:  (value: string) => void;
  allLabel?: string; // label for the "all" / default option
}

export function FilterDropdown({
  label,
  options,
  value,
  onChange,
  allLabel = "All",
}: FilterDropdownProps) {
  const [open, setOpen]   = useState(false);
  const ref               = useRef<HTMLDivElement>(null);

  const allOptions: FilterOption[] = [
    { id: "", label: allLabel },
    ...options,
  ];

  const selected = allOptions.find((o) => o.id === value) ?? allOptions[0];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={[
          "inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium",
          "transition-colors cursor-pointer whitespace-nowrap",
          open || value
            ? "border-primary bg-primary/10 text-primary"
            : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-border/80",
        ].join(" ")}
      >
        {selected.dot && (
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: selected.dot }}
          />
        )}
        <span>{value ? selected.label : label}</span>
        <ChevronDown
          size={13}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          className="absolute top-full mt-1.5 z-50 min-w-40 bg-card border border-border rounded-xl shadow-lg overflow-hidden py-1"
          style={{
            left: "auto",
            right: "auto",
          }}
        >

          {allOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => { onChange(option.id); setOpen(false); }}
              className={[
                "w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors cursor-pointer",
                option.id === value
                  ? "text-primary bg-primary/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent",
              ].join(" ")}
            >
              {option.dot && (
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: option.dot }}
                />
              )}
              <span className="flex-1">{option.label}</span>
              {option.id === value && (
                <Check size={13} className="text-primary shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}