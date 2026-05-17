"use client";

import { motion } from "framer-motion";
import { Logo } from "@/components/shared/Logo";

export function AuthLogoHero() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex flex-col items-center"
    >
      {/* Background Pulse Glow */}
      <motion.div 
        className="absolute inset-0 bg-brand-crimson/10 blur-[40px] rounded-full -z-10"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <Logo size="lg" />
      
      <div className="mt-6 flex flex-col items-center">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: "40px" }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="h-px bg-zinc-700"
        />
        <motion.span 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-4 text-[11px] uppercase tracking-[0.4em] font-medium text-zinc-500"
        >
          Operational Intelligence
        </motion.span>
      </div>
    </motion.div>
  );
}
