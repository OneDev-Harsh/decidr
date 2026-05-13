"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface OperationalIconProps {
  icon: LucideIcon;
  className?: string;
}

export function OperationalIcon({ icon: Icon, className = "" }: OperationalIconProps) {
  return (
    <div className={`relative flex items-center justify-center h-12 w-12 rounded-xl bg-white/[0.03] border border-white/10 ${className}`}>
      {/* The Actual Icon */}
      <Icon className="h-5 w-5 text-zinc-100 stroke-[1.5]" />
    </div>
  );
}
