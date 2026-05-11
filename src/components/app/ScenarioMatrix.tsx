"use client";

import { useState, memo } from "react";
import { insforge } from "@/lib/insforge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, GitMerge, AlertTriangle, CheckCircle2, XCircle, TrendingUp, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Scenario {
  type?: string;
  title: string;
  description: string;
  sensitivityVariable?: string;
  probability?: number;
  cascadingEffects?: string[];
  strategicPivot?: string;
  pros: string[];
  cons: string[];
  riskLevel: string;
  scores?: Record<string, number>;
}

export const ScenarioMatrix = memo(function ScenarioMatrix({ project, onAnalysisComplete }: { project: any, onAnalysisComplete?: (data: any) => void }) {
  const [scenarios, setScenarios] = useState<Scenario[]>(project.last_scenarios || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generateScenarios() {
    setLoading(true);
    setError(null);

    try {
      const { data: evidenceList } = await insforge.database.from('evidence').select('*').eq('project_id', project.id);
      
      const authHeader = insforge.getHttpClient().getHeaders()['Authorization'];
      const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': authHeader || ''
        },
        body: JSON.stringify({ project, evidenceList: evidenceList || [], action: 'scenarios' })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate scenarios');

      const newScenarios = data.scenarios || [];
      setScenarios(newScenarios);

      if (onAnalysisComplete) onAnalysisComplete(data);

      await insforge.database
        .from('projects')
        .update({ last_scenarios: newScenarios })
        .eq('id', project.id);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (scenarios.length === 0 && !loading) {
    return (
      <div className="text-center py-24 border border-white/[0.05] rounded-xl bg-[#0a0a0a]/50 border-dashed max-w-3xl mx-auto">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-white/5 border border-white/10 mb-6">
          <GitMerge className="h-6 w-6 text-zinc-400" />
        </div>
        <h3 className="text-[18px] font-medium text-white mb-2">Simulate Strategic Outcomes</h3>
        <p className="text-[14px] text-zinc-500 max-w-md mx-auto mb-8">
          Generate multiple strategic scenarios based on your evidence to stress-test your decision against different variables.
        </p>
        <Button onClick={generateScenarios} className="bg-white hover:bg-zinc-200 text-black font-medium px-8 h-10 transition-colors rounded-md shadow-sm">
          Generate Scenario Matrix
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h3 className="text-[16px] font-medium text-white flex items-center gap-2">
            Scenario Planning
          </h3>
          <p className="text-[13px] text-zinc-500">Stress-testing the decision against market and technical variables.</p>
        </div>
        <Button variant="outline" size="sm" onClick={generateScenarios} disabled={loading} className="border-white/10 text-white hover:bg-white/5 h-9">
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <GitMerge className="h-4 w-4 mr-2 text-zinc-400" />}
          Regenerate Matrix
        </Button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-[13px] text-red-400 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)}><X className="h-4 w-4" /></button>
        </div>
      )}

      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {scenarios.map((scenario, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="h-full"
              >
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl h-full flex flex-col group relative overflow-hidden hover:border-white/20 transition-all">
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium border ${
                        scenario.riskLevel === 'High' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        scenario.riskLevel === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}>
                        {scenario.riskLevel} Risk
                      </span>
                      {scenario.probability !== undefined && (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-medium text-zinc-500 font-mono">{scenario.probability}%</span>
                          <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-zinc-400" style={{ width: `${scenario.probability}%` }} />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <h4 className="text-[16px] font-semibold text-white mb-3 group-hover:text-zinc-200 transition-colors">
                      {scenario.title}
                    </h4>
                    
                    <p className="text-[13px] text-zinc-400 leading-relaxed mb-6">
                      {scenario.description}
                    </p>
                    
                    <div className="mt-auto space-y-6">
                      {scenario.sensitivityVariable && (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-black border border-white/5 rounded-lg">
                            <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider block mb-1">Pivot</span>
                            <p className="text-[12px] text-white font-medium">{scenario.sensitivityVariable}</p>
                          </div>
                          <div className="p-3 bg-black border border-white/5 rounded-lg">
                            <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider block mb-1">Status</span>
                            <p className="text-[12px] text-white font-medium">Projected</p>
                          </div>
                        </div>
                      )}

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <h5 className="text-[11px] font-medium text-zinc-500 uppercase tracking-widest flex items-center">
                            Strategic Pros
                          </h5>
                          <ul className="space-y-1.5">
                            {scenario.pros.slice(0, 2).map((pro, i) => (
                              <li key={i} className="text-[12px] text-zinc-300 flex items-start">
                                <span className="text-zinc-500 mr-2">•</span> {pro}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="space-y-2 pt-4 border-t border-white/5">
                          <h5 className="text-[11px] font-medium text-zinc-500 uppercase tracking-widest flex items-center">
                            Strategic Cons
                          </h5>
                          <ul className="space-y-1.5">
                            {scenario.cons.slice(0, 2).map((con, i) => (
                              <li key={i} className="text-[12px] text-zinc-300 flex items-start">
                                <span className="text-zinc-500 mr-2">•</span> {con}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {scenario.scores && (
                        <div className="pt-4 border-t border-white/5 space-y-3">
                          {Object.entries(scenario.scores).slice(0, 2).map(([key, value]) => (
                            <div key={key} className="space-y-1.5">
                              <div className="flex justify-between text-[11px]">
                                <span className="text-zinc-500 capitalize">{key.replace('_', ' ')}</span>
                                <span className="text-white font-mono">{value}/10</span>
                              </div>
                              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-zinc-500 rounded-full" style={{ width: `${value * 10}%` }} />
                              </div>
                            </div>
                          ))}
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
            <Loader2 className="h-6 w-6 animate-spin text-zinc-400 mb-4" />
            <p className="text-white font-medium text-[13px] tracking-widest uppercase">Analyzing scenarios...</p>
          </div>
        )}
      </div>
    </div>
  );
});
