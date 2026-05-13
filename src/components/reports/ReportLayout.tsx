"use client";

import { ReactNode } from "react";

interface ReportLayoutProps {
  children: ReactNode;
  headerTitle: string;
  classification?: string;
  dateStr?: string;
}

/**
 * ReportLayout wraps the entire report.
 * It provides standard A4/Letter padding and `@media print` utilities.
 */
export function ReportLayout({ children, headerTitle, classification = "", dateStr = new Date().toLocaleDateString() }: ReportLayoutProps) {
  return (
    <div className="min-h-screen bg-zinc-950 text-black font-sans print:bg-white flex flex-col items-center py-12 print:py-0 print:block selection:bg-brand-crimson/10 selection:text-brand-crimson">
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          html, body {
            background: white !important;
            background-color: white !important;
            color: black !important;
            height: auto !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print-break-after {
            page-break-after: always;
          }
          /* High-fidelity analytical rendering */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
        
        /* Unified Typography Hierarchy */
        .report-section-label {
          font-family: var(--font-mono);
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #a1a1aa; /* zinc-400 */
        }

        .report-heading-1 {
          font-weight: 800;
          letter-spacing: -0.04em;
          text-transform: uppercase;
        }

        .report-body-text {
          line-height: 1.6;
          letter-spacing: -0.01em;
        }
      `}</style>

      {/* 
        PREMIUM NATIVE HEADER
        Aligns with the app's top bar/navigation feel
      */}
      <div className="hidden print:flex fixed top-0 left-0 right-0 h-[18mm] px-[25mm] bg-white z-[100] items-end justify-between border-b border-zinc-100 pb-3">
        <div className="flex items-center gap-4">
          <div className="h-7 w-7 rounded bg-black flex items-center justify-center">
            <span className="text-white font-black text-[12px]">D</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] font-bold text-black tracking-tight leading-none uppercase">Decidr Intelligence</span>
            <span className="text-[8px] font-mono font-bold text-zinc-400 uppercase tracking-widest mt-1">Strategic Governance Artifact</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-[0.2em]">{headerTitle}</span>
        </div>
      </div>

      {/* PREMIUM NATIVE FOOTER */}
      <div className="hidden print:flex fixed bottom-0 left-0 right-0 h-[15mm] px-[25mm] bg-white z-[100] items-start justify-between border-t border-zinc-100 pt-3">
        <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-[0.2em]">© {new Date().getFullYear()} Decidr Platform — Proprietary Record</span>
        <div className="flex items-center gap-8">
          <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest">{dateStr}</span>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono font-bold text-zinc-300 uppercase">Page</span>
            <span className="text-[10px] font-black text-black font-mono tracking-tighter">[01]</span>
          </div>
        </div>
      </div>

      {/* Main Document Body - Disciplined spatial architecture */}
      <div className="w-full max-w-[850px] bg-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] print:shadow-none print:max-w-none print:w-full relative z-10">
        {children}
      </div>

      {/* Print Trigger (Screen Only) */}
      <div className="fixed bottom-10 right-10 print:hidden z-50">
        <button 
          onClick={() => window.print()}
          className="group relative flex items-center gap-4 bg-zinc-900 text-white px-8 py-5 rounded-lg border border-white/10 shadow-2xl hover:bg-white hover:text-black transition-all duration-500 active:scale-95"
        >
          <div className="flex flex-col items-start">
            <span className="text-[12px] font-bold uppercase tracking-[0.2em] leading-none mb-1">Export PDF</span>
            <span className="text-[10px] text-zinc-500 group-hover:text-zinc-400 font-mono tracking-tight transition-colors">Enterprise Intel Export</span>
          </div>
          <div className="h-px w-8 bg-white/20 group-hover:bg-black/20 transition-colors" />
        </button>
      </div>
    </div>
  );
}
