"use client";

import { AlertTriangle, CheckCircle, Target } from "lucide-react";

interface ExecutiveSummaryProps {
  project: any;
  recommendation: any;
}

export function ExecutiveSummary({ project, recommendation }: ExecutiveSummaryProps) {
  if (!recommendation) return null;

  return (
    <div className="p-[30mm] print:break-after-page min-h-[297mm] bg-white text-black flex flex-col relative overflow-hidden">
      {/* Structural Background Accents */}
      <div className="absolute top-0 right-0 w-[40%] h-[1px] bg-zinc-100" />
      
      {/* Editorial Header */}
      <div className="mb-20">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-1 w-10 bg-black" />
          <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-[0.3em]">Section 01 — Strategic Synthesis</span>
        </div>
        <h2 className="text-4xl font-extrabold tracking-tight uppercase mb-3">Executive Summary</h2>
        <p className="text-[12px] font-bold text-zinc-500 uppercase tracking-widest">Condensed Intelligence & Actionable Verdict</p>
      </div>

      <div className="flex-1 space-y-24">
        {/* The "Anchor" Problem Statement - Minimalist & Powerful */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <Target className="h-3.5 w-3.5 text-zinc-400" />
            <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-[0.2em]">Decision Objective</span>
          </div>
          <p className="text-[24px] font-semibold tracking-tight text-zinc-800 leading-snug max-w-[90%]">
            {project.problem_statement || "Strategic objective pending formal definition."}
          </p>
        </section>

        {/* Primary Intelligence Vector: The Recommendation - Tactical Emphasis */}
        <section className="space-y-8">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-black" />
              <span className="text-[9px] font-mono font-bold text-black uppercase tracking-[0.2em]">Strategic Recommendation</span>
            </div>
            <div className="px-3 py-1 bg-zinc-50 border border-zinc-200 rounded-sm">
              <span className="text-[9px] font-mono font-bold text-black uppercase tracking-widest">Confidence Index: {recommendation.confidenceScore}%</span>
            </div>
          </div>

          <div className="space-y-10">
            <h3 className="text-[32px] font-extrabold leading-tight tracking-tighter text-black uppercase">
              {recommendation.recommendation}
            </h3>
            
            <div className="p-10 bg-zinc-50/50 border border-zinc-100 rounded-sm">
              <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest block mb-4">Strategic Rationale</span>
              <p className="text-[16px] text-zinc-700 leading-relaxed font-medium tracking-tight">
                {recommendation.rationale}
              </p>
            </div>
          </div>
        </section>

        {/* Tactical Indicators: Risks - Modular Grouping */}
        {recommendation.keyRisks && recommendation.keyRisks.length > 0 && (
          <section className="space-y-8">
            <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
              <AlertTriangle className="h-3.5 w-3.5 text-brand-crimson" />
              <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-[0.2em]">Primary Risk Vectors</span>
            </div>
            
            <div className="grid grid-cols-2 gap-px bg-zinc-100 border border-zinc-100">
              {recommendation.keyRisks.slice(0, 4).map((risk: string, i: number) => (
                <div key={i} className="p-8 bg-white space-y-3 hover:bg-zinc-50 transition-colors">
                  <span className="text-[9px] font-mono font-bold text-zinc-300 uppercase tracking-widest">Risk Profile 0{i+1}</span>
                  <p className="text-[14px] text-zinc-700 leading-relaxed font-medium">
                    {risk}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Page Signature */}
      <div className="pt-12 mt-12 border-t border-zinc-100 flex justify-between items-end opacity-40">
        <div className="flex flex-col gap-1">
          <span className="text-[8px] font-mono font-bold uppercase tracking-widest">Decidr Intelligence Synthesis</span>
          <span className="text-[7px] font-mono font-bold">AUDIT_STAMP: {project.id.split('-')[0].toUpperCase()}_EXEC_01</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-zinc-200" />
          <span className="text-[8px] font-mono font-bold uppercase tracking-[0.2em]">Verified Secure</span>
        </div>
      </div>
    </div>
  );
}
