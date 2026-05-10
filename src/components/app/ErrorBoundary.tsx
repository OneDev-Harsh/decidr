"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: React.ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-12 bg-white/5 border border-white/10 rounded-xl text-center">
          <div className="h-12 w-12 rounded-full bg-brand-crimson/10 flex items-center justify-center mb-4">
            <AlertTriangle className="h-6 w-6 text-brand-crimson" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            {this.props.fallbackTitle || "Something went wrong"}
          </h3>
          <p className="text-sm text-gray-400 max-w-md mb-6">
            An unexpected error occurred. You can try again or contact support if the issue persists.
          </p>
          {this.state.error && (
            <pre className="text-[10px] text-gray-600 font-mono mb-4 p-3 bg-black/40 rounded-lg border border-white/5 max-w-md overflow-x-auto">
              {this.state.error.message}
            </pre>
          )}
          <Button onClick={this.handleRetry} variant="outline" className="border-white/10">
            <RefreshCw className="mr-2 h-4 w-4" /> Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
