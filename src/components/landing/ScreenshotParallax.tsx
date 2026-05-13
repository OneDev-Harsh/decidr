"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

interface ScreenshotParallaxProps {
  src: string;
  alt: string;
  delay?: number;
  rotate?: number;
  scale?: number;
  className?: string;
}

export function ScreenshotParallax({ 
  src, 
  alt, 
  delay = 0, 
  rotate = 0, 
  scale = 1,
  className 
}: ScreenshotParallaxProps) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  
  const y = useSpring(useTransform(scrollYProgress, [0, 1], [30, -30]), springConfig);
  const r = useSpring(useTransform(scrollYProgress, [0, 1], [rotate - 2, rotate + 2]), springConfig);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const blur = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [4, 0, 0, 4]);

  return (
    <motion.div
      ref={ref}
      style={{
        y,
        rotateZ: r,
        opacity,
        scale,
        filter: `blur(${blur}px)`
      }}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay }}
      className={`relative group rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-zinc-900/50 backdrop-blur-sm ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-brand-crimson/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
      <Image
        src={src}
        alt={alt}
        width={1200}
        height={800}
        className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-[1.02]"
      />
      {/* Edge Lighting Effect */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent" />
    </motion.div>
  );
}
