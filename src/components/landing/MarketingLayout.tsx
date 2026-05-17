"use client";

import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { CinematicBackground } from "./CinematicBackground";
import { Logo } from "@/components/shared/Logo";
import Link from "next/link";

interface MarketingLayoutProps {
  children: ReactNode;
}

export function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="min-h-screen relative text-white selection:bg-brand-crimson/30 bg-black">
      <CinematicBackground />
      <Navbar />
      
      <main className="relative z-10 pt-32 pb-20">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-white/[0.05] relative z-10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-8">
              <Logo className="h-6" />
              <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-[0.3em] hidden sm:block">
                The Intelligence Operating System
              </p>
            </div>
            
            <div className="flex items-center gap-10">
              <div className="flex gap-8">
                {[
                  { name: "Intelligence", href: "/intelligence" },
                  { name: "Governance", href: "/governance" },
                  { name: "Privacy", href: "/privacy" }
                ].map((link) => (
                  <Link key={link.name} href={link.href} className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                ))}
              </div>
              
              <div className="h-4 w-[1px] bg-white/10 hidden md:block" />
              
              <p className="text-[11px] text-zinc-600 font-bold tracking-widest uppercase">
                &copy; {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
