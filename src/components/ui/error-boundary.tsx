"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryState {
  hasError:    boolean;
  error:       Error | null;
}

interface ErrorBoundaryProps {
  children:   React.ReactNode;
  fallback?:  React.ReactNode;
  context?:   string;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`[ErrorBoundary${this.props.context ? ` — ${this.props.context}` : ""}]`, error, info);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center mb-5">
            <AlertTriangle size={20} className="text-destructive" />
          </div>
          <h2 className="text-base font-bold text-foreground mb-2 tracking-tight">
            Something went wrong
          </h2>
          <p className="text-sm text-muted-foreground max-w-85 leading-relaxed mb-6">
            {this.state.error?.message ?? "An unexpected error occurred while rendering this page."}
          </p>
          <button
            onClick={this.reset}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors bg-transparent cursor-pointer"
          >
            <RefreshCw size={14} />
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}