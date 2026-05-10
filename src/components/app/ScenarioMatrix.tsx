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
      <Card className="bg-white/5 border-white/10 p-20 text-center border-dashed glass-card">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-maroon/20 mb-6">
          <GitMerge className="h-8 w-8 text-brand-crimson" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Simulate Strategic Outcomes</h3>
        <p className="text-gray-400 max-w-md mx-auto mb-8">
          Decidr generates multiple strategic scenarios based on your evidence, allowing you to stress-test your decision against different variables.
        </p>
        <Button onClick={generateScenarios} className="bg-brand-maroon hover:bg-brand-crimson text-white px-8 h-12 text-lg">
          Generate Scenario Matrix
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-brand-crimson" /> Scenario Planning
          </h3>
          <p className="text-sm text-gray-400">Stress-testing the decision against market and technical variables.</p>
        </div>
        <Button variant="outline" size="sm" onClick={generateScenarios} disabled={loading} className="border-white/10 text-gray-300">
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <GitMerge className="h-4 w-4 mr-2" />}
          Regenerate Matrix
        </Button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-brand-crimson/10 border border-brand-crimson/20 text-sm text-brand-crimson flex items-center justify-between">
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="h-full"
            >
              <Card className="bg-white/5 border-white/10 h-full flex flex-col glass-card glass-card-hover group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                  <GitMerge className="h-12 w-12 text-white" />
                </div>
                
                <CardHeader className="pb-4 relative z-10">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
                      scenario.riskLevel === 'High' ? 'bg-red-500/10 text-red-500' :
                      scenario.riskLevel === 'Medium' ? 'bg-amber-500/10 text-amber-500' :
                      'bg-emerald-500/10 text-emerald-500'
                    }`}>
                      <AlertTriangle className="mr-1 h-3 w-3" />
                      {scenario.riskLevel} Risk
                    </span>
                    {scenario.probability !== undefined && (
                      <div className="flex items-center gap-1.5">
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">P({scenario.probability}%)</div>
                        <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-crimson" style={{ width: `${scenario.probability}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-xl text-white group-hover:text-brand-crimson transition-colors duration-300">
                    {scenario.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col gap-6 relative z-10">
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {scenario.description}
                  </p>
                  
                   {scenario.sensitivityVariable && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-black/40 rounded-lg border border-white/5">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Sensitivity Pivot</span>
                        <p className="text-xs text-brand-crimson font-medium">{scenario.sensitivityVariable}</p>
                      </div>
                      {scenario.probability !== undefined && (
                        <div className="p-3 bg-black/40 rounded-lg border border-white/5">
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Probability</span>
                          <p className="text-xs text-white font-mono">{scenario.probability}%</p>
                        </div>
                      )}
                    </div>
                  )}

                  {scenario.cascadingEffects && scenario.cascadingEffects.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center">
                        <GitMerge className="mr-2 h-3 w-3" /> Cascading Effects
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {scenario.cascadingEffects.map((effect, i) => (
                          <span key={i} className="text-[9px] px-2 py-1 bg-white/5 border border-white/5 rounded-md text-gray-400">
                            {effect}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {scenario.strategicPivot && (
                    <div className="p-3 bg-brand-crimson/5 border border-brand-crimson/20 rounded-lg">
                      <span className="text-[10px] font-bold text-brand-crimson uppercase tracking-widest block mb-1">Strategic Pivot</span>
                      <p className="text-xs text-gray-300 leading-relaxed italic">{scenario.strategicPivot}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-3">
                      <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center">
                        <CheckCircle2 className="mr-2 h-3 w-3 text-emerald-500" /> Strategic Pros
                      </h5>
                      <ul className="space-y-2">
                        {scenario.pros.map((pro, i) => (
                          <li key={i} className="text-xs text-gray-300 flex items-start">
                            <span className="text-emerald-500 mr-2">•</span> {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="space-y-3 pt-4 border-t border-white/5">
                      <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center">
                        <XCircle className="mr-2 h-3 w-3 text-brand-crimson" /> Critical Cons
                      </h5>
                      <ul className="space-y-2">
                        {scenario.cons.map((con, i) => (
                          <li key={i} className="text-xs text-gray-300 flex items-start">
                            <span className="text-brand-crimson mr-2">•</span> {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {scenario.scores && (
                    <div className="pt-6 border-t border-white/5">
                      <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Strategic Impact</h5>
                      <div className="space-y-3">
                        {Object.entries(scenario.scores).map(([key, value]) => (
                          <div key={key} className="space-y-1">
                            <div className="flex justify-between text-[10px]">
                              <span className="text-gray-400 capitalize">{key.replace('_', ' ')}</span>
                              <span className="text-white font-mono">{value}/10</span>
                            </div>
                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${value * 10}%` }}
                                className={`h-full rounded-full ${
                                  value >= 8 ? 'bg-emerald-500' : 
                                  value >= 5 ? 'bg-amber-500' : 
                                  'bg-brand-crimson'
                                }`}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
              <GitMerge className="h-6 w-6 text-brand-crimson animate-pulse" />
            </div>
          </div>
          <p className="text-white font-medium text-sm animate-pulse tracking-widest uppercase">Simulating Parallel Futures...</p>
        </div>
      )}
      </div>
    </div>
  );
});
