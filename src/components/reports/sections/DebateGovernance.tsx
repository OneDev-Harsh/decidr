"use client";

import { MessageSquare, GitPullRequest } from "lucide-react";

interface DebateGovernanceProps {
  project: any;
  proposals: any[];
}

export function DebateGovernance({ project, proposals }: DebateGovernanceProps) {
  if (!proposals || proposals.length === 0) return null;

  return (
    <div className="p-[30mm] print:break-after-page min-h-[297mm] bg-white text-black flex flex-col relative overflow-hidden">
      {/* Structural Background Accents */}
      <div className="absolute top-0 right-0 w-[40%] h-[1px] bg-zinc-100" />
      
      {/* Editorial Header */}
      <div className="mb-20">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-1 w-10 bg-black" />
          <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-[0.3em]">Section 05 — Decision Governance</span>
        </div>
        <h2 className="text-4xl font-extrabold tracking-tight uppercase mb-3">Deliberation Audit</h2>
        <p className="text-[12px] font-bold text-zinc-500 uppercase tracking-widest">Formal Proposal Lifecycle & Peer-Review Governance Logs</p>
      </div>

      <div className="flex-1 space-y-24">
        {proposals.map((proposal, index) => (
          <section key={index} className="space-y-12 group">
            {/* Proposal Header - Tactical & Clean */}
            <div className="flex justify-between items-start border-b border-zinc-100 pb-5 transition-colors group-hover:border-zinc-200">
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="px-2 py-0.5 bg-black text-white rounded-sm">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest">PRP_{proposal.id.split('-')[0].toUpperCase()}</span>
                  </div>
                  <div className={`px-2 py-0.5 border rounded-sm ${
                    proposal.status === 'merged' ? 'bg-zinc-50 border-zinc-200 text-black' : 
                    proposal.status === 'open' ? 'bg-zinc-50 border-zinc-100 text-zinc-400' : 
                    'bg-white text-zinc-300 border-zinc-100'
                  }`}>
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest">{proposal.status}</span>
                  </div>
                </div>
                <h3 className="text-[24px] font-extrabold tracking-tight uppercase">{proposal.description || "Strategic Adjustment Proposed"}</h3>
              </div>
              
              <div className="text-right">
                <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest block mb-1">Submission Date</span>
                <span className="text-[12px] font-extrabold font-mono tracking-tighter">
                  {new Date(proposal.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-12">
              {/* Proposed Structural Changes - High Contrast Table */}
              <div className="space-y-6">
                <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-[0.2em]">Proposed Structural Changes</span>
                <div className="border border-zinc-100 divide-y divide-zinc-100">
                  {Object.entries(proposal.proposed_changes || {}).map(([key, value]: [string, any], i) => (
                    <div key={i} className="flex group/change hover:bg-zinc-50 transition-colors">
                      <div className="w-40 p-6 border-r border-zinc-100 shrink-0">
                        <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest group-hover/change:text-black transition-colors capitalize">
                          {key.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex-1 p-6">
                        <p className="text-[14px] text-zinc-700 leading-relaxed font-medium tracking-tight">
                          {value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deliberation Log - Tactical & Modular */}
              {proposal.comments && proposal.comments.length > 0 && (
                <div className="space-y-8">
                  <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
                    <MessageSquare className="h-3.5 w-3.5 text-zinc-400" />
                    <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-[0.2em]">Peer Review Deliberation Log</span>
                  </div>
                  <div className="grid grid-cols-1 gap-px bg-zinc-100 border border-zinc-100">
                    {proposal.comments.map((comment: any, j: number) => (
                      <div key={j} className="p-8 bg-white space-y-3 hover:bg-zinc-50 transition-colors">
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="text-[11px] font-extrabold uppercase tracking-tight text-black">{comment.author_name || "Authorized Reviewer"}</span>
                          <span className="text-[9px] font-mono font-bold text-zinc-300 uppercase">{new Date(comment.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-[14px] text-zinc-600 leading-relaxed font-medium">
                          {comment.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        ))}
      </div>

      {/* Page Signature */}
      <div className="pt-12 mt-12 border-t border-zinc-100 flex justify-between items-end opacity-40">
        <div className="flex flex-col gap-1">
          <span className="text-[8px] font-mono font-bold uppercase tracking-widest">Decision Governance Record</span>
          <span className="text-[7px] font-mono font-bold uppercase tracking-widest">STAMP: {project.id.split('-')[0].toUpperCase()}_GOV_AUDIT</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-zinc-200" />
          <span className="text-[8px] font-mono font-bold uppercase tracking-[0.2em]">Governance Integrity Verified</span>
        </div>
      </div>
    </div>
  );
}
