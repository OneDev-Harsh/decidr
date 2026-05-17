"use client";

import { MarketingLayout } from "@/components/landing/MarketingLayout";
import { AtmosphericTopology, CinematicArchitectureBlock, IntelligenceNode, VisualPulseLine } from "@/components/landing/CinematicUI";
import { motion } from "framer-motion";
import { 
  Database,
  Network,
  Cpu,
  GitMerge,
  ShieldCheck,
  Lock,
  Layers,
  ArrowRight
} from "lucide-react";

export default function PlatformPage() {
  return (
    <MarketingLayout>
      <div className="relative bg-black min-h-screen">
        <AtmosphericTopology />
        
        {/* Hero Header */}
        <div className="container mx-auto px-6 max-w-6xl relative z-10 pt-40 pb-20 border-l border-white/[0.03] pl-8 md:pl-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-10"
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/[0.02] border border-white/[0.05]">
              <div className="w-2 h-2 rounded-full bg-brand-crimson animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
              <span className="text-[11px] font-medium tracking-widest uppercase text-zinc-400">System Blueprint v4.0</span>
            </div>
            
            <h1 className="text-6xl md:text-[7rem] font-medium tracking-tight leading-[0.9] text-white">
              The Architecture of <br />
              <span className="text-zinc-600">Strategic Certainty.</span>
            </h1>

            <p className="text-xl md:text-2xl text-zinc-400 max-w-3xl font-serif leading-relaxed">
              Decidr is a computational intelligence layer for your organization. It ingests your raw operational data, maps the underlying topology of your strategic assumptions, and algorithmically identifies risk before it materializes.
            </p>
          </motion.div>
        </div>

        {/* 1. Ecosystem Ingress */}
        <CinematicArchitectureBlock
          badge="Layer 01 // Data Ingress"
          title="Topological Knowledge Mapping."
          description={
            <>
              <p>Strategic risk hides in the gaps between disconnected documents. Decidr bridges these gaps by ingesting data from across your organization and mathematically modeling the relationships between disparate claims.</p>
              <p>Financial projections in a spreadsheet are instantly linked to the marketing assumptions in a presentation, creating a unified, queryable intelligence graph.</p>
            </>
          }
          visuals={
            <div className="space-y-6">
              <IntelligenceNode icon={Database} title="Secure Ingestion Pipeline" delay={0.1}>
                Connects directly to your Enterprise Data Rooms, Google Workspace, and internal S3 buckets. Data is encrypted in transit and mapped into isolated vector indices.
              </IntelligenceNode>
              <div className="flex justify-center h-8">
                 <VisualPulseLine vertical />
              </div>
              <IntelligenceNode icon={Network} title="Entity & Assertion Extraction" delay={0.2} active>
                The inference engine reads unstructured text and extracts definitive claims. "Q3 Revenue will grow 15%" is converted from a sentence into a trackable mathematical assertion.
              </IntelligenceNode>
            </div>
          }
        />

        {/* 2. Intelligence Engine */}
        <CinematicArchitectureBlock
          badge="Layer 02 // Core Compute"
          title="The Contradiction Engine."
          description={
            <>
              <p>Once your organizational knowledge is mapped, Decidr's intelligence engine constantly evaluates the integrity of the network.</p>
              <p>If a newly uploaded financial report contradicts a previously approved hiring plan, the system instantly flags the logical collision, propagating the degraded confidence score across all dependent strategic initiatives.</p>
            </>
          }
          visuals={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
              <IntelligenceNode icon={Cpu} title="Continuous Inference" delay={0.1}>
                Every new piece of evidence triggers a cascading re-evaluation of all dependent assumptions.
              </IntelligenceNode>
              <IntelligenceNode icon={GitMerge} title="Conflict Resolution" delay={0.2}>
                When contradictions arise, Decidr forces stakeholders to resolve the logical fork before a project can proceed.
              </IntelligenceNode>
              <div className="md:col-span-2">
                 <IntelligenceNode icon={Layers} title="Cascading Consequence Modeling" delay={0.3}>
                   Simulate the downstream effects of a failed assumption. If Supply Chain Vector B collapses, Decidr maps exactly which product launches and revenue targets are immediately compromised.
                 </IntelligenceNode>
              </div>
            </div>
          }
        />

        {/* 3. Governance */}
        <CinematicArchitectureBlock
          badge="Layer 03 // Immutable Governance"
          title="Boardroom-Grade Trust."
          description={
            <>
              <p>A decision is only as valuable as its auditability. Decidr ensures that every piece of evidence, every identified contradiction, and every final strategic choice is cryptographically recorded.</p>
              <p>Deploy multi-signature approval workflows to ensure critical strategic merges require explicit sign-off from authorized leadership.</p>
            </>
          }
          visuals={
            <div className="space-y-6">
              <div className="flex gap-6">
                <div className="flex-1">
                  <IntelligenceNode icon={ShieldCheck} title="Cryptographic Ledger" delay={0.1}>
                    An append-only timeline proving exactly what data was available when a decision was made.
                  </IntelligenceNode>
                </div>
                <div className="flex-1">
                  <IntelligenceNode icon={Lock} title="Zero-Trust Architecture" delay={0.2}>
                    Strict Role-Based Access Control integrated directly with your corporate SSO.
                  </IntelligenceNode>
                </div>
              </div>
              <div className="p-8 mt-6 rounded-2xl bg-gradient-to-r from-zinc-900/80 to-black border border-white/[0.05] flex items-center justify-between group cursor-pointer hover:border-brand-crimson/30 transition-colors">
                 <div>
                    <h4 className="text-white font-medium text-lg mb-1">Review Security Whitepaper</h4>
                    <p className="text-zinc-500 font-serif text-sm">Deep dive into our SOC 2 Type II compliance and encryption standards.</p>
                 </div>
                 <div className="w-10 h-10 rounded-full bg-white/[0.03] flex items-center justify-center group-hover:bg-brand-crimson/10 group-hover:text-brand-crimson transition-colors">
                    <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:text-brand-crimson" />
                 </div>
              </div>
            </div>
          }
        />
        
        {/* Footer padding */}
        <div className="h-40" />
      </div>
    </MarketingLayout>
  );
}
