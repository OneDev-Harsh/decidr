"use client";

import { MarketingLayout } from "@/components/landing/MarketingLayout";
import { AtmosphericTopology, CinematicArchitectureBlock, IntelligenceNode, VisualPulseLine } from "@/components/landing/CinematicUI";
import { motion } from "framer-motion";
import { 
  Network, 
  Cpu, 
  Workflow,
  Crosshair,
  Binary,
  Activity
} from "lucide-react";

export default function IntelligencePage() {
  return (
    <MarketingLayout>
      <div className="relative bg-black min-h-screen">
        <AtmosphericTopology />
        
        {/* Hero Header */}
        <div className="container mx-auto px-6 max-w-6xl relative z-10 pt-40 pb-20 border-l border-brand-crimson/20 pl-8 md:pl-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-10"
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-brand-crimson/5 border border-brand-crimson/20">
              <div className="w-2 h-2 rounded-full bg-brand-crimson animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.8)]" />
              <span className="text-[11px] font-medium tracking-widest uppercase text-brand-crimson">Computational Cognition Active</span>
            </div>
            
            <h1 className="text-6xl md:text-[7rem] font-medium tracking-tight leading-[0.9] text-white">
              Algorithmic <br />
              <span className="text-zinc-600">Synthesis.</span>
            </h1>

            <p className="text-xl md:text-2xl text-zinc-400 max-w-3xl font-serif leading-relaxed">
              Decidr does not rely on subjective intuition. We utilize multi-agent reasoning, contradiction propagation, and Monte Carlo simulations to mathematically quantify the probability of strategic success.
            </p>
          </motion.div>
        </div>

        {/* 1. Multi-Agent Reasoning */}
        <CinematicArchitectureBlock
          badge="Cognitive Layer 01"
          title="Parallel Reasoning Streams."
          description={
            <>
              <p>A single perspective is a vulnerability. When evaluating a critical strategic claim, Decidr deploys multiple specialized reasoning agents simultaneously.</p>
              <p>One agent models the financial viability, another cross-references historical market trends, and a third audits the logical consistency of the underlying evidence. They converge to form a highly resilient, pressure-tested conclusion.</p>
            </>
          }
          visuals={
            <div className="space-y-4">
              <IntelligenceNode icon={Network} title="Claim: Supply chain capacity supports a 2x product rollout." delay={0.1} />
              
              <div className="flex gap-4 px-8 relative">
                 <VisualPulseLine vertical delay={0} />
                 <VisualPulseLine vertical delay={0.2} />
                 <VisualPulseLine vertical delay={0.4} />
                 <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                 <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] text-center">
                    <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Agent: Finance</div>
                    <div className="text-emerald-500/70 text-sm font-medium">Viable</div>
                 </div>
                 <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] text-center">
                    <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Agent: Logistics</div>
                    <div className="text-brand-crimson text-sm font-medium font-bold">Failed</div>
                 </div>
                 <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] text-center">
                    <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Agent: Historical</div>
                    <div className="text-emerald-500/70 text-sm font-medium">Viable</div>
                 </div>
              </div>

              <IntelligenceNode icon={Crosshair} title="Synthesis: Claim Rejected" delay={0.5} active>
                Logistics constraint identified at Node 4 (European Distribution Hub). Rollout capacity capped at 1.4x.
              </IntelligenceNode>
            </div>
          }
        />

        {/* 2. Confidence Propagation */}
        <CinematicArchitectureBlock
          badge="Cognitive Layer 02"
          title="Confidence Propagation."
          description={
            <>
              <p>In a complex organization, everything is connected. When a single foundational assumption is degraded by new evidence, the structural integrity of the entire strategy shifts.</p>
              <p>Decidr mathematically cascades this loss of confidence through the topology graph, instantly flagging all downstream projects and objectives that are now at risk.</p>
            </>
          }
          visuals={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
              <div className="md:col-span-2">
                 <IntelligenceNode icon={Activity} title="Primary Assumption Degraded" delay={0.1} active>
                   New inflation data invalidates Q1 pricing models. Confidence reduced from 88% to 42%.
                 </IntelligenceNode>
              </div>
              <IntelligenceNode icon={Workflow} title="Dependent Node A" delay={0.2}>
                European Expansion Plan: Margin targets compromised.
              </IntelligenceNode>
              <IntelligenceNode icon={Workflow} title="Dependent Node B" delay={0.3}>
                Q2 Hiring Sprint: Budget allocation insufficient.
              </IntelligenceNode>
            </div>
          }
        />

        {/* 3. Future Branching */}
        <CinematicArchitectureBlock
          badge="Cognitive Layer 03"
          title="Future Branching."
          description={
            <>
              <p>The future is not a single path; it is a distribution of probabilities. Instead of committing to a rigid plan, Decidr allows you to construct and simulate multiple strategic timelines simultaneously.</p>
              <p>Test your operational resilience by injecting market volatility, delayed funding rounds, or aggressive competitor actions into the simulation engine.</p>
            </>
          }
          visuals={
            <div className="space-y-6">
              <IntelligenceNode icon={Binary} title="Monte Carlo Simulations (n=100,000)" delay={0.1}>
                Algorithmic stress-testing using historical volatility metrics to map the true surface area of risk.
              </IntelligenceNode>
              <div className="p-8 rounded-2xl bg-zinc-900 border border-white/[0.05]">
                 <div className="flex justify-between items-center mb-6">
                    <span className="text-zinc-400 font-medium">Timeline Convergence</span>
                    <span className="text-[10px] font-mono text-zinc-500 bg-black px-2 py-1">CALCULATING...</span>
                 </div>
                 <div className="space-y-3">
                    <div className="flex items-center gap-4">
                       <div className="w-16 text-right text-xs text-zinc-500 font-mono">Branch Alpha</div>
                       <div className="flex-1 h-2 bg-black rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500/50 w-[78%]" />
                       </div>
                       <div className="w-8 text-xs text-white">78%</div>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="w-16 text-right text-xs text-zinc-500 font-mono">Branch Beta</div>
                       <div className="flex-1 h-2 bg-black rounded-full overflow-hidden">
                          <div className="h-full bg-zinc-600 w-[42%]" />
                       </div>
                       <div className="w-8 text-xs text-zinc-400">42%</div>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="w-16 text-right text-xs text-brand-crimson font-mono">Branch Null</div>
                       <div className="flex-1 h-2 bg-black rounded-full overflow-hidden">
                          <div className="h-full bg-brand-crimson/80 w-[12%]" />
                       </div>
                       <div className="w-8 text-xs text-brand-crimson">12%</div>
                    </div>
                 </div>
              </div>
            </div>
          }
        />
        
        <div className="h-40" />
      </div>
    </MarketingLayout>
  );
}
