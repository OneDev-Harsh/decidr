"use client";

import { AuthAtmosphere } from "@/components/auth/AuthAtmosphere";
import { AuthLogoHero } from "@/components/auth/AuthLogoHero";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black flex flex-col md:flex-row overflow-hidden relative">
      {/* Cinematic Left / Background Panel */}
      <div className="relative flex-1 hidden md:flex items-center justify-center p-12 overflow-hidden border-r border-white/5">
        <AuthAtmosphere />
        
        <div className="relative z-10 max-w-lg text-center">
          <AuthLogoHero />
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 1 }}
            className="mt-12 space-y-6"
          >
            <p className="text-zinc-400 text-sm font-medium leading-relaxed tracking-wide">
              Welcome to Decidr. Our intelligence operating system empowers organizations to navigate complex decision topologies with cinematic clarity and mathematical precision.
            </p>
            
            <div className="flex items-center justify-center gap-8 pt-8 opacity-40">
              <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2">Systems</span>
                <div className="w-1 h-1 bg-brand-crimson rounded-full" />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2">Security</span>
                <div className="w-1 h-1 bg-brand-crimson rounded-full" />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2">Audit</span>
                <div className="w-1 h-1 bg-brand-crimson rounded-full" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Auth Interface Panel (Right Side) */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 bg-black relative z-20">
        {/* Mobile Logo (only visible on small screens) */}
        <div className="md:hidden mb-12">
          <AuthLogoHero />
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          {children}
        </motion.div>

        {/* Footer Attribution */}
        <div className="absolute bottom-8 text-[10px] uppercase tracking-[0.3em] text-zinc-600 font-medium">
          Decidr Operational Security v2.0
        </div>
      </main>

      {/* Global Background Glow for Mobile */}
      <div className="md:hidden absolute inset-0 -z-10 overflow-hidden">
        <AuthAtmosphere />
      </div>
    </div>
  );
}
