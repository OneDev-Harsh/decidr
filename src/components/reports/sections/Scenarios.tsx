"use client";

import { GitMerge } from "lucide-react";

interface ScenariosProps {
  scenarios: any[];
}

export function Scenarios({ scenarios }: ScenariosProps) {
  if (!scenarios || scenarios.length === 0) return null;

  return (
    <div className="p-[20mm] print:break-after-page min-h-[297mm] bg-white text-black">
      <div className="mb-8 pb-4 border-b-2 border-black">
        <h2 className="text-3xl font-black tracking-tight uppercase">Scenario Matrix</h2>
        <p className="text-[12px] font-bold text-zinc-500 uppercase tracking-widest mt-2">Simulated Strategic Outcomes & Stress Tests</p>
      </div>

      <div className="mt-12 space-y-12">
        {scenarios.map((scenario, index) => (
          <div key={index} className="border border-zinc-200">
            <div className="bg-zinc-50 p-6 border-b border-zinc-200 flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold mb-2">{scenario.title}</h3>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 border ${
                  scenario.riskLevel === 'High' ? 'bg-red-50 text-red-700 border-red-700' :
                  scenario.riskLevel === 'Medium' ? 'bg-zinc-200 text-black border-zinc-400' :
                  'bg-white text-zinc-600 border-zinc-300'
                }`}>
                  {scenario.riskLevel} Risk Profile
                </span>
              </div>
              {scenario.probability !== undefined && (
                <div className="text-right">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Probability</span>
                  <span className="text-2xl font-mono font-bold">{scenario.probability}%</span>
                </div>
              )}
            </div>
            
            <div className="p-6">
              <p className="text-base text-zinc-800 leading-relaxed mb-6">
                {scenario.description}
              </p>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 border-b border-zinc-200 pb-2">Strategic Pros</h4>
                  <ul className="space-y-2">
                    {scenario.pros?.map((pro: string, i: number) => (
                      <li key={i} className="text-sm text-zinc-800 flex items-start">
                        <span className="mr-2 text-black font-bold">+</span> {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 border-b border-zinc-200 pb-2">Strategic Cons</h4>
                  <ul className="space-y-2">
                    {scenario.cons?.map((con: string, i: number) => (
                      <li key={i} className="text-sm text-zinc-800 flex items-start">
                        <span className="mr-2 text-black font-bold">-</span> {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {scenario.scores && (
                <div className="mt-8 pt-6 border-t border-zinc-200">
                  <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Operational Impact Matrix</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(scenario.scores).map(([key, value]: [string, any]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-widest capitalize text-zinc-700">{key.replace('_', ' ')}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 bg-zinc-200 overflow-hidden">
                            <div className="h-full bg-black" style={{ width: `${value * 10}%` }} />
                          </div>
                          <span className="text-[11px] font-mono font-bold w-4 text-right">{value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
