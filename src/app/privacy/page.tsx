"use client";

import { MarketingLayout } from "@/components/landing/MarketingLayout";
import { motion } from "framer-motion";

export default function PrivacyPage() {
  return (
    <MarketingLayout>
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="mb-24">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-black tracking-tighter uppercase mb-12"
          >
            Privacy Policy<span className="text-brand-crimson">.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-zinc-400 font-medium leading-relaxed"
          >
            At Decidr, we understand that strategic intelligence is your most valuable asset. We are committed to maintaining the highest standards of data privacy and security.
          </motion.p>
        </div>

        <div className="prose prose-invert max-w-none space-y-16">
          <section className="space-y-6">
            <h2 className="text-3xl font-black uppercase tracking-tight text-white border-b border-white/10 pb-4">1. Data Ownership</h2>
            <p className="text-zinc-400 text-lg leading-relaxed font-medium">
              You retain absolute ownership of all intelligence, evidence, and strategic projects created within Decidr. We do not sell, share, or use your strategic data to train public models.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-3xl font-black uppercase tracking-tight text-white border-b border-white/10 pb-4">2. Security Standards</h2>
            <p className="text-zinc-400 text-lg leading-relaxed font-medium">
              All data is encrypted both at rest and in transit using enterprise-grade AES-256 and TLS 1.3 encryption. Our infrastructure is hosted on ISO 27001 and SOC 2 Type II compliant providers.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-3xl font-black uppercase tracking-tight text-white border-b border-white/10 pb-4">3. AI Privacy</h2>
            <p className="text-zinc-400 text-lg leading-relaxed font-medium">
              Our AI synthesis engine operates within your private workspace boundaries. We use isolated inference environments to ensure that your strategic logic remains strictly confidential and never leaks between organizations.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-3xl font-black uppercase tracking-tight text-white border-b border-white/10 pb-4">4. Access Controls</h2>
            <p className="text-zinc-400 text-lg leading-relaxed font-medium">
              Decidr provides fine-grained access controls, allowing administrators to restrict access to sensitive projects down to the individual user level. All access is logged and auditable.
            </p>
          </section>

          <section className="pt-12 border-t border-white/10">
            <p className="text-zinc-600 font-bold uppercase tracking-widest text-[10px]">
              Last Updated: May 16, 2026
            </p>
          </section>
        </div>
      </div>
    </MarketingLayout>
  );
}
