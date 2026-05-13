"use client";

import { MessageSquare, GitPullRequest } from "lucide-react";

interface DebateGovernanceProps {
  proposals: any[];
}

export function DebateGovernance({ proposals }: DebateGovernanceProps) {
  if (!proposals || proposals.length === 0) return null;

  return (
    <div className="p-[20mm] print:break-after-page min-h-[297mm] bg-white text-black">
      <div className="mb-8 pb-4 border-b-2 border-black">
        <h2 className="text-3xl font-black tracking-tight uppercase">Debate & Governance</h2>
        <p className="text-[12px] font-bold text-zinc-500 uppercase tracking-widest mt-2">Strategic Proposals & Deliberation History</p>
      </div>

      <div className="mt-12 space-y-12">
        {proposals.map((proposal, index) => (
          <div key={index} className="border border-zinc-200">
            <div className="bg-zinc-50 p-6 border-b border-zinc-200 flex justify-between items-start">
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <GitPullRequest className="h-5 w-5 text-black" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">PRP-{proposal.id.split('-')[0]}</span>
                    <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 border ${
                      proposal.status === 'merged' ? 'bg-black text-white border-black' :
                      proposal.status === 'open' ? 'bg-zinc-200 text-black border-zinc-400' :
                      'bg-white text-zinc-500 border-zinc-200'
                    }`}>
                      {proposal.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-black">{proposal.description || "Strategic Adjustment Proposed"}</h3>
                </div>
              </div>
              <div className="text-right text-[10px] font-mono text-zinc-500">
                {new Date(proposal.created_at).toLocaleDateString()}
              </div>
            </div>

            <div className="p-6">
              <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Proposed Changes</h4>
              <div className="space-y-4 mb-8">
                {Object.entries(proposal.proposed_changes || {}).map(([key, value]: [string, any], i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-700 capitalize">{key.replace('_', ' ')}</span>
                    <p className="text-sm font-serif text-zinc-800 italic bg-zinc-50 p-3 border border-zinc-200">"{value}"</p>
                  </div>
                ))}
              </div>

              {proposal.comments && proposal.comments.length > 0 && (
                <div className="pt-6 border-t border-zinc-200">
                  <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" /> Reviewer Deliberation
                  </h4>
                  <div className="space-y-4">
                    {proposal.comments.map((comment: any, j: number) => (
                      <div key={j} className="pl-4 border-l-2 border-zinc-200">
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="text-[11px] font-bold uppercase tracking-widest">{comment.author_name || "Reviewer"}</span>
                          <span className="text-[9px] font-mono text-zinc-500">{new Date(comment.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-zinc-600">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
