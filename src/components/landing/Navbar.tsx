"use client";

import Link from "next/link";
import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function Navbar() {
  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 z-[100] w-full border-b border-white/[0.05] bg-black/40 backdrop-blur-2xl"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <Logo size="sm" />
            </Link>
          </div>
          
          <div className="hidden md:flex items-center gap-10">
            {[
              { name: "Platform", href: "#features" },
              { name: "Solutions", href: "#solutions" },
              { name: "Intelligence", href: "#intelligence" },
              { name: "Governance", href: "#governance" },
            ].map((item) => (
              <Link 
                key={item.name} 
                href={item.href} 
                className="text-[13px] font-bold uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-6">
            <Link href="/login" className="text-[13px] font-bold uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-colors">
              Sign in
            </Link>
            <Button size="sm" className="h-9 px-6 bg-white hover:bg-zinc-200 text-black font-bold rounded-full transition-all hover:scale-105" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

