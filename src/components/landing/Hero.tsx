"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <div className="relative overflow-hidden bg-black py-24 sm:py-32">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-maroon/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-crimson/10 blur-[120px] rounded-full" />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
        <div className="mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-8"
          >
            <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium leading-6 text-brand-crimson ring-1 ring-inset ring-brand-maroon/20 bg-brand-maroon/5">
              <Sparkles className="mr-2 h-4 w-4" />
              <span>AI-Native Decision Intelligence</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl font-bold tracking-tight text-white sm:text-6xl"
          >
            Decide with <span className="text-brand-crimson">Absolute</span> Confidence.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg leading-8 text-gray-400"
          >
            Analyze complex scenarios, simulate outcomes, and generate actionable
            strategies with Decidr. The ultimate decision OS for business,
            career, and personal growth.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex items-center justify-center gap-x-6"
          >
            <Button size="lg" className="group" asChild>
              <Link href="/signup">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Link
              href="#features"
              className="text-sm font-semibold leading-6 text-white hover:text-brand-crimson transition-colors"
            >
              Learn how it works <span aria-hidden="true">→</span>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
