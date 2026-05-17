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
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:opacity-80 transition-opacity flex items-center gap-6">
              <Logo size="sm" />
            </Link>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            {[
              { name: "Platform", href: "/platform" },
              { name: "Solutions", href: "/solutions" },
              { name: "Intelligence", href: "/intelligence" },
              { name: "Governance", href: "/governance" },
              { name: "Docs", href: "/docs" },
            ].map((item) => (
              <Link 
                key={item.name} 
                href={item.href}
                className="text-[11px] font-bold text-zinc-400 hover:text-white transition-colors uppercase tracking-[0.2em]"
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-6">
            <Link 
              href="/login"
              className="text-[11px] font-bold text-zinc-400 hover:text-white transition-colors uppercase tracking-widest"
            >
              Sign In
            </Link>
            <Link 
              href="/signup"
              className="px-6 py-2 bg-white text-black text-[11px] font-black uppercase tracking-widest rounded-full hover:bg-zinc-200 transition-all shadow-xl"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </motion.nav>
  );

