"use client";

import { useState, memo } from "react";
import { insforge } from "@/lib/insforge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, EyeOff, AlertTriangle, ShieldAlert, CheckCircle2, ChevronRight, Info, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { BlindspotResult } from "@/lib/types";

interface Blindspot extends BlindspotResult {}

export const BlindspotAnalysis = memo(function BlindspotAnalysis({ project, onAnalysisComplete }: { project: any, onAnalysisComplete?: (data: any) => void }) {
  const [blindspots, setBlindspots] = useState<Blindspot[]>(project.last_blindspots || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generateBlindspots() {
    setLoading(true);
    setError(null);

    try {
      const { data: evidenceList } = await insforge.database.from('evidence').select('*').eq('project_id', project.id);
      
      const authHeader = insforge.getHttpClient().getHeaders()['Authorization'];
      
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': authHeader || ''
        },
        body: JSON.stringify({ project, evidenceList: evidenceList || [], action: 'blindspots' })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to analyze blindspots');

      const results = data.blindspots || [];
      setBlindspots(results);

      if (onAnalysisComplete) onAnalysisComplete(data);

      await insforge.database
        .from('projects')
        .update({ last_blindspots: results })
        .eq('id', project.id);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (blindspots.length === 0 && !loading) {
    return (
      <div className="text-center py-24 border border-white/[0.05] rounded-xl bg-[#0a0a0a]/50 border-dashed max-w-3xl mx-auto flex flex-col items-center justify-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-white/5 border border-white/10 mb-6">
          <EyeOff className="h-6 w-6 text-zinc-400" />
        </div>
        <h3 className="text-[18px] font-medium text-white mb-2">Audit for Cognitive Blindspots</h3>
        <p className="text-[14px] text-zinc-500 max-w-md mx-auto mb-8 leading-relaxed">
          The Blindspot Agent identifies missing evidence and logical leaps to ensure a balanced decision context.
        </p>
        <Button onClick={generateBlindspots} className="bg-white hover:bg-zinc-200 text-black font-medium px-8 h-10 transition-colors rounded-md shadow-sm">
          Run Blindspot Audit
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h3 className="text-[16px] font-medium text-white flex items-center gap-2">
            Cognitive Audit
          </h3>
          <p className="text-[13px] text-zinc-500">Detection of biases, logical leaps, and critical data gaps.</p>
        </div>
        <Button variant="outline" size="sm" onClick={generateBlindspots} disabled={loading} className="border-white/10 text-white hover:bg-white/5 h-9">
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShieldAlert className="h-4 w-4 mr-2 text-zinc-400" />}
          Re-audit System
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence>
          {blindspots.map((spot, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden group hover:border-white/20 transition-all">
                <div className="flex flex-col md:flex-row">
                  <div className="p-8 md:w-1/2 border-b md:border-b-0 md:border-r border-white/5">
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`text-[10px] font-medium uppercase tracking-widest px-2 py-0.5 rounded border ${
                        spot.impact === 'High' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        spot.impact === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                      }`}>
                        {spot.impact}
                      </span>
                      <span className="text-[10px] text-zinc-600 font-medium uppercase tracking-widest">{spot.area}</span>
                    </div>
                    <h4 className="text-[18px] font-semibold text-white leading-tight mb-4">{spot.finding}</h4>
                    {spot.biasType && (
                      <div className="inline-flex items-center px-2 py-0.5 rounded bg-white/5 text-zinc-500 border border-white/5 text-[10px] font-medium">
                        {spot.biasType}
                      </div>
                    )}
                  </div>
                  <div className="p-8 md:w-1/2 bg-white/[0.01] flex flex-col gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle2 className="h-3.5 w-3.5 text-zinc-500" />
                        <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">Recommended Mitigation</span>
                      </div>
                      <p className="text-zinc-300 text-[14px] leading-relaxed italic font-light">
                        &ldquo;{spot.mitigation}&rdquo;
                      </p>
                    </div>
                    {spot.evidenceNeeded && (
                      <div className="pt-4 border-t border-white/5">
                        <div className="flex items-center gap-2 mb-2">
                          <Search className="h-3 w-3 text-zinc-600" />
                          <span className="text-[10px] font-medium text-zinc-600 uppercase tracking-widest">Data Gap Detected</span>
                        </div>
                        <p className="text-zinc-500 text-[12px] leading-relaxed">
                          {spot.evidenceNeeded}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {loading && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center rounded-xl">
          <Loader2 className="h-6 w-6 text-zinc-400 animate-spin mb-4" />
          <p className="text-white font-medium text-[13px] tracking-widest uppercase">Analyzing cognitive space...</p>
        </div>
      )}
    </div>
  );
});
