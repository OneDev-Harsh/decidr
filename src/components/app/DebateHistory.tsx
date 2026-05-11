"use client";

import { useEffect, useState } from "react";
import { insforge } from "@/lib/insforge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Zap, MessageSquare, Loader2, CheckCircle2, ChevronDown, ChevronRight, User, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AGENT_CONFIG: Record<string, { label: string; icon: any }> = {
  strategist: { label: 'Strategist', icon: Zap },
  skeptic: { label: 'Skeptic', icon: AlertTriangle },
  moderator: { label: 'Moderator', icon: Shield },
  devil_advocate: { label: "Devil's Advocate", icon: User },
};

export function DebateHistory({ projectId }: { projectId: string }) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  useEffect(() => {
    async function loadDebates() {
      const { data, error } = await insforge.database
        .from('debate_sessions')
        .select('*, debate_messages(*)')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (data) {
        setSessions(data);
        if (data.length > 0) setExpandedSession(data[0].id);
      }
      setLoading(false);
    }
    loadDebates();
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-24">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-24 border border-white/[0.05] rounded-xl bg-[#0a0a0a]/50 border-dashed max-w-3xl mx-auto flex flex-col items-center justify-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-white/5 border border-white/10 mb-6">
          <MessageSquare className="h-6 w-6 text-zinc-400" />
        </div>
        <h3 className="text-[18px] font-medium text-white mb-2">No Debate History</h3>
        <p className="text-[14px] text-zinc-500 max-w-md mx-auto mb-8 leading-relaxed">
          Trigger a recommendation to initiate a multi-agent adversarial debate.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h3 className="text-[16px] font-medium text-white flex items-center gap-2">
            Adversarial Deliberation
          </h3>
          <p className="text-[13px] text-zinc-500">Multi-agent reasoning sessions that shaped recommendations.</p>
        </div>
        <span className="text-[11px] font-mono text-zinc-600">{sessions.length} session{sessions.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="space-y-6">
        {sessions.map((session) => {
          const isExpanded = expandedSession === session.id;
          const messages = session.debate_messages?.sort(
            (a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          ) || [];

          return (
            <div key={session.id} className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden group">
              <button
                onClick={() => setExpandedSession(isExpanded ? null : session.id)}
                className="w-full text-left p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-zinc-400" />
                  </div>
                  <div>
                    <h4 className="text-[16px] font-semibold text-white">{session.topic}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[11px] text-zinc-500">
                        {new Date(session.created_at).toLocaleDateString()} at {new Date(session.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {session.status === 'completed' && (
                        <span className="text-[9px] font-medium text-emerald-400 uppercase tracking-widest px-1.5 py-0.5 rounded border border-emerald-500/20 bg-emerald-500/10">
                          Resolved
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <p className="text-[11px] text-zinc-500 font-mono">{messages.length} turns</p>
                  </div>
                  {isExpanded ? <ChevronDown className="h-4 w-4 text-zinc-600" /> : <ChevronRight className="h-4 w-4 text-zinc-600" />}
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="border-t border-white/5">
                      <div className="relative">
                        <div className="absolute left-[39px] top-0 bottom-0 w-px bg-white/[0.03]" />

                        {messages.map((msg: any, idx: number) => {
                          const config = AGENT_CONFIG[msg.agent_role] || AGENT_CONFIG.moderator;
                          const AgentIcon = config.icon;
                          const isLast = idx === messages.length - 1;

                          return (
                            <motion.div
                              key={msg.id}
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className="relative p-8 pl-20"
                            >
                              <div className="absolute left-6 top-8 w-8 h-8 rounded-lg bg-black border border-white/10 flex items-center justify-center z-10 shadow-sm">
                                <AgentIcon className="h-4 w-4 text-zinc-400" />
                              </div>

                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <span className="text-[11px] font-medium text-white uppercase tracking-wider">
                                      {config.label}
                                    </span>
                                    <span className="text-[10px] text-zinc-600 font-mono">Turn {idx + 1}</span>
                                  </div>
                                </div>
                                <div className="text-[14px] text-zinc-400 leading-relaxed max-w-3xl whitespace-pre-wrap font-light">
                                  {msg.content}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>

                      {session.synthesis && (
                        <div className="p-8 bg-white/[0.01] border-t border-white/5">
                          <div className="flex items-center gap-2 mb-4">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500/50" />
                            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-widest">Final Synthesis of Consensus</span>
                          </div>
                          <p className="text-[15px] text-zinc-300 italic leading-relaxed font-light pl-6 border-l border-white/10">
                            {(() => {
                              try {
                                const parsed = JSON.parse(session.synthesis);
                                return parsed.debateSummary || parsed.recommendation || session.synthesis;
                              } catch {
                                return session.synthesis;
                              }
                            })()}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
}
