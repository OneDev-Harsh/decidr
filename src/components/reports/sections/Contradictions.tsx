"use client";

import { AlertTriangle } from "lucide-react";

interface ContradictionsProps {
  project: any;
  contradictions: any[];
}

export function Contradictions({ project, contradictions }: ContradictionsProps) {
  if (!contradictions || contradictions.length === 0) return null;

  return (
    <div className="p-[30mm] print:break-after-page min-h-[297mm] bg-white text-black flex flex-col relative overflow-hidden">
      {/* Structural Background Accents */}
      <div className="absolute top-0 right-0 w-[40%] h-[1px] bg-zinc-100" />
      
      {/* Editorial Header */}
      <div className="mb-20">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-1 w-10 bg-black" />
          <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-[0.3em]">Section 03 — Cognitive Audit</span>
        </div>
        <h2 className="text-4xl font-extrabold tracking-tight uppercase mb-3">Logical Divergence Registry</h2>
        <p className="text-[12px] font-bold text-zinc-500 uppercase tracking-widest">Identified Contradictions & Strategic Resolution Paths</p>
      </div>

      <div className="flex-1 space-y-24">
        {contradictions.map((c, i) => (
          <section key={i} className="space-y-10 group">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4 transition-colors group-hover:border-zinc-200">
              <div className="flex items-center gap-4">
                <div className={`px-2 py-0.5 border rounded-sm ${
                  c.severity === 'Critical' ? 'bg-brand-crimson/5 border-brand-crimson/10 text-brand-crimson' :
                  c.severity === 'High' ? 'bg-black text-white border-black' :
                  'bg-zinc-50 text-zinc-400 border-zinc-100'
                }`}>
                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest">{c.severity} Severity</span>
                </div>
                <span className="text-[9px] font-mono font-bold text-zinc-300 uppercase tracking-widest">ID: CNF_{i+1}</span>
              </div>
              <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-[0.2em]">Vector: {c.type}</span>
            </div>
            
            <h3 className="text-[28px] font-extrabold tracking-tight text-black leading-tight max-w-[90%]">
              {c.description}
            </h3>
            
            <div className="grid grid-cols-2 gap-px bg-zinc-100 border border-zinc-100">
              <div className="p-8 bg-white space-y-4">
                <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Vector Alpha</span>
                <p className="text-[14px] text-zinc-600 leading-relaxed font-medium italic tracking-tight">
                  "{c.sourceA}"
                </p>
              </div>
              <div className="p-8 bg-white space-y-4">
                <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Vector Beta</span>
                <p className="text-[14px] text-zinc-600 leading-relaxed font-medium italic tracking-tight">
                  "{c.sourceB}"
                </p>
              </div>
            </div>

            <div className="p-10 bg-zinc-50/50 border border-zinc-100 rounded-sm space-y-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-zinc-400" />
                <span className="text-[9px] font-mono font-bold text-black uppercase tracking-[0.2em]">Strategic Resolution Path</span>
              </div>
              <p className="text-[15px] text-zinc-700 leading-relaxed font-medium tracking-tight">
                {c.resolutionStrategy}
              </p>
            </div>
          </section>
        ))}
      </div>

      {/* Page Signature */}
      <div className="pt-12 mt-12 border-t border-zinc-100 flex justify-between items-end opacity-40">
        <div className="flex flex-col gap-1">
          <span className="text-[8px] font-mono font-bold uppercase tracking-widest">Cognitive Integrity Trace</span>
          <span className="text-[7px] font-mono font-bold uppercase tracking-widest">STAMP: {project.id.split('-')[0].toUpperCase()}_AUDIT_CNF</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-zinc-200" />
          <span className="text-[8px] font-mono font-bold uppercase tracking-[0.2em]">Logic Sequenced</span>
        </div>
      </div>
    </div>
  );
}
