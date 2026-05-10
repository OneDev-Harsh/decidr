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
      <Card className="bg-white/5 border-white/10 p-20 text-center border-dashed glass-card">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-maroon/20 mb-6">
          <ShieldAlert className="h-8 w-8 text-brand-crimson" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Audit for Cognitive Blindspots</h3>
        <p className="text-gray-400 max-w-md mx-auto mb-8">
          The Blindspot Agent identifies missing evidence, logical leaps, and confirmation bias within your project context to ensure a balanced decision.
        </p>
        <Button onClick={generateBlindspots} className="bg-brand-maroon hover:bg-brand-crimson text-white px-8 h-12 text-lg">
          <EyeOff className="mr-2 h-4 w-4" /> Run Blindspot Audit
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-8 relative">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <EyeOff className="h-5 w-5 text-brand-crimson" /> Cognitive Audit
          </h3>
          <p className="text-sm text-gray-400">Detection of biases, logical leaps, and critical data gaps.</p>
        </div>
        <Button variant="outline" size="sm" onClick={generateBlindspots} disabled={loading} className="border-white/10 text-gray-300">
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShieldAlert className="h-4 w-4 mr-2" />}
          Re-audit
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence>
          {blindspots.map((spot, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-white/5 border-white/10 glass-card border-l-4 overflow-hidden" style={{ borderLeftColor: spot.impact === 'High' ? '#ef4444' : spot.impact === 'Medium' ? '#f59e0b' : '#3b82f6' }}>
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className="p-8 md:w-1/2 border-b md:border-b-0 md:border-r border-white/5">
                      <div className="flex items-center gap-2 mb-4 flex-wrap">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                          spot.impact === 'High' ? 'bg-red-500/10 text-red-500' :
                          spot.impact === 'Medium' ? 'bg-amber-500/10 text-amber-500' :
                          'bg-blue-500/10 text-blue-500'
                        }`}>
                          {spot.impact} Criticality
                        </span>
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">— {spot.area}</span>
                        {spot.biasType && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-gray-400 border border-white/10 font-medium">
                            {spot.biasType}
                          </span>
                        )}
                      </div>
                      <h4 className="text-xl font-bold text-white mb-4 leading-tight">{spot.finding}</h4>
                    </div>
                    <div className="p-8 md:w-1/2 bg-white/[0.02] flex flex-col gap-6">
                      <div>
                        <div className="flex items-center gap-2 mb-3 text-emerald-500">
                          <CheckCircle2 className="h-4 w-4" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Recommended Mitigation</span>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed italic">
                          &ldquo;{spot.mitigation}&rdquo;
                        </p>
                      </div>
                      {spot.evidenceNeeded && (
                        <div>
                          <div className="flex items-center gap-2 mb-2 text-blue-400">
                            <Search className="h-3.5 w-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Evidence Needed</span>
                          </div>
                          <p className="text-gray-400 text-xs leading-relaxed">
                            {spot.evidenceNeeded}
                          </p>
                        </div>
                      )}
                      <button className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-crimson hover:text-white transition-colors flex items-center mt-auto">
                        Add Evidence to Resolve <ChevronRight className="ml-1 h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {loading && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-xl">
          <div className="relative mb-4">
            <div className="h-16 w-16 rounded-full border-b-2 border-brand-crimson animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <EyeOff className="h-6 w-6 text-brand-crimson animate-pulse" />
            </div>
          </div>
          <p className="text-white font-medium text-sm animate-pulse tracking-widest uppercase">Auditing Cognitive Space</p>
        </div>
      )}
    </div>
  );
});
