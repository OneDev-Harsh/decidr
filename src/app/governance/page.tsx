"use client";

import { MarketingLayout } from "@/components/landing/MarketingLayout";
import { AtmosphericTopology, CinematicArchitectureBlock, IntelligenceNode } from "@/components/landing/CinematicUI";
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  Lock,
  History,
  Key,
  FileCheck,
  CheckCircle2,
  Users
} from "lucide-react";

export default function GovernancePage() {
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
              <ShieldCheck className="w-4 h-4 text-zinc-400" />
              <span className="text-[11px] font-medium tracking-widest uppercase text-zinc-400">Boardroom Integrity</span>
            </div>
            
            <h1 className="text-6xl md:text-[7rem] font-medium tracking-tight leading-[0.9] text-white">
              Immutable <br />
              <span className="text-zinc-600">Chain of Custody.</span>
            </h1>

            <p className="text-xl md:text-2xl text-zinc-400 max-w-3xl font-serif leading-relaxed">
              In highly regulated environments, the process of reaching a decision is as critical as the decision itself. Decidr provides absolute cryptographic traceability for every strategic move.
            </p>
          </motion.div>
        </div>

        {/* 1. Decision Lineage */}
        <CinematicArchitectureBlock
          badge="Integrity Layer 01"
          title="Cryptographic Traceability."
          description={
            <>
              <p>Decidr replaces fragmented email threads and untracked document edits with an immutable, append-only strategic ledger.</p>
              <p>Every time a document is ingested, an assumption is challenged, or a project is merged into the master timeline, the system generates a cryptographic hash, proving exactly what data was available and who authorized the action.</p>
            </>
          }
          visuals={
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-zinc-900/80 border border-white/[0.05]">
                 <div className="flex items-center gap-3 text-sm font-medium text-white mb-4">
                   <History className="h-4 w-4 text-zinc-500" />
                   Ledger Event: STRATEGIC_MERGE
                 </div>
                 <div className="space-y-2 font-mono text-xs text-zinc-500">
                    <div className="flex justify-between border-b border-white/[0.02] pb-2">
                      <span>TIMESTAMP:</span>
                      <span className="text-zinc-300">2026-05-17T14:32:01Z</span>
                    </div>
                    <div className="flex justify-between border-b border-white/[0.02] pb-2">
                      <span>AUTHOR:</span>
                      <span className="text-zinc-300">sarah.chen@enterprise.com</span>
                    </div>
                    <div className="flex justify-between pb-2">
                      <span>PAYLOAD_HASH:</span>
                      <span className="text-zinc-300">e3b0c44298fc1c149afbf4c...</span>
                    </div>
                 </div>
              </div>
              <IntelligenceNode icon={FileCheck} title="Evidence Binding" delay={0.2}>
                The final decision is permanently bound to the specific versions of the documents that supported it.
              </IntelligenceNode>
            </div>
          }
        />

        {/* 2. Approval Systems */}
        <CinematicArchitectureBlock
          badge="Integrity Layer 02"
          title="Multi-Signature Workflows."
          description={
            <>
              <p>Critical strategic pivots cannot be executed unilaterally. Decidr enforces strict governance guardrails directly into the software architecture.</p>
              <p>Configure custom quorum requirements for specific project tiers. A major M&A integration might require explicit cryptographic sign-off from the CFO, General Counsel, and Head of Operations before the strategic timeline can advance.</p>
            </>
          }
          visuals={
            <div className="p-8 rounded-2xl bg-black border border-white/[0.1] shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                 <Lock className="w-32 h-32" />
               </div>
               <div className="relative z-10 space-y-6">
                 <div>
                   <h4 className="text-lg font-medium text-white mb-1">Authorization Required</h4>
                   <p className="text-sm text-zinc-400 font-serif">Project Merge: Q3 Global Expansion</p>
                 </div>
                 <div className="space-y-3">
                   <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-brand-crimson/20 flex items-center justify-center">
                          <CheckCircle2 className="w-3 h-3 text-brand-crimson" />
                        </div>
                        <span className="text-sm text-zinc-300">Operations (Director)</span>
                      </div>
                      <span className="text-xs font-mono text-zinc-500">SIGNED</span>
                   </div>
                   <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-brand-crimson/30 shadow-[0_0_15px_rgba(220,38,38,0.1)]">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full border border-zinc-600 border-dashed flex items-center justify-center" />
                        <span className="text-sm text-white">Finance (CFO)</span>
                      </div>
                      <span className="text-xs font-mono text-brand-crimson animate-pulse">PENDING</span>
                   </div>
                 </div>
                 <button className="w-full py-3 rounded-lg bg-zinc-800 text-zinc-400 font-medium text-sm cursor-not-allowed">
                   Execute Merge (Awaiting Quorum)
                 </button>
               </div>
            </div>
          }
        />

        {/* 3. Compliance & Access */}
        <CinematicArchitectureBlock
          badge="Integrity Layer 03"
          title="Zero-Trust Architecture."
          description={
            <>
              <p>Decidr is built on a foundation of absolute security and operational isolation. We assume nothing and verify everything.</p>
              <p>Integrate seamlessly with your existing SAML/SSO provider. Manage granular, role-based access controls (RBAC) down to the individual document or simulation level, ensuring that sensitive strategic intelligence is completely compartmentalized.</p>
            </>
          }
          visuals={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <IntelligenceNode icon={Users} title="Role-Based Isolation" delay={0.1}>
                Define Admin, Contributor, and Auditor roles globally or per-project.
              </IntelligenceNode>
              <IntelligenceNode icon={Key} title="Enterprise SSO" delay={0.2}>
                Native integrations with Okta, Azure AD, and Google Workspace.
              </IntelligenceNode>
              <div className="md:col-span-2 p-6 rounded-2xl bg-zinc-900 border border-white/[0.05] flex justify-between items-center">
                 <span className="text-sm font-medium text-zinc-300">Encryption Standards</span>
                 <span className="text-xs font-mono text-zinc-500">AES-256 (Rest) / TLS 1.3 (Transit)</span>
              </div>
            </div>
          }
        />
        
        <div className="h-40" />
      </div>
    </MarketingLayout>
  );
}
