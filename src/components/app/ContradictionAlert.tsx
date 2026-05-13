"use client";

import { AlertCircle, ChevronRight } from "lucide-react";

export function ContradictionAlert({ contradictions }: { contradictions: any[] }) {
  if (!contradictions || contradictions.length === 0) return null;

  return (
    <div className="mb-8 space-y-4">
      {contradictions.map((c, i) => (
        <div key={i} className="flex items-start gap-5 p-6 rounded-xl bg-zinc-950 border border-white/5 group hover:border-white/10 transition-all shadow-2xl">
          <div className="mt-1.5">
            <div className="h-2 w-2 rounded-full bg-zinc-600 group-hover:bg-white transition-colors" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[16px] font-extrabold text-white uppercase tracking-tight flex items-center gap-2">
                {c.title}
              </h4>
              <div className={`px-2 py-0.5 border rounded-sm ${
                c.severity === 'High' ? 'bg-white text-black border-white' : 'bg-zinc-900 text-zinc-400 border-white/5'
              }`}>
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest">
                  {c.severity} Criticality
                </span>
              </div>
            </div>
            <p className="text-[14px] text-zinc-400 leading-relaxed max-w-3xl font-medium tracking-tight">{c.description}</p>
            
            <div className="mt-6 pt-5 border-t border-white/[0.03] flex flex-wrap gap-3">
              {c.sources?.map((source: string, si: number) => (
                <div key={si} className="flex items-center gap-2 px-2.5 py-1 bg-white/[0.02] border border-white/[0.05] rounded-sm">
                  <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Source</span>
                  <span className="text-[10px] font-mono font-bold text-zinc-300 uppercase tracking-tight">{source}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
