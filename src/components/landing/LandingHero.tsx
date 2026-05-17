"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, ChevronDown } from "lucide-react";
import Link from "next/link";
import { ScreenshotParallax } from "./ScreenshotParallax";

export function LandingHero() {
  return (
    <div className="relative">
      {/* Cinematic Opening: The 'Decidr.' Breathing Section */}
      <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 text-center"
        >
          <motion.h1
            animate={{ 
              scale: [1, 1.02, 1],
              opacity: [0.9, 1, 0.9]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-8xl md:text-[12rem] font-black tracking-tighter text-white flex items-baseline justify-center"
          >
            Decidr<span className="text-brand-crimson">.</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-zinc-500 uppercase tracking-[0.5em] text-xs font-bold mt-4"
          >
            Project Intelligence
          </motion.p>
          
          {/* Subtle glow behind the logo */}
          <div className="absolute inset-0 bg-white/5 blur-[120px] rounded-full -z-10" />
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-500">Scroll Down</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ChevronDown className="h-4 w-4 text-zinc-600" />
          </motion.div>
        </motion.div>
      </section>

      {/* Strategic Reveal Section */}
      <section className="relative py-20 md:py-40 bg-black">
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-5xl mx-auto text-center mb-24">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2 className="text-5xl md:text-8xl lg:text-[10rem] font-black tracking-tighter text-white mb-12 leading-[0.9] uppercase">
                Clear <br /> Decisions.
              </h2>

              <p className="text-xl md:text-3xl text-zinc-300 mb-16 max-w-3xl mx-auto leading-relaxed font-medium">
                A simple platform for complex projects. 
                Keep your team aligned, track your evidence, and move forward with confidence.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                <Button size="lg" className="h-16 px-12 bg-white hover:bg-zinc-200 text-black font-black uppercase tracking-widest rounded-full transition-all hover:scale-105 shadow-2xl" asChild>
                  <Link href="/signup">
                    Get Started
                    <ArrowRight className="ml-3 h-5 w-5" />
                  </Link>
                </Button>
                <Link
                  href="#features"
                  className="text-sm font-bold uppercase tracking-[0.3em] text-zinc-400 hover:text-white transition-colors py-4"
                >
                  View Features
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Primary Product Anchor */}
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="relative w-full max-w-6xl mx-auto"
          >
            <ScreenshotParallax 
              src="/Screenshot 2026-05-13 183200.jpg" 
              alt="Decidr Dashboard" 
              className="w-full z-20 shadow-[0_50px_100px_rgba(0,0,0,0.9)] border-white/10"
              scale={1}
            />
            {/* Ambient Grounding Shadow */}
            <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[80%] h-40 bg-white/5 blur-[120px] rounded-full pointer-events-none" />
          </motion.div>
        </div>
      </section>
    </div>
  );
}

