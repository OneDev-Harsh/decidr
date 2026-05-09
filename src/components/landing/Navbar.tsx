"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function Navbar() {
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-black/50 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded bg-brand-maroon flex items-center justify-center">
                <span className="text-white font-bold">D</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-white">Decidr</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
              Features
            </Link>
            <Link href="#solutions" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
              Solutions
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
              Pricing
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
              Sign in
            </Link>
            <Button size="sm" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
