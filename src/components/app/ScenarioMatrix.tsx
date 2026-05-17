"use client";

import { useState, memo, useEffect } from "react";
import { insforge } from "@/lib/insforge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, GitMerge, AlertTriangle, CheckCircle2, XCircle, TrendingUp, X, SlidersHorizontal, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Scenario {
  type?: string;
  title: string;
  description: string;
  sensitivityVariable?: string;
  probability?: number;
  baseProbability?: number; // Store original
  cascadingEffects?: string[];
  strategicPivot?: string;
  pros: string[];
  cons: string[];
  riskLevel: string;
  baseRiskLevel?: string; // Store original
  scores?: Record<string, number>;
}

export const ScenarioMatrix = memo(function ScenarioMatrix({ project, onAnalysisComplete }: { project: any, onAnalysisComplete?: (data: any) => void }) {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dynamic Simulation Variables
  const [budgetConstraint, setBudgetConstraint] = useState(50); // 0 = strict, 100 = unlimited
  const [timelineAggression, setTimelineAggression] = useState(50); // 0 = slow, 100 = fast
  const [marketVolatility, setMarketVolatility] = useState(50); // 0 = stable, 100 = chaotic

  useEffect(() => {
    if (project.last_scenarios && scenarios.length === 0) {
      // Initialize scenarios with base values for simulation
      const initScenarios = project.last_scenarios.map((s: any) => ({
        ...s,
        baseProbability: s.probability || 50,
        baseRiskLevel: s.riskLevel || 'Medium'
      }));
      setScenarios(initScenarios);
    }
  }, [project.last_scenarios]);

  // Simulation Engine: Cascading Effects
  useEffect(() => {
    if (scenarios.length === 0) return;

    setScenarios(prev => prev.map(s => {
      let newProb = s.baseProbability || 50;
      let newRisk = s.baseRiskLevel || 'Medium';

      // Simulate complex cascading logic
      if (s.title.toLowerCase().includes("aggressive") || s.title.toLowerCase().includes("fast")) {
        newProb += (timelineAggression - 50) * 0.4;
        if (budgetConstraint < 40) newRisk = "High";
      }
      
      if (s.title.toLowerCase().includes("conservative") || s.title.toLowerCase().includes("safe")) {
        newProb -= (timelineAggression - 50) * 0.3;
        if (marketVolatility > 70) newProb -= 15;
      }

      if (s.title.toLowerCase().includes("market") || s.title.toLowerCase().includes("competitor")) {
        newProb += (marketVolatility - 50) * 0.5;
        if (marketVolatility > 80) newRisk = "High";
      }

      newProb = Math.max(5, Math.min(95, Math.round(newProb)));

      // Adjust risk dynamically based on probability shifts
      if (newProb > 80 && newRisk === "High") newRisk = "Medium"; // High prob of high risk might just be the baseline now
      if (budgetConstraint < 20 && timelineAggression > 80) newRisk = "High"; // Stress test failure

      return {
        ...s,
        probability: newProb,
        riskLevel: newRisk
      };
    }));
  }, [budgetConstraint, timelineAggression, marketVolatility]);

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

      const newScenarios = (data.scenarios || []).map((s: any) => ({
        ...s,
        baseProbability: s.probability || 50,
        baseRiskLevel: s.riskLevel || 'Medium'
      }));
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
        <h3 className="text-[18px] font-medium text-white mb-2">Initialize Simulation Engine</h3>
        <p className="text-[14px] text-zinc-500 max-w-md mx-auto mb-8">
          Generate the baseline strategic matrix to enable dynamic variable stress-testing and cascading outcome simulation.
        </p>
        <Button onClick={generateScenarios} className="bg-white hover:bg-zinc-200 text-black font-medium px-8 h-10 transition-colors rounded-md shadow-sm">
          Initialize Simulation
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h3 className="text-[18px] font-bold text-white flex items-center gap-2 uppercase tracking-tight">
            Dynamic Decision Simulation
          </h3>
          <p className="text-[13px] text-zinc-500">Adjust operational variables to observe cascading strategic impacts in real-time.</p>
        </div>
        <Button variant="outline" size="sm" onClick={generateScenarios} disabled={loading} className="border-white/10 text-white hover:bg-white/5 h-9">
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <GitMerge className="h-4 w-4 mr-2 text-zinc-400" />}
          Regenerate Baseline
        </Button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-[13px] text-red-400 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)}><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Simulation Control Panel */}
      {scenarios.length > 0 && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Activity className="h-24 w-24 text-white" />
          </div>
          
          <div className="flex items-center gap-2 mb-6 relative z-10">
            <SlidersHorizontal className="h-4 w-4 text-zinc-400" />
            <h4 className="text-[12px] font-bold text-zinc-300 uppercase tracking-widest">Operational Stress Variables</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Budget Constraint</label>
                <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">{budgetConstraint}%</span>
              </div>
              <input 
                type="range" min="0" max="100" value={budgetConstraint} 
                onChange={(e) => setBudgetConstraint(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-brand-crimson"
              />
              <div className="flex justify-between text-[9px] text-zinc-600 uppercase tracking-widest">
                <span>Strict</span><span>Unlimited</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Timeline Aggression</label>
                <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">{timelineAggression}%</span>
              </div>
              <input 
                type="range" min="0" max="100" value={timelineAggression} 
                onChange={(e) => setTimelineAggression(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
              />
              <div className="flex justify-between text-[9px] text-zinc-600 uppercase tracking-widest">
                <span>Conservative</span><span>Aggressive</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Market Volatility</label>
                <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">{marketVolatility}%</span>
              </div>
              <input 
                type="range" min="0" max="100" value={marketVolatility} 
                onChange={(e) => setMarketVolatility(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-[9px] text-zinc-600 uppercase tracking-widest">
                <span>Stable</span><span>Chaotic</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {scenarios.map((scenario, index) => {
              // Determine heatmap color based on dynamic probability
              const prob = scenario.probability || 0;
              const isHighProb = prob > 70;
              const isLowProb = prob < 30;
              
              return (
                <motion.div
                  key={index}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="h-full"
                >
                  <div className={`bg-zinc-950 border rounded-xl h-full flex flex-col group relative overflow-hidden transition-all duration-500 ${
                    isHighProb ? 'border-brand-crimson/30 shadow-[0_0_30px_rgba(220,38,38,0.05)]' : 
                    isLowProb ? 'border-white/5' : 'border-white/10 hover:border-white/20'
                  }`}>
                    
                    {/* Dynamic Heatmap Glow */}
                    <div 
                      className={`absolute inset-0 opacity-20 transition-opacity duration-1000 -z-10`}
                      style={{ 
                        background: isHighProb ? `radial-gradient(circle at 50% 0%, rgba(220,38,38,${(prob-70)/100}), transparent 70%)` : 
                                    isLowProb ? `radial-gradient(circle at 50% 0%, rgba(100,100,100,${(30-prob)/100}), transparent 70%)` : 'none'
                      }}
                    />

                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <motion.span 
                          layout
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest border transition-colors ${
                          scenario.riskLevel === 'High' ? 'bg-red-500/10 text-brand-crimson border-brand-crimson/20' :
                          scenario.riskLevel === 'Medium' ? 'bg-zinc-900 text-zinc-400 border-zinc-800' :
                          'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                        }`}>
                          {scenario.riskLevel} Risk
                        </motion.span>
                        {scenario.probability !== undefined && (
                          <div className="flex items-center gap-2">
                            <motion.span 
                              key={scenario.probability}
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`text-[12px] font-bold font-mono ${isHighProb ? 'text-brand-crimson' : isLowProb ? 'text-zinc-600' : 'text-zinc-300'}`}
                            >
                              {scenario.probability}%
                            </motion.span>
                            <div className="w-16 h-1 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                              <motion.div 
                                className={`h-full ${isHighProb ? 'bg-brand-crimson' : isLowProb ? 'bg-zinc-600' : 'bg-zinc-300'}`} 
                                initial={{ width: 0 }}
                                animate={{ width: `${scenario.probability}%` }}
                                transition={{ type: "spring", stiffness: 50, damping: 15 }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <h4 className="text-[16px] font-bold text-white mb-3 group-hover:text-zinc-200 transition-colors tracking-tight">
                        {scenario.title}
                      </h4>
                      
                      <p className="text-[13px] text-zinc-400 leading-relaxed mb-6 font-medium">
                        {scenario.description}
                      </p>
                      
                      <div className="mt-auto space-y-6">
                        {scenario.sensitivityVariable && (
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-black/50 border border-white/5 rounded-lg">
                              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Pivot</span>
                              <p className="text-[11px] text-zinc-300 font-medium leading-tight">{scenario.sensitivityVariable}</p>
                            </div>
                            <div className="p-3 bg-black/50 border border-white/5 rounded-lg">
                              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Status</span>
                              <p className="text-[11px] text-zinc-300 font-medium leading-tight">Projected</p>
                            </div>
                          </div>
                        )}

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center">
                              Strategic Pros
                            </h5>
                            <ul className="space-y-1.5">
                              {scenario.pros.slice(0, 2).map((pro, i) => (
                                <li key={i} className="text-[12px] text-zinc-400 flex items-start font-medium">
                                  <span className="text-zinc-600 mr-2">•</span> {pro}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="space-y-2 pt-4 border-t border-white/5">
                            <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center">
                              Strategic Cons
                            </h5>
                            <ul className="space-y-1.5">
                              {scenario.cons.slice(0, 2).map((con, i) => (
                                <li key={i} className="text-[12px] text-zinc-400 flex items-start font-medium">
                                  <span className="text-zinc-600 mr-2">•</span> {con}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {loading && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-2xl">
            <div className="h-12 w-12 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center mb-4">
              <Loader2 className="h-5 w-5 animate-spin text-zinc-300" />
            </div>
            <p className="text-white font-bold text-[12px] tracking-widest uppercase">Synthesizing Baseline Matrix...</p>
          </div>
        )}
      </div>
    </div>
  );
});
