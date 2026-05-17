"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from "framer-motion";
import { Search, ChevronRight, ChevronLeft, Command } from "lucide-react";

interface Tab {
  id: string;
  name: string;
  icon: any;
  priority?: "high" | "normal";
  status?: "active" | "idle";
}

interface StrategicNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export function StrategicNavigation({ tabs, activeTab, onTabChange }: StrategicNavigationProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Handle Scroll Progress & Fades
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    
    setShowLeftFade(scrollLeft > 20);
    setShowRightFade(scrollLeft < scrollWidth - clientWidth - 20);
    setScrollProgress(scrollLeft / (scrollWidth - clientWidth));
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", handleScroll);
      handleScroll(); // Initial check
      return () => el.removeEventListener("scroll", handleScroll);
    }
  }, []);

  // Drag to Scroll Logic
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => setIsDragging(false);

  // Keyboard shortcut listener for help text
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        // Command palette logic will be handled in parent
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const [isScrubberDragging, setIsScrubberDragging] = useState(false);
  const scrubberRef = useRef<HTMLDivElement>(null);

  // Handle Scrubber Interaction
  const handleScrubberAction = (clientX: number) => {
    if (!scrubberRef.current || !scrollRef.current) return;
    const { left, width } = scrubberRef.current.getBoundingClientRect();
    const { scrollWidth, clientWidth } = scrollRef.current;
    
    const percentage = Math.max(0, Math.min(1, (clientX - left) / width));
    scrollRef.current.scrollLeft = percentage * (scrollWidth - clientWidth);
  };

  const onScrubberMouseDown = (e: React.MouseEvent) => {
    setIsScrubberDragging(true);
    handleScrubberAction(e.clientX);
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (isScrubberDragging) handleScrubberAction(e.clientX);
    };
    const handleUp = () => setIsScrubberDragging(false);

    if (isScrubberDragging) {
      window.addEventListener("mousemove", handleMove);
      window.addEventListener("mouseup", handleUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [isScrubberDragging]);

  return (
    <div className="relative group/nav mt-8">

      <div className="relative border-b border-white/5 pb-1">
        {/* Left Fade */}
        <AnimatePresence>
          {showLeftFade && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-black via-black/80 to-transparent z-20 pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* Right Fade */}
        <AnimatePresence>
          {showRightFade && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-black via-black/80 to-transparent z-20 pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* Scroll Container */}
        <div 
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`flex items-center space-x-2 overflow-x-auto no-scrollbar relative z-10 select-none ${isDragging ? 'cursor-grabbing' : 'cursor-default'}`}
          style={{ scrollBehavior: isDragging || isScrubberDragging ? 'auto' : 'smooth' }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const isHighPriority = tab.priority === "high";
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex items-center gap-2.5 px-4 py-3 group/tab transition-all duration-300 whitespace-nowrap`}
              >
                <div className={`relative flex items-center justify-center`}>
                  <tab.icon className={`h-4 w-4 transition-all duration-300 ${isActive ? 'text-white scale-110' : 'text-zinc-500 group-hover/tab:text-zinc-300'}`} />
                  {isHighPriority && (
                    <motion.div 
                      layoutId={`glow-${tab.id}`}
                      className="absolute inset-0 bg-brand-crimson/20 blur-md rounded-full -z-10"
                      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                  )}
                  {tab.status === "active" && (
                    <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-brand-crimson rounded-full animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
                  )}
                </div>

                <span className={`text-[13px] font-medium tracking-tight transition-all duration-300 ${isActive ? 'text-white tracking-normal' : 'text-zinc-500 group-hover/tab:text-zinc-300'}`}>
                  {tab.name}
                </span>

                {tab.badge !== undefined && (
                  <span className={`ml-2 px-1.5 py-0.5 rounded-md text-[10px] font-bold border transition-colors ${isActive ? 'bg-white/10 text-white border-white/20' : 'bg-white/5 text-zinc-600 border-white/5 group-hover/tab:border-white/10'}`}>
                    {tab.badge}
                  </span>
                )}

                {/* Floating Active Tracker Underline */}
                {isActive && (
                  <motion.div 
                    layoutId="activeTabTracker"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)] z-30"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}

                {/* Subtle hover glow */}
                <div className="absolute inset-x-2 inset-y-1 bg-white/0 group-hover/tab:bg-white/5 rounded-lg transition-colors -z-10" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Cinematic Horizontal Scrubber (Interactive sliding bar) */}
      <div 
        className={`mt-2 py-2 px-1 cursor-ew-resize transition-all duration-500 ${isScrubberDragging ? 'opacity-100' : 'opacity-0 group-hover/nav:opacity-60'}`}
        onMouseDown={onScrubberMouseDown}
      >
        <div ref={scrubberRef} className="h-[2px] w-full bg-white/5 relative overflow-hidden rounded-full">
          {/* Progress Bar Thumb */}
          <motion.div 
            className={`absolute top-0 bottom-0 bg-zinc-400 rounded-full transition-colors ${isScrubberDragging ? 'bg-white' : ''}`}
            style={{ 
              width: '15%', 
              left: `${scrollProgress * 85}%` // 85% to account for 15% width thumb
            }} 
          />
        </div>
      </div>
    </div>
  );
}
