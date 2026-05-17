"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileText, Loader2, Target, Network, CheckCircle2, AlertTriangle, ShieldCheck, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AutonomousIngestionProps {
  onComplete: (data: any) => void;
  workspaceId: string;
}

export function AutonomousIngestion({ onComplete, workspaceId }: AutonomousIngestionProps) {
  const [stage, setStage] = useState<"idle" | "parsing" | "inferring" | "generating" | "complete">("idle");
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      startIngestion();
    }
  };

  const startIngestion = () => {
    setStage("parsing");
    setProgress(0);
    
    // Simulate Parsing Stage
    setTimeout(() => {
      setStage("inferring");
      setProgress(33);
    }, 2500);

    // Simulate Inferring Context Stage
    setTimeout(() => {
      setStage("generating");
      setProgress(66);
    }, 5500);

    // Simulate Completion
    setTimeout(() => {
      setStage("complete");
      setProgress(100);
      
      // Simulate generating data
      setTimeout(() => {
        onComplete({
          title: "AI Synthesized Project Q4",
          description: "Auto-generated context from uploaded intelligence documentation.",
          problem_statement: "Market dynamics require immediate strategic realignment.",
          goals: "Achieve 20% growth while maintaining current resource allocation.",
          status: "ANALYZING",
          priority: "high",
          strategic_drivers: "Competitor expansion, shifting regulatory landscape.",
          key_assumptions: "Market growth remains stable for next 2 quarters.",
          success_criteria: "Successful launch of new product line within budget."
        });
      }, 1500);
    }, 9000);
  };

  const stages = [
    { id: "parsing", title: "Parsing Intelligence", icon: FileText, desc: "Extracting goals, timelines, and operational KPIs..." },
    { id: "inferring", title: "Inferring Strategic Context", icon: Target, desc: "Determining business objectives and risk dependencies..." },
    { id: "generating", title: "Generating Infrastructure", icon: Network, desc: "Building blindspot audit, topologies, and reasoning nodes..." }
  ];

  return (
    <div className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden relative shadow-2xl">
      
      {/* Background ambient light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-brand-crimson/[0.02] blur-[100px] pointer-events-none" />

      <AnimatePresence mode="wait">
        {stage === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-12 flex flex-col items-center text-center border-2 border-dashed border-white/10 rounded-xl m-6 bg-black/40 hover:bg-black/60 transition-colors group cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              className="hidden" 
              multiple 
              accept=".pdf,.docx,.txt,.csv"
            />
            <div className="h-20 w-20 bg-zinc-900 border border-white/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.05)]">
              <UploadCloud className="h-8 w-8 text-zinc-400 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-widest">Autonomous Ingestion</h3>
            <p className="text-zinc-500 text-[14px] max-w-md mx-auto leading-relaxed">
              Drag & drop PDFs, meeting notes, or strategy briefs. Decidr will autonomously build your strategic workspace architecture.
            </p>
            <div className="mt-8 flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">
              <span className="flex items-center"><CheckCircle2 className="h-3 w-3 mr-1 text-emerald-500/50" /> PDF</span>
              <span className="flex items-center"><CheckCircle2 className="h-3 w-3 mr-1 text-emerald-500/50" /> DOCX</span>
              <span className="flex items-center"><CheckCircle2 className="h-3 w-3 mr-1 text-emerald-500/50" /> TXT</span>
            </div>
          </motion.div>
        )}

        {stage !== "idle" && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-12 relative z-10"
          >
            <div className="max-w-xl mx-auto">
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center relative overflow-hidden">
                    <motion.div 
                      className="absolute inset-0 bg-brand-crimson/20"
                      animate={{ y: ["100%", "0%", "100%"] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                    <Cpu className="h-5 w-5 text-zinc-300 relative z-10" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white uppercase tracking-widest">Synthesizing Strategy</h3>
                    <p className="text-[12px] font-mono text-zinc-500">{progress.toFixed(0)}% Complete</p>
                  </div>
                </div>
                {stage !== "complete" ? (
                  <Loader2 className="h-6 w-6 text-brand-crimson animate-spin" />
                ) : (
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                )}
              </div>

              {/* Progress Bar */}
              <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden mb-12">
                <motion.div 
                  className="h-full bg-gradient-to-r from-zinc-500 via-white to-brand-crimson"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              {/* Stages List */}
              <div className="space-y-6">
                {stages.map((s, i) => {
                  const isActive = stage === s.id;
                  const isPast = stages.findIndex(st => st.id === stage) > i || stage === "complete";
                  const isFuture = !isActive && !isPast;

                  return (
                    <motion.div 
                      key={s.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: isFuture ? 0.3 : 1, x: 0 }}
                      className={`flex items-start gap-4 p-4 rounded-xl transition-all ${
                        isActive ? "bg-zinc-900/50 border border-white/10 shadow-lg" : "border border-transparent"
                      }`}
                    >
                      <div className={`mt-0.5 h-8 w-8 rounded-full flex items-center justify-center shrink-0 border ${
                        isActive ? "bg-black border-brand-crimson text-brand-crimson" :
                        isPast ? "bg-black border-emerald-500/50 text-emerald-500" :
                        "bg-black border-zinc-800 text-zinc-700"
                      }`}>
                        {isPast ? <CheckCircle2 className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
                      </div>
                      <div>
                        <h4 className={`text-[13px] font-bold uppercase tracking-widest ${
                          isActive ? "text-white" : isPast ? "text-zinc-300" : "text-zinc-600"
                        }`}>
                          {s.title}
                        </h4>
                        <AnimatePresence>
                          {(isActive || isPast) && (
                            <motion.p 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className="text-[12px] text-zinc-500 mt-1"
                            >
                              {s.desc}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
