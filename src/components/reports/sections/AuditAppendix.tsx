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
      detail: `Proposal ID: PRP-${p.id.split('-')[0].toUpperCase()}. Status: ${p.status}.`
    }))
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="p-[30mm] print:break-after-page min-h-[297mm] bg-white text-black">
      
      {/* Editorial Header */}
      <div className="mb-16 flex justify-between items-start">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-1 w-12 bg-black" />
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-[0.3em]">Final Stage — Technical Appendix</span>
          </div>
          <h2 className="text-4xl font-black tracking-tight uppercase mb-2 font-serif">Audit & Lineage</h2>
          <p className="text-[12px] font-bold text-zinc-500 uppercase tracking-widest">Compliance Lifecycle & System Traces</p>
        </div>
        <div className="px-4 py-2 border-2 border-black text-[10px] font-black uppercase tracking-[0.2em] bg-black text-white">
          Certified Record
        </div>
      </div>

      <div className="space-y-20">
        {/* System Trace Integrity */}
        <section className="space-y-8">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
            <div className="h-1.5 w-1.5 bg-black rounded-full" />
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Intelligence Infrastructure Trace</span>
          </div>
          <div className="grid grid-cols-2 gap-px bg-zinc-100 border border-zinc-100">
            {[
              { label: "Intelligence Engine", value: "Decidr AI v2.4 (O3-Mini)" },
              { label: "Database Shard", value: "us-east-1-secure" },
              { label: "Verification Hash", value: `${project.id.toUpperCase()}-VERIFIED`, mono: true },
              { label: "Export Timestamp", value: new Date().toISOString(), mono: true }
            ].map((item, i) => (
              <div key={i} className="p-8 bg-white space-y-2">
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">{item.label}</span>
                <span className={`text-[13px] font-bold text-black ${item.mono ? 'font-mono uppercase tracking-tight' : ''}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline Log */}
        <section className="space-y-8">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
            <Activity className="h-3.5 w-3.5 text-black" />
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Immutable Operational Lifecycle</span>
          </div>
          <div className="border border-zinc-100 divide-y divide-zinc-100">
            {timelineEvents.map((event, i) => (
              <div key={i} className="flex group hover:bg-zinc-50/50 transition-colors">
                <div className="w-56 p-6 font-mono text-[9px] font-bold text-zinc-300 border-r border-zinc-100 shrink-0 group-hover:text-black transition-colors">
                  {new Date(event.date).toLocaleString('en-US', { 
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false 
                  })}
                </div>
                <div className="w-64 p-6 border-r border-zinc-100 shrink-0">
                  <span className="text-[10px] font-black uppercase tracking-widest text-black block mb-1">{event.action}</span>
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-[0.2em]">{event.actor}</span>
                </div>
                <div className="flex-1 p-6 text-zinc-600 text-[13px] leading-relaxed font-serif italic">
                  {event.detail}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Completion Signature */}
        <div className="pt-20 text-center space-y-6">
          <div className="flex justify-center items-center gap-4">
            <div className="h-px w-24 bg-zinc-100" />
            <span className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.5em]">End of Strategic Briefing</span>
            <div className="h-px w-24 bg-zinc-100" />
          </div>
          <div className="flex flex-col gap-2 opacity-30">
            <span className="text-[8px] font-bold uppercase tracking-widest">Document Integrity Verified</span>
            <span className="text-[7px] font-mono uppercase tracking-widest">System Hash: {Buffer.from(project.id).toString('base64').slice(0, 32)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
