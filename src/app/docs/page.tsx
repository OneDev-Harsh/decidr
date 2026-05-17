"use client";

import { MarketingLayout } from "@/components/landing/MarketingLayout";
import { AtmosphericTopology, IntelligenceNode } from "@/components/landing/CinematicUI";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  Terminal, 
  Cpu, 
  ShieldCheck,
  Search,
  ArrowRight,
  GitMerge,
  Network
} from "lucide-react";

export default function DocsPage() {
  const categories = [
    {
      title: "System Architecture",
      icon: Network,
      links: [
        { name: "Topological Ingestion", description: "Configuring secure data transfer protocols and API endpoints." },
        { name: "Vector Indexing Engine", description: "Understanding the topological mapping and dimension sizing." }
      ]
    },
    {
      title: "Algorithmic Inference",
      icon: Cpu,
      links: [
        { name: "Contradiction Nullification", description: "Algorithm specifics for structural logic audits." },
        { name: "Confidence Propagation", description: "Mathematical weightings for the Bayesian network." }
      ]
    },
    {
      title: "Strategic Simulation",
      icon: GitMerge,
      links: [
        { name: "Monte Carlo Parameters", description: "Setting volatility parameters and iteration limits." },
        { name: "Timeline Forking", description: "Managing multi-branch consequence modeling." }
      ]
    }
  ];

  return (
    <MarketingLayout>
      <div className="relative bg-black min-h-screen">
        <AtmosphericTopology />
        
        <div className="container mx-auto px-6 max-w-7xl relative z-10 pt-32">
          <div className="flex flex-col lg:flex-row gap-12 md:gap-20">
            
            {/* Left Column: Command Navigation */}
            <aside className="hidden lg:block w-72 flex-shrink-0 sticky top-32 h-[calc(100vh-8rem)] overflow-y-auto pb-20">
              <div className="space-y-12 pr-6">
                
                {/* Command Search */}
                <div className="relative group">
                   <div className="absolute inset-0 bg-brand-crimson/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                   <div className="relative flex items-center gap-3 p-3 rounded-xl bg-zinc-900/60 border border-white/[0.05] group-hover:border-brand-crimson/30 transition-all">
                      <Search className="h-4 w-4 text-zinc-500" />
                      <input 
                        type="text" 
                        placeholder="Search protocols..." 
                        className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-zinc-600"
                      />
                      <div className="px-2 py-0.5 rounded bg-black border border-white/[0.05] text-[10px] font-medium text-zinc-500">⌘K</div>
                   </div>
                </div>

                <div className="space-y-8">
                  {categories.map((cat) => (
                    <div key={cat.title} className="space-y-4">
                      <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500">
                        <cat.icon className="h-3 w-3" />
                        {cat.title}
                      </div>
                      <div className="space-y-2 pl-4 border-l border-white/[0.03]">
                         {cat.links.map(link => (
                           <a key={link.name} href="#" className="block text-sm font-medium text-zinc-400 hover:text-white transition-colors py-1">
                             {link.name}
                           </a>
                         ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="pt-8 border-t border-white/[0.03] space-y-3">
                   <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500 mb-4">Core Resources</div>
                   <a href="#" className="flex items-center justify-between text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                      <span>API Reference</span>
                      <Terminal className="h-4 w-4 opacity-50" />
                   </a>
                   <a href="#" className="flex items-center justify-between text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                      <span>Governance Spec</span>
                      <ShieldCheck className="h-4 w-4 opacity-50" />
                   </a>
                </div>
              </div>
            </aside>

            {/* Right Column: Content */}
            <div className="flex-1 max-w-4xl space-y-16 pb-40 lg:pl-12 lg:border-l lg:border-white/[0.03]">
              
              {/* Docs Hero */}
              <header className="space-y-8 pt-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/[0.02] border border-white/[0.05]">
                    <BookOpen className="w-4 h-4 text-zinc-400" />
                    <span className="text-[11px] font-medium tracking-widest uppercase text-zinc-400">Operational Knowledge Center</span>
                  </div>
                  <h1 className="text-4xl md:text-6xl font-medium tracking-tight text-white leading-[1.1]">
                    System Architecture & <br />
                    <span className="text-zinc-600">Protocols.</span>
                  </h1>
                  <p className="text-lg text-zinc-400 font-serif leading-relaxed max-w-2xl">
                    Technical documentation and visual walkthroughs for configuring the Decidr intelligence layer within your organization.
                  </p>
                </motion.div>
              </header>

              {/* Visual Walkthrough Highlight */}
              <div className="p-8 rounded-2xl bg-zinc-900/40 border border-brand-crimson/20 relative overflow-hidden group cursor-pointer">
                 <div className="absolute inset-0 bg-gradient-to-br from-brand-crimson/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                 <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-1 space-y-4">
                       <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-crimson">Interactive Walkthrough</div>
                       <h3 className="text-2xl font-medium text-white">Configuring a Strategic Simulation</h3>
                       <p className="text-sm text-zinc-400 font-serif leading-relaxed">
                         Learn how to initialize a Monte Carlo simulation, define volatility parameters, and read the resulting probability matrix.
                       </p>
                       <div className="flex items-center gap-2 text-sm font-medium text-white pt-2 group-hover:text-brand-crimson transition-colors">
                         Begin Walkthrough <ArrowRight className="h-4 w-4" />
                       </div>
                    </div>
                    <div className="w-48 h-32 rounded-xl bg-black border border-white/[0.05] flex items-center justify-center relative overflow-hidden">
                       {/* Mock UI Graphic */}
                       <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-800 to-black opacity-50" />
                       <GitMerge className="h-10 w-10 text-zinc-600" />
                    </div>
                 </div>
              </div>

              {/* Core Protocols Grid */}
              <div className="space-y-6">
                 <h2 className="text-xl font-medium text-white mb-6">Critical Protocols</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {categories.flatMap(c => c.links).slice(0, 4).map((link, i) => (
                      <IntelligenceNode 
                        key={link.name}
                        title={link.name}
                        delay={i * 0.1}
                      >
                         <p className="mb-6">{link.description}</p>
                         <div className="flex items-center gap-2 text-xs font-medium text-zinc-400 group-hover:text-white transition-colors">
                           Read Protocol <ArrowRight className="h-3 w-3" />
                         </div>
                      </IntelligenceNode>
                    ))}
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}
