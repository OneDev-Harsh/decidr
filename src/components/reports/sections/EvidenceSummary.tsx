"use client";

import { Database, Link2 } from "lucide-react";

interface EvidenceSummaryProps {
  project: any;
  evidenceList: any[];
}

export function EvidenceSummary({ project, evidenceList }: EvidenceSummaryProps) {
  const highReliability = evidenceList.filter(e => e.reliability === 'high').length;
  const mediumReliability = evidenceList.filter(e => e.reliability === 'medium').length;
  const lowReliability = evidenceList.filter(e => e.reliability === 'low').length;
  
  const total = evidenceList.length;

  return (
    <div className="p-[30mm] print:break-after-page min-h-[297mm] bg-white text-black flex flex-col relative overflow-hidden">
      {/* Structural Background Accents */}
      <div className="absolute top-0 right-0 w-[40%] h-[1px] bg-zinc-100" />
      
      {/* Editorial Header */}
      <div className="mb-20">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-1 w-10 bg-black" />
          <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-[0.3em]">Section 02 — Intelligence Registry</span>
        </div>
        <h2 className="text-4xl font-extrabold tracking-tight uppercase mb-3">Foundation Registry</h2>
        <p className="text-[12px] font-bold text-zinc-500 uppercase tracking-widest">Audited Source Material & Reliability Distribution</p>
      </div>

      {total === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-zinc-200 bg-zinc-50 rounded-sm">
          <Database className="h-8 w-8 text-zinc-300 mb-4" />
          <p className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-widest">No Intelligence Vectors Logged</p>
        </div>
      ) : (
        <div className="flex-1 space-y-20">
          {/* Analytical Distribution Index - Tactical & Clean */}
          <section className="space-y-8">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-[0.2em]">Reliability Distribution Index</span>
              <div className="flex gap-6">
                {[
                  { label: "High", color: "bg-black" },
                  { label: "Medium", color: "bg-zinc-300" },
                  { label: "Low", color: "bg-brand-crimson" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={`h-1.5 w-1.5 rounded-full ${item.color}`} />
                    <span className="text-[9px] font-bold text-zinc-500 uppercase">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-12 items-center">
              <div className="space-y-1">
                <span className="text-[28px] font-extrabold tracking-tighter leading-none">{total}</span>
                <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">Vector Artifacts</span>
              </div>
              <div className="col-span-3 h-2 bg-zinc-50 rounded-full overflow-hidden flex w-full">
                <div style={{ width: `${(highReliability/total)*100}%` }} className="bg-black h-full" />
                <div style={{ width: `${(mediumReliability/total)*100}%` }} className="bg-zinc-300 h-full" />
                <div style={{ width: `${(lowReliability/total)*100}%` }} className="bg-brand-crimson h-full" />
              </div>
            </div>
          </section>

          {/* Operational Intelligence Table */}
          <section className="space-y-8">
            <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
              <Database className="h-3.5 w-3.5 text-zinc-400" />
              <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-[0.2em]">Vector Intelligence Log</span>
            </div>
            
            <div className="border border-zinc-100 divide-y divide-zinc-100">
              {evidenceList.map((evidence, i) => (
                <div key={i} className="flex group hover:bg-zinc-50 transition-colors">
                  <div className="w-24 p-8 border-r border-zinc-100 flex flex-col gap-2 shrink-0">
                    <span className="text-[10px] font-mono font-bold text-zinc-300 uppercase tracking-widest group-hover:text-black transition-colors">VCTR_{i+1}</span>
                    <span className="text-[8px] font-mono font-bold text-zinc-200 uppercase tracking-widest">{evidence.source_type}</span>
                  </div>
                  <div className="flex-1 p-8 space-y-6">
                    <p className="text-[15px] font-medium text-zinc-700 leading-relaxed tracking-tight">
                      {evidence.content}
                    </p>
                    <div className="flex items-center gap-4">
                      <div className={`px-2 py-0.5 rounded-sm border ${
                        evidence.reliability === 'high' ? 'bg-zinc-50 border-zinc-200 text-black' : 
                        evidence.reliability === 'medium' ? 'bg-zinc-50 border-zinc-100 text-zinc-400' : 
                        'bg-brand-crimson/5 border-brand-crimson/10 text-brand-crimson'
                      }`}>
                        <span className="text-[9px] font-mono font-bold uppercase tracking-widest">
                          Reliability: {evidence.reliability}
                        </span>
                      </div>
                      {evidence.source_url && (
                        <div className="flex items-center gap-1.5 opacity-30">
                          <Link2 className="h-3 w-3" />
                          <span className="text-[9px] font-mono font-bold uppercase tracking-widest">Source Linked</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Page Signature */}
      <div className="pt-12 mt-12 border-t border-zinc-100 flex justify-between items-end opacity-40">
        <div className="flex flex-col gap-1">
          <span className="text-[8px] font-mono font-bold uppercase tracking-widest">Intelligence Governance Record</span>
          <span className="text-[7px] font-mono font-bold uppercase tracking-widest">Trace_ID: {project.id.split('-')[0].toUpperCase()}_VCTR_LOG</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-zinc-200" />
          <span className="text-[8px] font-mono font-bold uppercase tracking-[0.2em]">System Verified Secure</span>
        </div>
      </div>
    </div>
  );
}
