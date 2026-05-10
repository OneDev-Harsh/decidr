"use client";

import { useState, useEffect } from "react";
import { insforge } from "@/lib/insforge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Clock, GitMerge, EyeOff, CheckCircle, Share2, FileText, ChevronRight, ChevronDown, X } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export function DecisionTimeline({ projectId }: { projectId: string }) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  useEffect(() => {
    async function loadEvents() {
      const { data, error } = await insforge.database
        .from('decision_events')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setEvents(data);
      }
      setLoading(false);
    }

    loadEvents();
  }, [projectId]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'SCENARIOS': return GitMerge;
      case 'BLINDSPOTS': return EyeOff;
      case 'RECOMMENDATION': return CheckCircle;
      case 'KNOWLEDGE_MAP': return Share2;
      case 'REPORT': return FileText;
      case 'DECISION_FINALIZED': return CheckCircle;
      default: return Clock;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'SCENARIOS': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'BLINDSPOTS': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'RECOMMENDATION': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'KNOWLEDGE_MAP': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      case 'DECISION_FINALIZED': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getTextColor = (type: string) => {
    switch (type) {
      case 'SCENARIOS': return 'text-blue-400';
      case 'BLINDSPOTS': return 'text-amber-400';
      case 'RECOMMENDATION': return 'text-emerald-400';
      case 'KNOWLEDGE_MAP': return 'text-purple-400';
      case 'DECISION_FINALIZED': return 'text-emerald-400';
      default: return 'text-gray-400';
    }
  };

  // Group events by date
  const groupedEvents = events.reduce((acc, event) => {
    const date = format(new Date(event.created_at), 'yyyy-MM-dd');
    if (!acc[date]) acc[date] = [];
    acc[date].push(event);
    return acc;
  }, {} as Record<string, any[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-brand-crimson animate-spin" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-xl bg-white/5">
        <Clock className="h-10 w-10 text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white">No decision history yet</h3>
        <p className="text-gray-400">Run AI analyses or add evidence to start tracking progress.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-brand-crimson" /> Decision Timeline
          </h3>
          <p className="text-sm text-gray-400">Immutable audit trail of all analytical events.</p>
        </div>
        <span className="text-[10px] font-mono text-gray-600">{events.length} event{events.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-px bg-white/10" />
        
        <div className="space-y-10">
          {Object.entries(groupedEvents).map(([date, dateEvents]) => (
            <div key={date}>
              {/* Date Header */}
              <div className="relative pl-16 mb-6">
                <div className="absolute left-[17px] top-1/2 -translate-y-1/2 w-5 h-px bg-white/20" />
                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                  {format(new Date(date), 'MMMM d, yyyy')}
                </span>
              </div>

              <div className="space-y-6">
                {(dateEvents as any[]).map((event) => {
                  const Icon = getEventIcon(event.event_type);
                  const colorClass = getTextColor(event.event_type);
                  const badgeClass = getEventColor(event.event_type);
                  const isExpanded = expandedEvent === event.id;
                  const hasMetadata = event.metadata && Object.keys(event.metadata).length > 0;

                  return (
                    <div key={event.id} className="relative pl-16 group">
                      <div className={`absolute left-0 top-1 w-12 h-12 rounded-full bg-black border flex items-center justify-center z-10 group-hover:border-brand-crimson/50 transition-colors ${badgeClass}`}>
                        <Icon className={`h-5 w-5 ${colorClass}`} />
                      </div>
                      
                      <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/[0.07] transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <h4 className="text-base font-bold text-white">{event.title}</h4>
                            <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${badgeClass}`}>
                              {event.event_type.replace('_', ' ')}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 font-mono">
                            {format(new Date(event.created_at), 'HH:mm')}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">{event.description}</p>
                        
                        {hasMetadata && (
                          <div className="mt-4">
                            <button
                              onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                              className="text-[10px] font-bold uppercase tracking-widest text-brand-crimson hover:text-white flex items-center transition-colors"
                            >
                              {isExpanded ? 'Hide' : 'View'} Snapshot
                              {isExpanded ? <ChevronDown className="ml-1 h-3 w-3" /> : <ChevronRight className="ml-1 h-3 w-3" />}
                            </button>
                            
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <pre className="mt-3 p-4 bg-black/60 rounded-lg border border-white/5 text-[10px] text-gray-400 font-mono overflow-x-auto max-h-64 overflow-y-auto">
                                    {JSON.stringify(event.metadata, null, 2)}
                                  </pre>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
