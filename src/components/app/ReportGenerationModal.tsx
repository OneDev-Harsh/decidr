"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FileText, ShieldCheck, GitMerge, FileArchive, X, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface ReportGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

const REPORT_TYPES = [
  {
    id: "executive",
    title: "Executive Brief",
    description: "Short, high-level boardroom summary focusing on recommendation, top risks, and strategic outlook.",
    icon: FileText,
    target: "executives, investors",
    color: "text-zinc-100"
  },
  {
    id: "full",
    title: "Full Strategic Report",
    description: "Comprehensive enterprise report including all evidence, scenarios, contradictions, and governance history.",
    icon: ShieldCheck,
    target: "strategy teams, analysts",
    color: "text-zinc-300"
  },
  {
    id: "scenario",
    title: "Scenario Intelligence",
    description: "Simulation-heavy report focusing on scenario branches, comparison matrices, and risk propagation.",
    icon: GitMerge,
    target: "strategic planning teams",
    color: "text-zinc-400"
  },
  {
    id: "governance",
    title: "Governance & Audit",
    description: "Compliance-oriented report tracking timeline history, evidence lineage, approvals, and merge history.",
    icon: FileArchive,
    target: "compliance, internal audit",
    color: "text-zinc-500"
  }
];

export function ReportGenerationModal({ isOpen, onClose, projectId }: ReportGenerationModalProps) {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string>("full");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate slight delay for "gathering data" effect before navigation
    setTimeout(() => {
      // We open the report in a new tab to preserve the dashboard state
      window.open(`/projects/${projectId}/report?type=${selectedType}`, '_blank');
      setIsGenerating(false);
      onClose();
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-3xl bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-white/10 bg-zinc-950/50">
            <div>
              <h2 className="text-xl font-semibold text-white tracking-tight">Generate Intelligence Briefing</h2>
              <p className="text-[13px] text-zinc-500 mt-1">Select the report format optimized for your audience.</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-zinc-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-8 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {REPORT_TYPES.map((type) => {
                const isSelected = selectedType === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`text-left p-6 rounded-xl border transition-all duration-200 group ${
                      isSelected 
                        ? 'bg-zinc-900 border-zinc-100 ring-1 ring-zinc-100' 
                        : 'bg-zinc-950/50 border-white/5 hover:border-white/20 hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-2 rounded-lg ${isSelected ? 'bg-zinc-100 text-black' : 'bg-white/5 text-zinc-400 group-hover:text-zinc-300'}`}>
                        <type.icon className="h-5 w-5" />
                      </div>
                      <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-zinc-100' : 'border-zinc-700'}`}>
                        {isSelected && <div className="h-2 w-2 bg-zinc-100 rounded-full" />}
                      </div>
                    </div>
                    <h3 className={`text-[15px] font-bold tracking-tight mb-2 ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                      {type.title}
                    </h3>
                    <p className="text-[13px] text-zinc-500 leading-relaxed mb-4">
                      {type.description}
                    </p>
                    <div className="flex items-center gap-2 mt-auto">
                      <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Audience</span>
                      <span className="text-[11px] text-zinc-400">{type.target}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 border-t border-white/10 bg-zinc-950/50 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-zinc-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-500"></span>
              </span>
              <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest">System Ready</span>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={onClose} className="text-zinc-400 hover:text-white">
                Cancel
              </Button>
              <Button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="bg-white hover:bg-zinc-200 text-black px-6 h-10 font-medium transition-all shadow-xl"
              >
                {isGenerating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="mr-2 h-4 w-4" />
                )}
                {isGenerating ? "Compiling..." : "Generate Briefing"}
                {!isGenerating && <ArrowRight className="ml-2 h-4 w-4 opacity-50" />}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
