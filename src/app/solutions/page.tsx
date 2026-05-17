"use client";

import { MarketingLayout } from "@/components/landing/MarketingLayout";
import { AtmosphericTopology, CinematicArchitectureBlock, IntelligenceNode } from "@/components/landing/CinematicUI";
import { motion } from "framer-motion";
import { 
  Building2, 
  Scale, 
  TrendingUp,
  AlertTriangle,
  GitBranch,
  Target
} from "lucide-react";

export default function SolutionsPage() {
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
              <div className="w-2 h-2 rounded-full bg-zinc-600" />
              <span className="text-[11px] font-medium tracking-widest uppercase text-zinc-400">Enterprise Deployments</span>
            </div>
            
            <h1 className="text-6xl md:text-[7rem] font-medium tracking-tight leading-[0.9] text-white">
              De-risk the <br />
              <span className="text-zinc-600">unpredictable.</span>
            </h1>

            <p className="text-xl md:text-2xl text-zinc-400 max-w-3xl font-serif leading-relaxed">
              Decidr is deployed in environments where information asymmetry is the primary risk vector. Explore how elite organizations use computational intelligence to navigate high-stakes scenarios.
            </p>
          </motion.div>
        </div>

        {/* 1. M&A Due Diligence */}
        <CinematicArchitectureBlock
          badge="Deployment 01 // Executive Strategy"
          title="M&A Due Diligence."
          description={
            <>
              <p>Acquisitions fail when optimistic models collide with operational reality. Decidr eliminates optimism bias by mathematically testing the target company's core assumptions against historical data.</p>
              <p>Ingest vast virtual data rooms (VDRs) instantly. The system will flag hidden liabilities, structural contradictions in their financial narrative, and integrate the risk profile directly into your valuation model.</p>
            </>
          }
          visuals={
            <div className="space-y-6">
              <IntelligenceNode icon={Building2} title="Data Room Ingestion" delay={0.1}>
                Parse thousands of legal contracts, financial spreadsheets, and HR records to build a complete topological map of the target organization.
              </IntelligenceNode>
              <IntelligenceNode icon={AlertTriangle} title="Liability Identification" delay={0.2} active>
                System Alert: Target's projected Q4 margin expansion relies on supplier contracts that expire in Q2. Confidence score degraded by 34%.
              </IntelligenceNode>
            </div>
          }
        />

        {/* 2. Regulatory Resilience */}
        <CinematicArchitectureBlock
          badge="Deployment 02 // Risk & Compliance"
          title="Regulatory Resilience."
          description={
            <>
              <p>When geopolitical shifts or sudden regulatory changes occur, the blast radius across a global organization is nearly impossible to track manually.</p>
              <p>Upload new compliance frameworks into Decidr to immediately visualize how they intersect with your existing product roadmap, data silos, and regional operating procedures.</p>
            </>
          }
          visuals={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                 <IntelligenceNode icon={Scale} title="Impact Surface Area Mapping" delay={0.1}>
                   Simulate the effect of a new data privacy law. Decidr highlights exactly which data pipelines and product features fall out of compliance instantly.
                 </IntelligenceNode>
              </div>
              <IntelligenceNode icon={GitBranch} title="Remediation Forking" delay={0.2}>
                Model multiple pathways to compliance, comparing the cost and timeline of each operational pivot.
              </IntelligenceNode>
              <IntelligenceNode icon={Target} title="Audit Readiness" delay={0.3}>
                Generate immutable reports proving that the remediation strategy was based on verified, timestamped evidence.
              </IntelligenceNode>
            </div>
          }
        />

        {/* 3. Operational Scaling */}
        <CinematicArchitectureBlock
          badge="Deployment 03 // Operations"
          title="High-Growth Scaling."
          description={
            <>
              <p>Hyper-growth breaks alignment. As teams scale rapidly, isolated silos form, resulting in conflicting objectives and wasted capital.</p>
              <p>Decidr acts as the central nervous system for organizational velocity. Ensure that a product pivot executed in engineering immediately updates the revenue expectations modeled by finance, automatically adjusting the hiring timeline managed by HR.</p>
            </>
          }
          visuals={
            <div className="space-y-6">
              <IntelligenceNode icon={TrendingUp} title="Cross-Functional Sync" delay={0.1}>
                Link engineering velocity directly to go-to-market readiness. If a critical feature is delayed, the system automatically alerts marketing to adjust launch spend.
              </IntelligenceNode>
              <div className="p-8 mt-6 rounded-2xl bg-zinc-900 border border-white/[0.05]">
                <div className="text-4xl font-medium text-white mb-2">Systematic Alignment</div>
                <p className="text-zinc-500 font-serif leading-relaxed">
                  Decidr doesn't just track tasks; it tracks the *logic* behind the tasks, ensuring the entire organization is operating on the same mathematical reality.
                </p>
              </div>
            </div>
          }
        />
        
        <div className="h-40" />
      </div>
    </MarketingLayout>
  );
}
