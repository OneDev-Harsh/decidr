"use client";

import { motion } from "framer-motion";
import { ScreenshotParallax } from "./ScreenshotParallax";
import { LucideIcon } from "lucide-react";
import { OperationalIcon } from "./OperationalIcon";

interface FeatureShowcaseProps {
  title: string;
  subtitle: string;
  description: string;
  screenshot: string;
  icon: LucideIcon;
  reversed?: boolean;
  id?: string;
  bullets?: { title: string; text: string }[];
}

export function FeatureShowcase({
  title,
  subtitle,
  description,
  screenshot,
  icon: Icon,
  reversed = false,
  id,
  bullets = []
}: FeatureShowcaseProps) {
  return (
    <section id={id} className="py-32 relative">
      <div className="container mx-auto px-6">
        <div className={`flex flex-col ${reversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-20`}>
          {/* Content Column */}
          <div className="flex-1 space-y-8">
            <motion.div
              initial={{ opacity: 0, x: reversed ? 20 : -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4">
                <OperationalIcon icon={Icon} />
                <span className="text-[12px] font-bold uppercase tracking-[0.4em] text-zinc-400">
                  {subtitle}
                </span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white leading-[1.1] uppercase">
                {title}
              </h2>
              <p className="text-xl text-zinc-300 leading-relaxed max-w-xl font-medium">
                {description}
              </p>
            </motion.div>

            {bullets.length > 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                className="grid gap-6 mt-12"
              >
                {bullets.map((bullet, idx) => (
                  <div key={idx} className="flex gap-5 p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all group/bullet">
                    <div className="mt-1.5 h-2 w-2 rounded-full bg-white/40 shrink-0 shadow-[0_0_10px_rgba(255,255,255,0.2)] group-hover/bullet:scale-125 transition-transform" />
                    <div className="space-y-2">
                      <h4 className="text-[16px] font-bold text-white tracking-tight">{bullet.title}</h4>
                      <p className="text-sm text-zinc-300 leading-relaxed font-medium">{bullet.text}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </div>

          {/* Screenshot Column */}
          <div className="flex-1 relative w-full">
            <div className="relative aspect-[16/10] w-full">
              {/* Decorative glow behind screenshot */}
              <div className="absolute inset-0 bg-white/5 blur-[100px] rounded-full pointer-events-none" />
              
              <ScreenshotParallax 
                src={screenshot} 
                alt={title} 
                className="w-full h-full object-cover z-10"
                rotate={reversed ? -2 : 2}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
