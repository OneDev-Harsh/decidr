"use client";

import { AlertTriangle, CheckCircle, Target } from "lucide-react";

interface ExecutiveSummaryProps {
  project: any;
  recommendation: any;
}

export function ExecutiveSummary({ project, recommendation }: ExecutiveSummaryProps) {
  if (!recommendation) return null;

  return (
    <div className="p-[20mm] print:break-after-page min-h-[297mm] bg-white text-black flex flex-col">
      <div className="mb-8 pb-4 border-b-2 border-black">
        <h2 className="text-3xl font-black tracking-tight uppercase">Executive Summary</h2>
        <p className="text-[12px] font-bold text-zinc-500 uppercase tracking-widest mt-2">High-Level Strategic Briefing</p>
      </div>

      <div className="flex-1 space-y-12">
        {/* Objective */}
        <section>
          <div className="flex items-center gap-2 mb-4 text-black">
            <Target className="h-5 w-5" />
            <h3 className="text-sm font-bold uppercase tracking-widest">Decision Objective</h3>
          </div>
          <p className="text-lg leading-relaxed text-zinc-800 font-serif border-l-4 border-black pl-6">
            {project.problem_statement || "Objective not explicitly defined."}
          </p>
        </section>

        {/* Final Recommendation */}
        <section className="bg-zinc-50 p-8 border border-zinc-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-black">
              <CheckCircle className="h-5 w-5" />
              <h3 className="text-sm font-bold uppercase tracking-widest">Strategic Recommendation</h3>
            </div>
            <div className="px-3 py-1 bg-black text-white text-[10px] font-bold uppercase tracking-widest">
              Confidence: {recommendation.confidenceScore}%
            </div>
          </div>
          <h4 className="text-2xl font-bold leading-tight mb-4 text-black">
            {recommendation.recommendation}
          </h4>
          <p className="text-base text-zinc-600 leading-relaxed">
            {recommendation.rationale}
          </p>
        </section>

        {/* Top Risks */}
        {recommendation.keyRisks && recommendation.keyRisks.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="text-sm font-bold uppercase tracking-widest">Primary Strategic Risks</h3>
            </div>
            <ul className="space-y-3">
              {recommendation.keyRisks.slice(0, 3).map((risk: string, i: number) => (
                <li key={i} className="flex items-start gap-4 p-4 bg-red-50/50 border border-red-100">
                  <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest mt-1 shrink-0">Risk 0{i+1}</span>
                  <p className="text-sm text-zinc-800 leading-relaxed">{risk}</p>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
