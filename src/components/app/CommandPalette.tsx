"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Command, CornerDownLeft, Zap, Target, Database, GitMerge, Share2, Clock, AlertTriangle, MessageSquare, CheckCircle, ListTodo, GitPullRequest, EyeOff } from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  tabs: any[];
  onSelect: (id: string) => void;
}

export function CommandPalette({ isOpen, onClose, tabs, onSelect }: CommandPaletteProps) {
  const [query, setQuery] = useState("");

  const filteredTabs = tabs.filter(tab => 
    tab.name.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        <motion.div 
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="relative w-full max-w-xl bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden"
        >
          {/* Search Header */}
          <div className="flex items-center px-4 py-4 border-b border-white/5 bg-zinc-900/50">
            <Search className="h-5 w-5 text-zinc-500 mr-3" />
            <input 
              autoFocus
              className="flex-1 bg-transparent border-none outline-none text-white text-[15px] placeholder:text-zinc-600 font-medium"
              placeholder="Search sections or actions..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && filteredTabs.length > 0) {
                  onSelect(filteredTabs[0].id);
                  onClose();
                }
              }}
            />
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/5 border border-white/5 rounded-md">
              <span className="text-[10px] text-zinc-500 font-mono">ESC</span>
            </div>
          </div>

          {/* Results Area */}
          <div className="max-h-[380px] overflow-y-auto p-2 no-scrollbar">
            {filteredTabs.length > 0 ? (
              <div className="space-y-1">
                <div className="px-3 py-2">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-600">Quick Navigation</span>
                </div>
                {filteredTabs.map((tab, idx) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      onSelect(tab.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-3 rounded-lg hover:bg-white/5 group/item transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-md bg-zinc-800 border border-white/5 flex items-center justify-center transition-colors group-hover/item:border-white/20 group-hover/item:bg-zinc-700">
                        <tab.icon className="h-4 w-4 text-zinc-400 group-hover/item:text-white" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-[13px] font-medium text-zinc-200 group-hover/item:text-white">{tab.name}</span>
                        <span className="text-[10px] text-zinc-600 font-mono tracking-wider">SECTION_{tab.id.toUpperCase()}</span>
                      </div>
                    </div>
                    <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                      <CornerDownLeft className="h-3 w-3 text-zinc-500" />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-zinc-600">
                <Search className="h-8 w-8 mb-3 opacity-20" />
                <span className="text-[13px]">No sections found for "{query}"</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-white/5 bg-black/20 flex items-center justify-between">
            <div className="flex items-center gap-4 text-[11px] text-zinc-500">
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-zinc-800 border border-white/10 rounded font-mono text-[9px]">↑↓</kbd>
                <span>Navigate</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-zinc-800 border border-white/10 rounded font-mono text-[9px]">ENTER</kbd>
                <span>Select</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-zinc-600">
              <Zap className="h-3 w-3 text-brand-crimson/50" />
              <span>Decidr Intelligence Core</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
