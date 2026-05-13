"use client";

import { GitMerge } from "lucide-react";

interface ScenariosProps {
  project: any;
  scenarios: any[];
}

export function Scenarios({ project, scenarios }: ScenariosProps) {
  if (!scenarios || scenarios.length === 0) return null;

  return (
    <div className="p-[30mm] print:break-after-page min-h-[297mm] bg-white text-black flex flex-col relative overflow-hidden">
      {/* Structural Background Accents */}
      <div className="absolute top-0 right-0 w-[40%] h-[1px] bg-zinc-100" />
      
      {/* Editorial Header */}
      <div className="mb-20">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-1 w-10 bg-black" />
          <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-[0.3em]">Section 04 — Strategic Simulation</span>
        </div>
        <h2 className="text-4xl font-extrabold tracking-tight uppercase mb-3">Outcome Modeling Matrix</h2>
        <p className="text-[12px] font-bold text-zinc-500 uppercase tracking-widest">Multi-Agent Stress Testing & Probabilistic Impact Analysis</p>
      </div>

      <div className="flex-1 space-y-24">
        {scenarios.map((scenario, index) => (
          <section key={index} className="space-y-12 group">
            {/* Scenario Header - Tactical & Clean */}
            <div className="flex justify-between items-start border-b border-zinc-100 pb-5 transition-colors group-hover:border-zinc-200">
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="px-2 py-0.5 bg-black text-white rounded-sm">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest">Model {index+1}</span>
                  </div>
                  <div className={`px-2 py-0.5 border rounded-sm ${
                    scenario.riskLevel === 'High' ? 'bg-brand-crimson/5 border-brand-crimson/10 text-brand-crimson' :
                    scenario.riskLevel === 'Medium' ? 'bg-zinc-50 border-zinc-200 text-black' :
                    'bg-zinc-50 text-zinc-400 border-zinc-100'
                  }`}>
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest">{scenario.riskLevel} Risk</span>
                  </div>
                </div>
                <h3 className="text-[28px] font-extrabold tracking-tight uppercase">{scenario.title}</h3>
              </div>
              
              {scenario.probability !== undefined && (
                <div className="text-right">
                  <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest block mb-1">Probability</span>
                  <div className="flex items-baseline justify-end gap-1">
                    <span className="text-[24px] font-extrabold tracking-tighter">{scenario.probability}</span>
                    <span className="text-[12px] font-bold text-zinc-300 font-mono">%</span>
                  </div>
                </div>
              )}
            </div>
            
            <p className="text-[18px] text-zinc-700 leading-relaxed font-medium tracking-tight max-w-[90%]">
              {scenario.description}
            </p>

            {/* Pros/Cons Grid - High Precision */}
            <div className="grid grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-zinc-50 pb-2">
                  <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-[0.2em]">Strategic Upside</span>
                </div>
                <ul className="space-y-4">
                  {scenario.pros?.map((pro: string, i: number) => (
                    <li key={i} className="flex gap-4 group/item">
                      <div className="h-1.5 w-1.5 rounded-full bg-black mt-2 shrink-0 opacity-20 group-hover/item:opacity-100 transition-opacity" />
                      <p className="text-[14px] text-zinc-700 leading-relaxed font-medium">{pro}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-zinc-50 pb-2">
                  <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-[0.2em]">Critical Friction</span>
                </div>
                <ul className="space-y-4">
                  {scenario.cons?.map((con: string, i: number) => (
                    <li key={i} className="flex gap-4 group/item">
                      <div className="h-1.5 w-1.5 rounded-full bg-brand-crimson mt-2 shrink-0 opacity-20 group-hover/item:opacity-100 transition-opacity" />
                      <p className="text-[14px] text-zinc-700 leading-relaxed font-medium">{con}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Impact Metrics - Analytical & Premium */}
            {scenario.scores && (
              <div className="p-10 bg-zinc-50/50 border border-zinc-100 rounded-sm">
                <div className="flex items-center gap-2 mb-8">
                  <GitMerge className="h-3.5 w-3.5 text-zinc-400" />
                  <span className="text-[9px] font-mono font-bold text-black uppercase tracking-[0.2em]">Operational Impact Matrix</span>
                </div>
                <div className="grid grid-cols-2 gap-x-20 gap-y-8">
                  {Object.entries(scenario.scores).map(([key, value]: [string, any]) => (
                    <div key={key} className="flex items-center justify-between group">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-black transition-colors">{key.replace('_', ' ')}</span>
                      <div className="flex items-center gap-4">
                        <div className="w-40 h-1.5 bg-zinc-100 rounded-full overflow-hidden relative">
                          <div className="absolute inset-0 bg-black transition-all duration-700 ease-out" style={{ width: `${value * 10}%` }} />
                        </div>
                        <span className="text-[11px] font-extrabold font-mono w-6 text-right">0{value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        ))}
      </div>

      {/* Page Signature */}
      <div className="pt-12 mt-12 border-t border-zinc-100 flex justify-between items-end opacity-40">
        <div className="flex flex-col gap-1">
          <span className="text-[8px] font-mono font-bold uppercase tracking-widest">Simulation Modeling Trace</span>
          <span className="text-[7px] font-mono font-bold uppercase tracking-widest">STAMP: {project.id.split('-')[0].toUpperCase()}_SIM_OUTCOME</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-zinc-200" />
          <span className="text-[8px] font-mono font-bold uppercase tracking-[0.2em]">Analysis Sequenced</span>
        </div>
      </div>
    </div>
  );
}
