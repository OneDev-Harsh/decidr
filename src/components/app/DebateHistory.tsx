"use client";

import { useEffect, useState } from "react";
import { insforge } from "@/lib/insforge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Zap, MessageSquare, Loader2, CheckCircle2, ChevronDown, ChevronRight, User, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AGENT_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: any }> = {
  strategist: { label: 'Strategist', color: 'text-emerald-500', bgColor: 'bg-emerald-500/10', icon: Zap },
  skeptic: { label: 'Skeptic', color: 'text-brand-crimson', bgColor: 'bg-brand-crimson/10', icon: AlertTriangle },
  moderator: { label: 'Moderator', color: 'text-amber-500', bgColor: 'bg-amber-500/10', icon: Shield },
  devil_advocate: { label: "Devil's Advocate", color: 'text-purple-400', bgColor: 'bg-purple-400/10', icon: User },
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
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-brand-crimson" />
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center p-12 bg-white/5 rounded-lg border border-white/10">
        <MessageSquare className="h-12 w-12 text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white">No Debate History</h3>
        <p className="text-gray-400 mt-2">Trigger a recommendation to start an AI strategic debate.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-brand-crimson" /> Adversarial Debate Log
        </h3>
        <p className="text-sm text-gray-400">Multi-agent reasoning sessions that shaped recommendations.</p>
      </div>

      {sessions.map((session) => {
        const isExpanded = expandedSession === session.id;
        const messages = session.debate_messages?.sort(
          (a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        ) || [];

        // Determine round labels
        const rounds = messages.map((msg: any, idx: number) => {
          const config = AGENT_CONFIG[msg.agent_role] || AGENT_CONFIG.moderator;
          let roundLabel = '';
          if (msg.agent_role === 'strategist' && idx === 0) roundLabel = 'Opening Proposal';
          else if (msg.agent_role === 'skeptic') roundLabel = 'Critique & Challenge';
          else if (msg.agent_role === 'strategist') roundLabel = 'Rebuttal';
          else if (msg.agent_role === 'moderator') roundLabel = 'Final Synthesis';
          else if (msg.agent_role === 'devil_advocate') roundLabel = "Devil's Advocate";
          return { ...msg, config, roundLabel };
        });

        return (
          <Card key={session.id} className="bg-white/5 border-white/10 overflow-hidden">
            <button
              onClick={() => setExpandedSession(isExpanded ? null : session.id)}
              className="w-full text-left"
            >
              <CardHeader className="border-b border-white/5 bg-black/40 hover:bg-black/60 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-brand-crimson" />
                    <CardTitle className="text-lg text-white">{session.topic}</CardTitle>
                    {session.status === 'completed' && (
                      <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        Resolved
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] text-gray-600 font-mono">{messages.length} turns</span>
                    <span className="text-xs text-gray-500">{new Date(session.created_at).toLocaleString()}</span>
                    {isExpanded ? <ChevronDown className="h-4 w-4 text-gray-500" /> : <ChevronRight className="h-4 w-4 text-gray-500" />}
                  </div>
                </div>
              </CardHeader>
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardContent className="p-0">
                    {/* Debate Turns */}
                    <div className="relative">
                      {/* Thread line */}
                      <div className="absolute left-[39px] top-0 bottom-0 w-px bg-white/5" />

                      {rounds.map((msg: any, idx: number) => {
                        const AgentIcon = msg.config.icon;
                        const isLast = idx === rounds.length - 1;

                        return (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`relative p-6 pl-20 ${!isLast ? 'border-b border-white/5' : ''}`}
                          >
                            {/* Agent avatar */}
                            <div className={`absolute left-5 top-6 w-7 h-7 rounded-full flex items-center justify-center z-10 ${msg.config.bgColor}`}>
                              <AgentIcon className={`h-3.5 w-3.5 ${msg.config.color}`} />
                            </div>

                            <div>
                              <div className="flex items-center gap-3 mb-3">
                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${msg.config.bgColor} ${msg.config.color}`}>
                                  {msg.config.label}
                                </span>
                                {msg.roundLabel && (
                                  <span className="text-[10px] text-gray-600 font-medium">— {msg.roundLabel}</span>
                                )}
                                <span className="text-[10px] text-gray-700 font-mono ml-auto">
                                  Round {idx + 1}
                                </span>
                              </div>
                              <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                                {msg.content}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Synthesis */}
                    {session.synthesis && (
                      <div className="p-6 bg-brand-crimson/5 border-t border-brand-crimson/10">
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle2 className="h-4 w-4 text-brand-crimson" />
                          <span className="text-xs font-bold text-brand-crimson uppercase tracking-widest">Final Synthesis</span>
                        </div>
                        <div className="text-sm text-gray-200 italic leading-relaxed">
                          {(() => {
                            try {
                              const parsed = JSON.parse(session.synthesis);
                              return parsed.debateSummary || parsed.recommendation || session.synthesis;
                            } catch {
                              return session.synthesis;
                            }
                          })()}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        );
      })}
    </div>
  );
}
