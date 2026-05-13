"use client";

import { AlertTriangle } from "lucide-react";

interface ContradictionsProps {
  contradictions: any[];
}

export function Contradictions({ contradictions }: ContradictionsProps) {
  if (!contradictions || contradictions.length === 0) return null;

  return (
    <div className="p-[20mm] print:break-after-page min-h-[297mm] bg-white text-black">
      <div className="mb-8 pb-4 border-b-2 border-black">
        <h2 className="text-3xl font-black tracking-tight uppercase">Contradiction Intelligence</h2>
        <p className="text-[12px] font-bold text-zinc-500 uppercase tracking-widest mt-2">Strategic Inconsistencies & Conflict Matrix</p>
      </div>

      <div className="mt-12 space-y-8">
        {contradictions.map((c, i) => (
          <div key={i} className="border-l-4 border-black pl-6 py-2">
            <div className="flex items-center gap-3 mb-3">
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 border ${
                c.severity === 'Critical' ? 'bg-red-50 text-red-700 border-red-700' :
                c.severity === 'High' ? 'bg-zinc-100 text-black border-black' :
                'bg-zinc-50 text-zinc-600 border-zinc-400'
              }`}>
                {c.severity} Severity
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Type: {c.type}</span>
            </div>
            
            <h3 className="text-lg font-bold mb-4">{c.description}</h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-zinc-50 p-4 border border-zinc-200">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">Claim A</span>
                <p className="text-sm font-serif text-zinc-800 leading-relaxed italic">"{c.sourceA}"</p>
              </div>
              <div className="bg-zinc-50 p-4 border border-zinc-200">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">Claim B</span>
                <p className="text-sm font-serif text-zinc-800 leading-relaxed italic">"{c.sourceB}"</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-zinc-200">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">Strategic Implication</span>
              <p className="text-sm text-zinc-800 leading-relaxed">{c.resolutionStrategy}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
