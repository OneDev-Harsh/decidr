"use client";

import { AlertCircle, ChevronRight } from "lucide-react";

export function ContradictionAlert({ contradictions }: { contradictions: any[] }) {
  if (!contradictions || contradictions.length === 0) return null;

  return (
    <div className="mb-8 space-y-3">
      {contradictions.map((c, i) => (
        <div key={i} className="flex items-start gap-4 p-4 rounded-lg bg-brand-crimson/10 border border-brand-crimson/20 group">
          <div className="mt-1">
            <AlertCircle className="h-5 w-5 text-brand-crimson" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
              Critical Contradiction Detected: {c.title}
              <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase ${
                c.severity === 'High' ? 'bg-brand-crimson text-white' : 'bg-amber-500/20 text-amber-500'
              }`}>
                {c.severity} Priority
              </span>
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">{c.description}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {c.sources?.map((source: string, si: number) => (
                <span key={si} className="text-[10px] text-gray-600 bg-black/40 px-2 py-0.5 rounded border border-white/5">
                  Source: {source}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
