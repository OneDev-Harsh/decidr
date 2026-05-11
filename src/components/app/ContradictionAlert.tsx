"use client";

import { AlertCircle, ChevronRight } from "lucide-react";

export function ContradictionAlert({ contradictions }: { contradictions: any[] }) {
  if (!contradictions || contradictions.length === 0) return null;

  return (
    <div className="mb-8 space-y-4">
      {contradictions.map((c, i) => (
        <div key={i} className="flex items-start gap-4 p-5 rounded-xl bg-[#0a0a0a] border border-red-500/20 group hover:border-red-500/40 transition-all">
          <div className="mt-1">
            <AlertCircle className="h-5 w-5 text-red-500/70" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[15px] font-semibold text-white flex items-center gap-2">
                Strategic Contradiction: {c.title}
              </h4>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded border uppercase tracking-widest ${
                c.severity === 'High' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}>
                {c.severity} Criticality
              </span>
            </div>
            <p className="text-[13px] text-zinc-400 leading-relaxed max-w-3xl">{c.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {c.sources?.map((source: string, si: number) => (
                <span key={si} className="text-[10px] font-medium text-zinc-600 bg-white/[0.02] px-2 py-0.5 rounded border border-white/5 uppercase tracking-tighter">
                  Ref: {source}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
