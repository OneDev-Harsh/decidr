"use client";

import { Database, Link2 } from "lucide-react";

interface EvidenceSummaryProps {
  evidenceList: any[];
}

export function EvidenceSummary({ evidenceList }: EvidenceSummaryProps) {
  const highReliability = evidenceList.filter(e => e.reliability === 'high').length;
  const mediumReliability = evidenceList.filter(e => e.reliability === 'medium').length;
  const lowReliability = evidenceList.filter(e => e.reliability === 'low').length;
  
  const total = evidenceList.length;

  return (
    <div className="p-[20mm] print:break-after-page min-h-[297mm] bg-white text-black">
      <div className="mb-8 pb-4 border-b-2 border-black">
        <h2 className="text-3xl font-black tracking-tight uppercase">Intelligence & Evidence</h2>
        <p className="text-[12px] font-bold text-zinc-500 uppercase tracking-widest mt-2">Data Foundations & Reliability</p>
      </div>

      {total === 0 ? (
        <div className="py-20 text-center border-2 border-dashed border-zinc-200">
          <p className="text-zinc-500 font-medium">No evidence ingested into this project.</p>
        </div>
      ) : (
        <div className="space-y-12 mt-12">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-6">
            <div className="p-6 bg-zinc-50 border border-zinc-200">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">Total Vectors</span>
              <span className="text-4xl font-bold font-mono">{total}</span>
            </div>
            <div className="p-6 bg-zinc-50 border border-zinc-200 col-span-2">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-4">Reliability Distribution</span>
              <div className="flex h-4 bg-zinc-200 rounded-full overflow-hidden w-full mb-2">
                <div style={{ width: `${(highReliability/total)*100}%` }} className="bg-black h-full" />
                <div style={{ width: `${(mediumReliability/total)*100}%` }} className="bg-zinc-500 h-full" />
                <div style={{ width: `${(lowReliability/total)*100}%` }} className="bg-red-700 h-full" />
              </div>
              <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                <span className="text-black">High ({highReliability})</span>
                <span className="text-zinc-500">Medium ({mediumReliability})</span>
                <span className="text-red-700">Low ({lowReliability})</span>
              </div>
            </div>
          </div>

          {/* Evidence List */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
              <Database className="h-5 w-5" /> Core Evidence Registry
            </h3>
            <div className="space-y-4">
              {evidenceList.map((evidence, i) => (
                <div key={i} className="flex items-start gap-4 p-4 border border-zinc-200">
                  <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${
                    evidence.reliability === 'high' ? 'bg-black' : 
                    evidence.reliability === 'medium' ? 'bg-zinc-400' : 'bg-red-600'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-black leading-snug mb-1">{evidence.content}</p>
                    <div className="flex items-center gap-4 text-[11px] text-zinc-500 mt-2">
                      <span className="font-mono uppercase">Src: {evidence.source_type}</span>
                      {evidence.source_url && (
                        <span className="flex items-center gap-1"><Link2 className="h-3 w-3" /> Linked</span>
                      )}
                      <span className="uppercase tracking-widest">Rel: {evidence.reliability}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
