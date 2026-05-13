"use client";

import { ShieldCheck, Calendar, Activity } from "lucide-react";

interface CoverPageProps {
  project: any;
  reportType: string;
}

export function CoverPage({ project, reportType }: CoverPageProps) {
  const getReportTitle = (type: string) => {
    switch (type) {
      case 'executive': return 'Executive Intelligence Brief';
      case 'scenario': return 'Strategic Scenario Matrix';
      case 'governance': return 'Governance & Audit Log';
      default: return 'Comprehensive Strategic Report';
    }
  };

  const confidenceScore = project?.last_recommendation?.confidenceScore || "N/A";
  
  return (
    <div className="min-h-[297mm] flex flex-col p-[20mm] bg-black text-white relative print:break-after-page overflow-hidden">
      
      {/* Background Graphic */}
      <div className="absolute top-0 right-0 w-[150%] h-[150%] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-zinc-800/40 via-black to-black opacity-50 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] border border-white/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />

      {/* Header */}
      <div className="flex justify-between items-start relative z-10">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-white">DECIDR</h1>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mt-1">Enterprise Intelligence</p>
        </div>
        <div className="text-right">
          <div className="inline-block px-3 py-1 border border-red-900/50 bg-red-950/20 text-red-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">
            RESTRICTED
          </div>
          <p className="text-[10px] font-mono text-zinc-500 uppercase">
            REF: {project.id.split('-')[0].toUpperCase()}
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center relative z-10 space-y-12">
        <div className="space-y-4">
          <h2 className="text-[14px] font-bold text-zinc-400 uppercase tracking-[0.2em] border-l-2 border-zinc-500 pl-4">
            {getReportTitle(reportType)}
          </h2>
          <h1 className="text-[54px] font-bold leading-[1.1] tracking-tight max-w-[80%]">
            {project.title}
          </h1>
        </div>

        <div className="grid grid-cols-3 gap-8 pt-12 border-t border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-2 text-zinc-500">
              <Calendar className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Generated On</span>
            </div>
            <p className="text-[14px] font-mono text-zinc-300">
              {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2 text-zinc-500">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Project Status</span>
            </div>
            <p className="text-[14px] font-mono text-zinc-300 uppercase">
              {project.status}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2 text-zinc-500">
              <Activity className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Confidence Index</span>
            </div>
            <p className="text-[24px] font-bold text-white leading-none">
              {confidenceScore}{confidenceScore !== 'N/A' ? '%' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 pt-8 border-t border-white/10 flex justify-between items-end">
        <div>
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] block mb-1">Target Workspace</span>
          <span className="text-[14px] font-medium text-white">{project.workspaces?.name || "Corporate Workspace"}</span>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-mono text-zinc-600 block">
            Generated via Decidr Report Generation System
          </span>
        </div>
      </div>
    </div>
  );
}
