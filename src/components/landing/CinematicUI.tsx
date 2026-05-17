"use client";

import { motion, useScroll, useTransform, HTMLMotionProps } from "framer-motion";
import { ReactNode, useRef } from "react";
import { LucideIcon } from "lucide-react";

/**
 * AtmosphericTopology
 * A deeply layered, slow-moving SVG topology grid that reacts to scroll position,
 * creating a sense of infinite, computationally alive space.
 */
export function AtmosphericTopology() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 2000], [0, -100]);
  const y2 = useTransform(scrollY, [0, 2000], [0, -200]);

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-black">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/40 via-black to-black opacity-60" />
      
      <motion.div style={{ y: y1 }} className="absolute inset-0 opacity-[0.15]">
        <svg className="w-full h-[200%]" viewBox="0 0 100 200" preserveAspectRatio="none">
          <defs>
            <pattern id="grid-large" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.03" />
            </pattern>
          </defs>
          <rect width="100" height="200" fill="url(#grid-large)" />
        </svg>
      </motion.div>

      <motion.div style={{ y: y2 }} className="absolute inset-0 opacity-[0.08]">
        <svg className="w-full h-[200%]" viewBox="0 0 100 200" preserveAspectRatio="none">
          <defs>
            <pattern id="grid-small" width="2" height="2" patternUnits="userSpaceOnUse">
              <path d="M 2 0 L 0 0 0 2" fill="none" stroke="white" strokeWidth="0.01" />
            </pattern>
          </defs>
          <rect width="100" height="200" fill="url(#grid-small)" />
        </svg>
      </motion.div>
      
      {/* Edge fading */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black" />
    </div>
  );
}

/**
 * PremiumBadge
 * A highly refined, restrained typography element for section labeling.
 */
export function PremiumBadge({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex items-center gap-3 mb-8">
      <div className="h-px w-6 bg-brand-crimson/50" />
      <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">
        {children}
      </span>
    </div>
  );
}

/**
 * CinematicArchitectureBlock
 * Large, immersive storytelling sections with sticky-scroll reveals.
 * The text stays sticky on the left while complex visual diagrams scroll on the right (on desktop).
 */
export function CinematicArchitectureBlock({ 
  badge, 
  title, 
  description, 
  visuals 
}: { 
  badge: string; 
  title: string; 
  description: ReactNode; 
  visuals: ReactNode;
}) {
  return (
    <section className="relative py-32 border-t border-white/[0.02]">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-20 items-start">
          {/* Sticky Text Column */}
          <div className="lg:w-5/12 lg:sticky lg:top-40">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="space-y-6"
            >
              <PremiumBadge>{badge}</PremiumBadge>
              <h2 className="text-4xl md:text-6xl font-medium tracking-tight text-white leading-[1.1]">
                {title}
              </h2>
              <div className="text-lg text-zinc-400 leading-relaxed font-serif pt-4 space-y-6">
                {description}
              </div>
            </motion.div>
          </div>

          {/* Scrolling Visual Column */}
          <div className="lg:w-7/12 w-full space-y-8">
            {visuals}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * IntelligenceNode
 * Glassmorphic, zinc-layered components that display "live" simulation data or content blocks.
 */
export function IntelligenceNode({ 
  icon: Icon, 
  title, 
  children,
  delay = 0,
  active = false
}: { 
  icon?: LucideIcon; 
  title: string; 
  children: ReactNode;
  delay?: number;
  active?: boolean;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`relative p-8 rounded-2xl bg-zinc-900/40 border backdrop-blur-xl transition-all duration-700
        ${active ? 'border-brand-crimson/30 shadow-[0_0_30px_rgba(220,38,38,0.1)]' : 'border-white/[0.05] hover:border-white/10 hover:bg-zinc-900/60'}`}
    >
      {active && (
        <div className="absolute top-0 right-0 p-4">
          <div className="w-2 h-2 rounded-full bg-brand-crimson animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.8)]" />
        </div>
      )}
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/[0.03]">
        {Icon && (
          <div className={`p-2.5 rounded-lg border ${active ? 'bg-brand-crimson/10 border-brand-crimson/20 text-brand-crimson' : 'bg-white/[0.02] border-white/[0.05] text-zinc-400'}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
        <h3 className="text-xl font-medium tracking-tight text-white">{title}</h3>
      </div>
      <div className="text-sm text-zinc-400 leading-relaxed font-serif">
        {children}
      </div>
    </motion.div>
  );
}

/**
 * VisualPulseLine
 * A subtle, glowing line that animates to show data flow between components.
 */
export function VisualPulseLine({ vertical = false, delay = 0 }) {
  return (
    <div className={`relative bg-white/[0.02] ${vertical ? 'w-px h-full min-h-[100px]' : 'h-px w-full'}`}>
      <motion.div 
        initial={{ [vertical ? 'top' : 'left']: '-100%' }}
        animate={{ [vertical ? 'top' : 'left']: '200%' }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear", delay }}
        className={`absolute bg-gradient-to-${vertical ? 'b' : 'r'} from-transparent via-brand-crimson/50 to-transparent
          ${vertical ? 'w-px h-32 -translate-x-1/2 left-1/2' : 'h-px w-32 -translate-y-1/2 top-1/2'}`}
      />
    </div>
  );
}
