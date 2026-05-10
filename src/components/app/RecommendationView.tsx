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
      <Card className="bg-white/5 border-white/10 p-20 text-center border-dashed glass-card relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-maroon/5 to-transparent opacity-50" />
        <div className="relative z-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-maroon/20 mb-6">
            <ShieldCheck className="h-8 w-8 text-brand-crimson" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Synthesize Strategic Recommendation</h3>
          <p className="text-gray-400 max-w-md mx-auto mb-8">
            Decidr weighs all parallel scenarios, blindspots, and debates to produce a definitive, actionable path forward with a quantifiable confidence score.
          </p>
          {error && <p className="text-sm text-brand-crimson mb-4">{error}</p>}
          <Button onClick={generateRecommendation} className="bg-brand-maroon hover:bg-brand-crimson text-white px-8 h-12 text-lg shadow-lg shadow-brand-maroon/20">
            <Zap className="mr-2 h-4 w-4 fill-current" /> Formulate Decision
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-brand-crimson" /> Strategic Recommendation
          </h3>
          <p className="text-sm text-gray-400">Integrated intelligence output and path to execution.</p>
        </div>
        <div className="flex gap-3">
          {projectStatus !== 'DECIDED' && (
            <Button variant="outline" size="sm" onClick={generateRecommendation} disabled={loading} className="border-white/10 text-gray-300">
              Regenerate
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-brand-crimson/10 border border-brand-crimson/20 text-sm text-brand-crimson flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)}><X className="h-4 w-4" /></button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Recommendation */}
        <div className="lg:col-span-2 space-y-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="bg-brand-maroon/10 border-brand-maroon/30 shadow-2xl shadow-brand-maroon/5 relative overflow-hidden glass-card">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-crimson" />
              <CardContent className="p-10">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-brand-crimson">
                      <ShieldCheck className="h-4 w-4" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Verified Strategy</span>
                    </div>
                    {projectStatus === 'DECIDED' ? (
                      <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 tracking-wide">
                        DECISION COMMITTED
                      </span>
                    ) : (
                      <Button
                        onClick={() => setShowCommitModal(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 px-6 font-bold uppercase tracking-wider"
                      >
                        Commit to Decision
                      </Button>
                    )}
                  </div>
                  <h2 className="text-3xl font-black text-white leading-[1.1] tracking-tight">{recommendation!.recommendation}</h2>
                  <p className="text-gray-300 leading-relaxed text-lg font-light italic">{recommendation!.rationale}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Debate Summary */}
          {recommendation!.debateSummary && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="bg-white/5 border-white/10 border-l-2 border-l-brand-crimson glass-card">
                <CardContent className="p-8">
                  <div className="flex items-center gap-2 mb-6">
                    <MessageSquare className="h-4 w-4 text-brand-crimson" />
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Synthesis of Debate Log</span>
                  </div>
                  <p className="text-gray-400 leading-relaxed italic text-lg">&ldquo;{recommendation!.debateSummary}&rdquo;</p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Right Column: Confidence + Risks */}
        <div className="space-y-8">
          {/* Decomposed Confidence */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
            <Card className="bg-white/5 border-white/10 glass-card">
              <CardContent className="p-8">
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-6 flex items-center">
                  <Target className="mr-2 h-4 w-4" /> Confidence Metric
                </h4>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-5xl font-black text-white tracking-tighter">{confidenceData?.overallScore ?? recommendation!.confidenceScore}</span>
                  <span className="text-xl text-gray-600 font-bold">%</span>
                </div>
                {confidenceData && (
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded inline-block mb-6 ${
                    confidenceData.grade === 'HIGH' ? 'bg-emerald-500/10 text-emerald-500' :
                    confidenceData.grade === 'MODERATE' ? 'bg-amber-500/10 text-amber-500' :
                    'bg-red-500/10 text-red-500'
                  }`}>
                    {confidenceData.grade} CONFIDENCE
                  </span>
                )}

                {/* Factor Breakdown */}
                {confidenceData && (
                  <div className="space-y-4 mt-4">
                    <h5 className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Factor Breakdown</h5>
                    {confidenceData.factors.map((factor) => (
                      <div key={factor.name} className="space-y-1.5 group">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-gray-400">{factor.name}</span>
                          <span className="text-white font-mono">{factor.score}</span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${factor.score}%` }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className={`h-full rounded-full ${
                              factor.score >= 70 ? 'bg-emerald-500' :
                              factor.score >= 40 ? 'bg-amber-500' :
                              'bg-brand-crimson'
                            }`}
                          />
                        </div>
                        <p className="text-[9px] text-gray-600 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity">{factor.explanation}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Caveats */}
                {confidenceData && confidenceData.caveats.length > 0 && (
                  <div className="mt-6 p-3 bg-amber-500/5 rounded-lg border border-amber-500/10">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Info className="h-3 w-3 text-amber-500" />
                      <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Caveats</span>
                    </div>
                    <ul className="space-y-1">
                      {confidenceData.caveats.map((caveat, i) => (
                        <li key={i} className="text-[10px] text-gray-500 leading-relaxed">• {caveat}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Residual Risks */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
            <Card className="bg-white/5 border-white/10 glass-card">
              <CardContent className="p-8">
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-6 flex items-center">
                  <AlertTriangle className="mr-2 h-4 w-4 text-brand-crimson" /> Residual Risks
                </h4>
                <ul className="space-y-4">
                  {recommendation!.keyRisks.map((risk, index) => (
                    <li key={index} className="text-sm text-gray-300 flex items-start group">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-crimson mt-1.5 mr-3 shrink-0 group-hover:scale-150 transition-transform" />
                      <span className="leading-relaxed">{risk}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Commit Confirmation Modal */}
      <AnimatePresence>
        {showCommitModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setShowCommitModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 max-w-lg w-full shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Commit to Decision</h3>
                  <p className="text-xs text-gray-500">This action is permanent and will lock the recommendation.</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Recommendation</span>
                  <p className="text-sm text-white font-medium">{recommendation!.recommendation}</p>
                </div>

                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Confidence</span>
                  <p className="text-sm text-white font-mono">{confidenceData?.overallScore ?? recommendation!.confidenceScore}% — {confidenceData?.grade ?? 'N/A'}</p>
                </div>

                {recommendation!.keyRisks.length > 0 && (
                  <div className="p-4 bg-brand-crimson/5 rounded-lg border border-brand-crimson/10">
                    <span className="text-[10px] font-bold text-brand-crimson uppercase tracking-widest block mb-2">Acknowledged Risks</span>
                    <ul className="space-y-1">
                      {recommendation!.keyRisks.map((risk, i) => (
                        <li key={i} className="text-xs text-gray-400 flex items-start gap-2">
                          <AlertTriangle className="h-3 w-3 text-brand-crimson mt-0.5 shrink-0" />
                          {risk}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {confidenceData && confidenceData.caveats.length > 0 && (
                  <div className="p-4 bg-amber-500/5 rounded-lg border border-amber-500/10">
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block mb-2">Unresolved Caveats</span>
                    <ul className="space-y-1">
                      {confidenceData.caveats.map((c, i) => (
                        <li key={i} className="text-xs text-gray-400">• {c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowCommitModal(false)} className="border-white/10 text-gray-300">
                  Cancel
                </Button>
                <Button
                  onClick={handleCommitDecision}
                  disabled={committing}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  {committing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Confirm Commitment
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay — content-area only */}
      {loading && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex flex-col items-center justify-center">
          <div className="relative mb-8">
            <div className="h-24 w-24 rounded-full border-b-2 border-brand-crimson animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <ShieldCheck className="h-10 w-10 text-brand-crimson animate-pulse" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <h4 className="text-white text-lg font-bold uppercase tracking-[0.2em] animate-pulse">Formulating Decision</h4>
            <p className="text-gray-500 text-sm font-mono">Synthesizing multi-agent consensus...</p>
          </div>
        </div>
      )}
    </div>
  );
});
