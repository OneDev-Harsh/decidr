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
    <div className="p-[20mm] print:break-after-page min-h-[297mm] bg-white text-black flex flex-col">
      <div className="mb-8 pb-4 border-b-2 border-black">
        <h2 className="text-3xl font-black tracking-tight uppercase">Final Recommendation</h2>
        <p className="text-[12px] font-bold text-zinc-500 uppercase tracking-widest mt-2">Authoritative Strategic Synthesis</p>
      </div>

      <div className="flex-1 space-y-12">
        <div className="p-8 bg-black text-white border border-black">
          <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Selected Path</h3>
          <h4 className="text-3xl font-bold leading-tight mb-6">
            {recommendation.recommendation}
          </h4>
          <p className="text-base text-zinc-300 leading-relaxed font-light border-l border-white/20 pl-6">
            {recommendation.rationale}
          </p>
        </div>

        {recommendation.debateSummary && (
          <div>
            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4 border-b border-zinc-200 pb-2">
              Synthesis of Deliberation
            </h4>
            <p className="text-sm text-zinc-800 leading-relaxed italic font-serif">
              "{recommendation.debateSummary}"
            </p>
          </div>
        )}

        <div>
          <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-6 border-b border-zinc-200 pb-2">
            Confidence Assessment Breakdown
          </h4>
          <div className="flex items-center gap-6 mb-8">
            <span className="text-5xl font-black leading-none">{confidenceData.overallScore}%</span>
            <span className={`px-3 py-1 text-[11px] font-bold uppercase tracking-widest border ${
              confidenceData.grade === 'HIGH' ? 'bg-zinc-100 border-black text-black' :
              confidenceData.grade === 'MODERATE' ? 'bg-zinc-50 border-zinc-400 text-zinc-700' :
              'bg-red-50 border-red-700 text-red-700'
            }`}>
              {confidenceData.grade} Confidence
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-12 gap-y-6">
            {confidenceData.factors.map((factor, i) => (
              <div key={i}>
                <div className="flex justify-between text-[11px] font-bold mb-2">
                  <span className="text-zinc-500 uppercase tracking-widest">{factor.name}</span>
                  <span className="font-mono">{factor.score}</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-200 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-700 ${
                      factor.score >= 70 ? 'bg-black' :
                      factor.score >= 40 ? 'bg-zinc-500' :
                      'bg-zinc-300'
                    }`}
                    style={{ width: `${factor.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
