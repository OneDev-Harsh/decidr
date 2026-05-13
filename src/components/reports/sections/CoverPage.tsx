"use client";

import { Logo } from "@/components/shared/Logo";

interface CoverPageProps {
  project: any;
  reportType: string;
}

export function CoverPage({ project, reportType }: CoverPageProps) {
  const getReportTitle = (type: string) => {
    switch (type) {
      case 'executive': return 'Executive Intelligence Briefing';
      case 'scenario': return 'Strategic Scenario Matrix';
      case 'governance': return 'Governance & Audit Artifact';
      default: return 'Comprehensive Intelligence Report';
    }
  };

  const confidenceScore = project?.last_recommendation?.confidenceScore || "88";
  
  return (
    <div className="p-[30mm] print:break-after-page min-h-[297mm] bg-white text-black flex flex-col justify-between relative overflow-hidden">
      {/* Structural Background Accents */}
      <div className="absolute top-0 right-0 w-[60%] h-[1px] bg-zinc-100" />
      <div className="absolute top-0 right-0 w-[1px] h-[30%] bg-zinc-100" />
      
      {/* Top Branding Section */}
      <div className="flex justify-between items-start z-10">
        <div className="flex items-center gap-5">
          <Logo size="md" />
          <div className="flex flex-col">
            <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-[0.3em] mt-1.5">Intel Intelligence Unit</span>
          </div>
        </div>
        <div className="text-right">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-50 border border-zinc-200 rounded-sm">
            <div className="h-1.5 w-1.5 rounded-full bg-black animate-pulse" />
            <span className="text-[9px] font-mono font-bold text-black uppercase tracking-widest">Live Strategic Audit</span>
          </div>
        </div>
      </div>

      {/* Main Title Block - High Strategic Impact */}
      <div className="flex-1 flex flex-col justify-center max-w-[90%] z-10">
        <div className="space-y-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-px w-10 bg-brand-crimson" />
              <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-[0.4em]">{getReportTitle(reportType)}</span>
            </div>
            <h2 className="text-6xl font-extrabold tracking-tighter leading-[0.95] uppercase break-words">
              {project.title}
            </h2>
          </div>
          
          <p className="text-[20px] text-zinc-600 leading-relaxed font-medium max-w-[80%] tracking-tight">
            {project.description || project.problem_statement || "A strategic intelligence assessment focusing on high-stakes outcomes and decision clarity."}
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <div className="px-4 py-2 bg-black text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm">
              Strategic Briefing
            </div>
            <div className="px-4 py-2 border border-zinc-200 text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm">
              Ref: {project.id.split('-')[0].toUpperCase()} — Phase 0{project.status === 'completed' ? '4' : '3'}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Metadata - Balanced & Intentional */}
      <div className="grid grid-cols-3 gap-12 pt-12 border-t border-zinc-100 z-10">
        <div className="space-y-3">
          <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">Prepared For</span>
          <div className="flex flex-col gap-1">
            <span className="text-[13px] font-extrabold uppercase tracking-tight">Executive Stakeholders</span>
            <span className="text-[11px] font-medium text-zinc-500">{project.workspaces?.name || "Corporate Strategy Unit"}</span>
          </div>
        </div>
        <div className="space-y-3">
          <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">Confidence Index</span>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black font-mono tracking-tighter">{confidenceScore}%</span>
            <div className="h-8 w-px bg-zinc-100" />
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] font-bold text-zinc-900 uppercase tracking-widest">High Trust</span>
              <span className="text-[8px] font-medium text-zinc-400 uppercase">Audit Verified</span>
            </div>
          </div>
        </div>
        <div className="space-y-3 text-right">
          <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">Release Date</span>
          <div className="flex flex-col gap-1">
            <span className="text-[13px] font-extrabold uppercase tracking-tight">
              {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Ref: DC-S01-A4</span>
          </div>
        </div>
      </div>
    </div>
  );
}
