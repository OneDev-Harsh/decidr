"use client";

import { calculateConfidence } from "@/lib/ai/core/confidence_engine";

interface FinalRecommendationProps {
  project: any;
  recommendation: any;
}

export function FinalRecommendation({ project, recommendation }: FinalRecommendationProps) {
  if (!recommendation) return null;

  const confidenceData = calculateConfidence({
    evidenceCount: project._evidenceCount ?? 0,
    contradictionCount: project.last_contradictions?.length ?? 0,
    blindspotCount: project.last_blindspots?.length ?? 0,
    highImpactBlindspots: project.last_blindspots?.filter((b: any) => b.impact === 'High')?.length ?? 0,
    debateCompleted: !!recommendation.debateSummary,
    scenarioCount: project.last_scenarios?.length ?? 0,
    hasGoals: !!project.goals,
    hasProblemStatement: !!project.problem_statement,
    rawAIScore: recommendation.confidenceScore,
  });

  return (
    <div className="p-[30mm] print:break-after-page min-h-[297mm] bg-white text-black flex flex-col relative overflow-hidden">
      {/* Structural Background Accents */}
      <div className="absolute top-0 right-0 w-[40%] h-[1px] bg-zinc-100" />
      
      {/* Editorial Header */}
      <div className="mb-20">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-1 w-10 bg-black" />
          <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-[0.3em]">Section 06 — Strategic Verdict</span>
        </div>
        <h2 className="text-4xl font-extrabold tracking-tight uppercase mb-3">Definitive Recommendation</h2>
        <p className="text-[12px] font-bold text-zinc-500 uppercase tracking-widest">Authorized Path & Intelligence Confidence Indices</p>
      </div>

      <div className="flex-1 space-y-24">
        {/* The Verdict - Authoritative & Executive */}
        <section className="space-y-12">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-5">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-black" />
              <span className="text-[10px] font-mono font-bold text-black uppercase tracking-[0.2em]">Authorized Operational Path</span>
            </div>
            <div className={`px-4 py-1.5 border rounded-sm ${
              confidenceData.grade === 'HIGH' ? 'bg-black text-white border-black' :
              confidenceData.grade === 'MODERATE' ? 'bg-zinc-50 text-zinc-800 border-zinc-200' :
              'bg-brand-crimson/5 border-brand-crimson/10 text-brand-crimson'
            }`}>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest">{confidenceData.grade} Confidence Level</span>
            </div>
          </div>

          <div className="space-y-12">
            <h3 className="text-[44px] font-extrabold leading-[1.05] tracking-tighter text-black uppercase max-w-[95%]">
              {recommendation.recommendation}
            </h3>
            
            <div className="p-12 bg-zinc-50 border border-zinc-100 rounded-sm space-y-6">
              <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">Strategic Rationale</span>
              <p className="text-[18px] text-zinc-800 leading-relaxed font-medium tracking-tight">
                {recommendation.rationale}
              </p>
            </div>
          </div>
        </section>

        {/* Intelligence Confidence Audit - Tactical & Modular */}
        <section className="space-y-12 pt-12 border-t border-zinc-100">
          <div className="flex items-end justify-between border-b border-zinc-50 pb-6">
            <div className="space-y-1">
              <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-[0.2em]">Analytical Confidence Index</span>
              <div className="flex items-baseline gap-3">
                <span className="text-[48px] font-extrabold tracking-tighter leading-none">{confidenceData.overallScore}%</span>
                <span className="text-[12px] font-bold text-zinc-300 font-mono">STABILITY</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-20 gap-y-10">
            {confidenceData.factors.map((factor, i) => (
              <div key={i} className="space-y-4 group">
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 group-hover:text-black transition-colors">{factor.name}</span>
                  <span className="text-[12px] font-extrabold font-mono text-zinc-800">{factor.score < 10 ? `0${factor.score}` : factor.score}</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden relative">
                  <div
                    className={`absolute inset-0 transition-all duration-1000 ease-out ${
                      factor.score >= 70 ? 'bg-black' :
                      factor.score >= 40 ? 'bg-zinc-400' :
                      'bg-brand-crimson'
                    }`}
                    style={{ width: `${factor.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Page Signature */}
      <div className="pt-12 mt-12 border-t border-zinc-100 flex justify-between items-end opacity-40">
        <div className="flex flex-col gap-1">
          <span className="text-[8px] font-mono font-bold uppercase tracking-widest">Definitive Strategic Synthesis</span>
          <span className="text-[7px] font-mono font-bold uppercase tracking-widest">STAMP: REC_{project.id.split('-')[0].toUpperCase()}_VERIFIED</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-zinc-200" />
          <span className="text-[8px] font-mono font-bold uppercase tracking-[0.2em]">Authorized Intelligence</span>
        </div>
      </div>
    </div>
  );
}
