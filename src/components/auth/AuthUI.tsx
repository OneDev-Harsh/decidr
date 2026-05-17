"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function AuthInput({ label, id, ...props }: AuthInputProps) {
  return (
    <div className="space-y-2 group">
      <label 
        htmlFor={id} 
        className="text-[11px] uppercase tracking-widest font-bold text-zinc-500 group-focus-within:text-brand-crimson transition-colors duration-300"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          className="w-full bg-zinc-900/50 border border-white/5 rounded-lg px-4 py-3 text-white text-sm placeholder:text-zinc-700 outline-none focus:border-brand-crimson/50 focus:ring-1 focus:ring-brand-crimson/20 transition-all duration-300"
          {...props}
        />
        <div className="absolute inset-0 rounded-lg pointer-events-none border border-white/5 group-hover:border-white/10 group-focus-within:border-brand-crimson/30 transition-colors" />
      </div>
    </div>
  );
}

interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: "primary" | "secondary";
}

export function AuthButton({ children, loading, variant = "primary", ...props }: AuthButtonProps) {
  const isPrimary = variant === "primary";
  
  return (
    <button
      className={`relative w-full overflow-hidden rounded-lg px-6 py-3.5 font-bold text-sm tracking-widest uppercase transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 ${
        isPrimary 
          ? "bg-white text-black hover:bg-zinc-200" 
          : "bg-transparent text-white border border-white/10 hover:bg-white/5"
      }`}
      disabled={loading || props.disabled}
      {...props}
    >
      <div className="flex items-center justify-center gap-3">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        <span className="relative z-10">{children}</span>
      </div>
      
      {/* Premium Shimmer Effect for Primary */}
      {isPrimary && !loading && (
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent -translate-x-full"
          animate={{ x: ["100%", "-100%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      )}
    </button>
  );
}
