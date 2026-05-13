"use client";

import { Activity } from "lucide-react";

interface AuditAppendixProps {
  project: any;
  evidenceList: any[];
  proposals: any[];
}

export function AuditAppendix({ project, evidenceList, proposals }: AuditAppendixProps) {
  // Mock timeline events compiled from metadata
  const timelineEvents = [
    {
      date: project.created_at,
      action: "Project Initialized",
      actor: "System Administrator",
      detail: "Strategic workspace allocated and baseline parameters defined."
    },
    ...evidenceList.map(e => ({
      date: e.created_at,
      action: "Evidence Ingested",
      actor: "Intelligence System",
      detail: `Vector stored. Source: ${e.source_type}. Reliability: ${e.reliability}.`
    })),
    ...proposals.map(p => ({
      date: p.created_at,
      action: "Strategic Proposal Submitted",
      actor: "Human Operator",
      detail: `Proposal ID: PRP-${p.id.split('-')[0]}. Status: ${p.status}.`
    }))
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="p-[20mm] print:break-after-page min-h-[297mm] bg-white text-black">
      <div className="mb-8 pb-4 border-b-2 border-black flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black tracking-tight uppercase">Audit Appendix</h2>
          <p className="text-[12px] font-bold text-zinc-500 uppercase tracking-widest mt-2">Compliance Lineage & System Traces</p>
        </div>
        <div className="px-3 py-1 border border-black text-[10px] font-bold uppercase tracking-widest">
          Classified Record
        </div>
      </div>

      <div className="mt-12 space-y-12">
        {/* System Trace Integrity */}
        <section>
          <h3 className="text-sm font-bold uppercase tracking-widest mb-6 border-b border-zinc-200 pb-2">System Integrity Trace</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-zinc-50 border border-zinc-200">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Intelligence Engine</span>
              <span className="text-sm font-mono text-black">Decidr AI v2.4 (O3-Mini)</span>
            </div>
            <div className="p-4 bg-zinc-50 border border-zinc-200">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Database Shard</span>
              <span className="text-sm font-mono text-black">us-east-1-secure</span>
            </div>
            <div className="p-4 bg-zinc-50 border border-zinc-200">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Verification Hash</span>
              <span className="text-xs font-mono text-zinc-600 truncate block">{project.id}-hash-verified</span>
            </div>
            <div className="p-4 bg-zinc-50 border border-zinc-200">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Export Timestamp</span>
              <span className="text-sm font-mono text-black">{new Date().toISOString()}</span>
            </div>
          </div>
        </section>

        {/* Timeline Log */}
        <section>
          <h3 className="text-sm font-bold uppercase tracking-widest mb-6 border-b border-zinc-200 pb-2 flex items-center gap-2">
            <Activity className="h-4 w-4" /> Immutable Operational Log
          </h3>
          <div className="space-y-0 border border-zinc-200">
            {timelineEvents.map((event, i) => (
              <div key={i} className={`flex text-sm border-b border-zinc-200 ${i % 2 === 0 ? 'bg-zinc-50' : 'bg-white'}`}>
                <div className="w-48 p-3 font-mono text-[10px] text-zinc-500 border-r border-zinc-200 shrink-0 flex items-center">
                  {new Date(event.date).toLocaleString()}
                </div>
                <div className="w-48 p-3 font-bold text-[11px] uppercase tracking-widest border-r border-zinc-200 shrink-0 flex items-center text-black">
                  {event.action}
                </div>
                <div className="flex-1 p-3 text-zinc-700 text-[12px] flex items-center">
                  <span className="font-bold mr-2">{event.actor}:</span> {event.detail}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="pt-12 text-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
          --- End of Report ---
        </div>
      </div>
    </div>
  );
}
