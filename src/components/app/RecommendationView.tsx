"use client";

import { useState, memo } from "react";
import { insforge } from "@/lib/insforge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle, Target, AlertTriangle, MessageSquare, ShieldCheck, Zap, BarChart3, X, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateConfidence } from "@/lib/ai/core/confidence_engine";
import type { RecommendationResult, ConfidenceFactor } from "@/lib/types";

export const RecommendationView = memo(function RecommendationView({ project, onAnalysisComplete }: { project: any, onAnalysisComplete?: (data: any) => void }) {
  const [recommendation, setRecommendation] = useState<RecommendationResult | null>(project.last_recommendation || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCommitModal, setShowCommitModal] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [projectStatus, setProjectStatus] = useState(project.status);

  // Calculate decomposed confidence
  const confidenceData = recommendation ? calculateConfidence({
    evidenceCount: project._evidenceCount ?? 0,
    contradictionCount: project.last_contradictions?.length ?? 0,
    blindspotCount: project.last_blindspots?.length ?? 0,
    highImpactBlindspots: project.last_blindspots?.filter((b: any) => b.impact === 'High')?.length ?? 0,
    debateCompleted: !!recommendation.debateSummary,
    scenarioCount: project.last_scenarios?.length ?? 0,
    hasGoals: !!project.goals,
    hasProblemStatement: !!project.problem_statement,
    rawAIScore: recommendation.confidenceScore,
  }) : null;

  async function generateRecommendation() {
    setLoading(true);
    setError(null);
    try {
      const { data: evidenceList } = await insforge.database.from('evidence').select('*').eq('project_id', project.id);
      const authHeader = insforge.getHttpClient().getHeaders()['Authorization'];
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': authHeader || '' },
        body: JSON.stringify({ project: { ...project, _evidenceCount: evidenceList?.length ?? 0 }, evidenceList: evidenceList || [], action: 'recommendation' })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate recommendation');
      setRecommendation(data);
      if (onAnalysisComplete) onAnalysisComplete(data);
      await insforge.database.from('projects').update({ last_recommendation: data }).eq('id', project.id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCommitDecision() {
    setCommitting(true);
    try {
      const { error } = await insforge.database
        .from('projects')
        .update({ status: 'DECIDED', decided_at: new Date().toISOString() })
        .eq('id', project.id);
      if (error) throw error;

      await insforge.database.from('decision_events').insert({
        project_id: project.id,
        event_type: 'DECISION_FINALIZED',
        title: 'Strategic Commitment Finalized',
        description: 'The recommended strategy has been formally adopted.',
        metadata: recommendation
      });
      await insforge.database.from('project_activity').insert({
        project_id: project.id,
        action: 'decision.finalized',
        details: `Committed to: ${recommendation?.recommendation}`,
      });

      setProjectStatus('DECIDED');
      setShowCommitModal(false);
    } catch (err: any) {
      setError('Failed to commit decision: ' + err.message);
    } finally {
      setCommitting(false);
    }
  }

  // ─── Empty State ──────────────────────────────────────────
  if (!recommendation && !loading) {
    return (
      <div className="text-center py-24 border border-white/[0.05] rounded-xl bg-[#0a0a0a]/50 border-dashed max-w-3xl mx-auto">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-white/5 border border-white/10 mb-6">
          <ShieldCheck className="h-6 w-6 text-zinc-400" />
        </div>
        <h3 className="text-[18px] font-medium text-white mb-2">Synthesize Strategic Recommendation</h3>
        <p className="text-[14px] text-zinc-500 max-w-md mx-auto mb-8">
          Formulate a definitive, actionable path forward by weighing all scenarios and evidence.
        </p>
        <Button onClick={generateRecommendation} className="bg-white hover:bg-zinc-200 text-black font-medium px-8 h-10 transition-colors rounded-md shadow-sm">
          Formulate Decision
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h3 className="text-[16px] font-medium text-white flex items-center gap-2">
            Strategic Synthesis
          </h3>
          <p className="text-[13px] text-zinc-500">Integrated intelligence output and execution path.</p>
        </div>
        <div className="flex gap-2">
          {projectStatus !== 'DECIDED' && (
            <Button variant="outline" size="sm" onClick={generateRecommendation} disabled={loading} className="border-white/10 text-white hover:bg-white/5 h-9">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2 text-zinc-400" />}
              Regenerate Analysis
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-[13px] text-red-400 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)}><X className="h-4 w-4" /></button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Recommendation */}
        <div className="lg:col-span-2 space-y-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden shadow-2xl relative">
              <div className="p-8 md:p-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2 px-2 py-0.5 rounded border border-white/5 bg-white/[0.02]">
                    <ShieldCheck className="h-3.5 w-3.5 text-zinc-400" />
                    <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest">Verified Strategy</span>
                  </div>
                  {projectStatus === 'DECIDED' ? (
                    <span className="text-[11px] font-medium text-emerald-400 uppercase tracking-widest">
                      Decision Committed
                    </span>
                  ) : (
                    <Button
                      onClick={() => setShowCommitModal(true)}
                      className="bg-white hover:bg-zinc-200 text-black font-medium h-8 px-4 text-[12px] rounded-md transition-colors"
                    >
                      Commit Decision
                    </Button>
                  )}
                </div>
                
                <h2 className="text-[28px] font-bold text-white leading-tight mb-6 tracking-tight">
                  {recommendation!.recommendation}
                </h2>
                
                <p className="text-[16px] text-zinc-400 leading-relaxed font-light italic border-l border-white/10 pl-6">
                  {recommendation!.rationale}
                </p>
              </div>
            </div>
          </motion.div>

          {recommendation!.debateSummary && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-8">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="h-4 w-4 text-zinc-500" />
                  <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-widest">Synthesis of Deliberation</span>
                </div>
                <p className="text-zinc-300 leading-relaxed text-[15px] italic">
                  &ldquo;{recommendation!.debateSummary}&rdquo;
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Confidence & Risks */}
        <div className="space-y-8">
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
            <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-8">
              <h4 className="text-[11px] font-medium text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Target className="h-4 w-4" /> Confidence Assessment
              </h4>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-[42px] font-bold text-white leading-none">
                  {confidenceData?.overallScore ?? recommendation!.confidenceScore}%
                </span>
                <span className={`text-[10px] font-medium uppercase tracking-widest px-1.5 py-0.5 rounded border ${
                  confidenceData?.grade === 'HIGH' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  confidenceData?.grade === 'MODERATE' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                  'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                  {confidenceData?.grade}
                </span>
              </div>

              <div className="space-y-5 pt-4 border-t border-white/5">
                {confidenceData?.factors.map((factor) => (
                  <div key={factor.name} className="space-y-2 group">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-zinc-500">{factor.name}</span>
                      <span className="text-white font-mono">{factor.score}</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          factor.score >= 70 ? 'bg-emerald-500' :
                          factor.score >= 40 ? 'bg-zinc-500' :
                          'bg-zinc-700'
                        }`}
                        style={{ width: `${factor.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
            <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-8">
              <h4 className="text-[11px] font-medium text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Strategic Risks
              </h4>
              <ul className="space-y-4">
                {recommendation!.keyRisks.map((risk, index) => (
                  <li key={index} className="text-[13px] text-zinc-400 flex items-start gap-3">
                    <div className="w-1 h-1 rounded-full bg-zinc-600 mt-2 shrink-0" />
                    <span className="leading-relaxed">{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {showCommitModal && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-6" onClick={() => setShowCommitModal(false)}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-black border border-white/10 rounded-xl p-8 max-w-lg w-full shadow-2xl"
            >
              <h3 className="text-[18px] font-bold text-white mb-2">Finalize Strategic Commitment</h3>
              <p className="text-[13px] text-zinc-500 mb-8 leading-relaxed">
                Confirming this decision will mark the project as decided and lock the recommendation in the audit trail.
              </p>

              <div className="p-5 bg-white/5 border border-white/10 rounded-lg mb-8">
                <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest block mb-2">Selected Path</span>
                <p className="text-[14px] text-white font-medium">{recommendation!.recommendation}</p>
              </div>

              <div className="flex gap-3 justify-end">
                <Button variant="ghost" onClick={() => setShowCommitModal(false)} className="text-zinc-500 hover:text-white h-10">
                  Cancel
                </Button>
                <Button
                  onClick={handleCommitDecision}
                  disabled={committing}
                  className="bg-white hover:bg-zinc-200 text-black font-medium h-10 px-6 rounded-md"
                >
                  {committing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Confirm & Commit
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {loading && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[110] flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 text-zinc-400 animate-spin mb-6" />
          <h4 className="text-white text-[14px] font-medium uppercase tracking-widest animate-pulse">Formulating Decision</h4>
          <p className="text-zinc-500 text-[11px] mt-2">Synthesizing analytical consensus...</p>
        </div>
      )}
    </div>
  );
});
