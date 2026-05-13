"use client";

import { Compass, Lightbulb, Target, Trophy } from "lucide-react";

interface StrategicContextProps {
  project: any;
}

export function StrategicContext({ project }: StrategicContextProps) {
  return (
    <div className="p-[30mm] print:break-after-page min-h-[297mm] bg-white text-black">
      
      {/* Editorial Header */}
      <div className="mb-16">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-1 w-12 bg-black" />
          <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-[0.3em]">Phase 02 — Environmental Context</span>
        </div>
        <h2 className="text-4xl font-black tracking-tight uppercase mb-2 font-serif">Strategic Context</h2>
        <p className="text-[12px] font-bold text-zinc-500 uppercase tracking-widest">Business & Operational Architecture</p>
      </div>

      <div className="grid grid-cols-2 gap-12 mt-12">
        <div className="space-y-6 col-span-2 border-b border-zinc-100 pb-12">
          <div className="flex items-center gap-2 mb-4">
            <Compass className="h-4 w-4 text-zinc-400" />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500">Current System State</span>
          </div>
          <p className="text-xl text-zinc-900 leading-relaxed font-serif italic max-w-[90%]">
            {project.current_state || "Current state parameters not explicitly quantified."}
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-4 w-4 text-zinc-400" />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500">Strategic Objectives</span>
          </div>
          <div className="text-[14px] text-zinc-700 leading-relaxed p-8 border border-zinc-100 bg-zinc-50/30 min-h-[200px]">
            {project.goals || "Operational objectives pending formal documentation."}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-4 w-4 text-zinc-400" />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500">Key Assumptions</span>
          </div>
          <div className="text-[14px] text-zinc-700 leading-relaxed p-8 border border-zinc-100 bg-zinc-50/30 min-h-[200px]">
            {project.key_assumptions || "Underlying assumptions not explicitly stated for audit."}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Compass className="h-4 w-4 text-zinc-400" />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500">Market Drivers</span>
          </div>
          <div className="text-[14px] text-zinc-700 leading-relaxed p-8 border border-zinc-100 bg-zinc-50/30 min-h-[200px]">
            {project.strategic_drivers || "External strategic drivers not defined in current vector."}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-4 w-4 text-zinc-400" />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500">Success Criteria</span>
          </div>
          <div className="text-[14px] text-zinc-700 leading-relaxed p-8 border border-zinc-100 bg-zinc-50/30 min-h-[200px]">
            {project.success_criteria || "Quantifiable success metrics not established."}
          </div>
        </div>
      </div>

      {/* Page Signature */}
      <div className="pt-12 mt-12 border-t border-zinc-100 flex justify-between items-end opacity-40">
        <div className="flex flex-col gap-1">
          <span className="text-[8px] font-bold uppercase tracking-widest">Environmental Intelligence Map</span>
          <span className="text-[7px] font-mono uppercase tracking-widest">Context Vector ID: ENV_{project.id.split('-')[0].toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
}
