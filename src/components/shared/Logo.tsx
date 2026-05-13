import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className, iconOnly = false, size = "md" }: LogoProps) {
  const sizes = {
    sm: {
      container: "h-6 w-6 text-xs",
      text: "text-[14px]",
      gap: "gap-2"
    },
    md: {
      container: "h-8 w-8 text-sm",
      text: "text-xl",
      gap: "gap-2.5"
    },
    lg: {
      container: "h-10 w-10 text-base",
      text: "text-2xl",
      gap: "gap-3"
    }
  };

  const currentSize = sizes[size];

  const logoIcon = (
    <div className={cn(
      "relative flex items-center justify-center rounded-lg font-bold shrink-0 overflow-hidden",
      "bg-black border border-zinc-800",
      currentSize.container,
      "group-hover:border-zinc-700 transition-colors"
    )}>
      {/* Background Zinc gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/50 to-transparent opacity-50" />
      
      {/* The letter D */}
      <span className="relative z-10 text-zinc-100 font-black">D</span>
      
      {/* The "Pinch" of Crimson - A small accent dot or line */}
      <div className="absolute top-1.5 right-1.5 h-1 w-1 rounded-full bg-brand-crimson animate-pulse shadow-[0_0_8px_rgba(220,20,60,0.6)]" />
      
      {/* Subtle bottom highlight */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-crimson/30 to-transparent" />
    </div>
  );

  if (iconOnly) return logoIcon;

  return (
    <div className={cn("flex items-center group", currentSize.gap, className)}>
      {logoIcon}
      <span className={cn(
        "font-bold tracking-tight text-white group-hover:text-zinc-200 transition-colors",
        currentSize.text
      )}>
        Decidr<span className="text-brand-crimson">.</span>
      </span>
    </div>
  );
}
