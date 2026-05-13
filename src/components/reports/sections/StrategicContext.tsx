"use client";

import { Compass, Lightbulb, Target, Trophy } from "lucide-react";

interface StrategicContextProps {
  project: any;
}

export function StrategicContext({ project }: StrategicContextProps) {
  return (
    <div className="p-[20mm] print:break-after-page min-h-[297mm] bg-white text-black">
      <div className="mb-8 pb-4 border-b-2 border-black">
        <h2 className="text-3xl font-black tracking-tight uppercase">Strategic Context</h2>
        <p className="text-[12px] font-bold text-zinc-500 uppercase tracking-widest mt-2">Business & Operational Environment</p>
      </div>

      <div className="grid grid-cols-2 gap-x-12 gap-y-16 mt-12">
        <div className="space-y-4 col-span-2">
          <div className="flex items-center gap-2 text-black mb-2">
            <Compass className="h-5 w-5" />
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Current System State</h3>
          </div>
          <p className="text-base text-zinc-800 leading-relaxed">
            {project.current_state || "Not defined."}
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-black mb-2">
            <Target className="h-5 w-5" />
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Goals & Constraints</h3>
          </div>
          <p className="text-sm text-zinc-800 leading-relaxed bg-zinc-50 p-6 border border-zinc-200 min-h-[150px]">
            {project.goals || "Not defined."}
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-black mb-2">
            <Lightbulb className="h-5 w-5" />
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Key Assumptions</h3>
          </div>
          <p className="text-sm text-zinc-800 leading-relaxed bg-zinc-50 p-6 border border-zinc-200 min-h-[150px]">
            {project.key_assumptions || "Not defined."}
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-black mb-2">
            <Compass className="h-5 w-5" />
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Strategic Drivers</h3>
          </div>
          <p className="text-sm text-zinc-800 leading-relaxed bg-zinc-50 p-6 border border-zinc-200 min-h-[150px]">
            {project.strategic_drivers || "Not defined."}
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-black mb-2">
            <Trophy className="h-5 w-5" />
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Success Criteria</h3>
          </div>
          <p className="text-sm text-zinc-800 leading-relaxed bg-zinc-50 p-6 border border-zinc-200 min-h-[150px]">
            {project.success_criteria || "Not defined."}
          </p>
        </div>
      </div>
    </div>
  );
}
