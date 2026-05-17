"use client";

import { motion } from "framer-motion";

export function AuthAtmosphere() {
  return (
    <div className="absolute inset-0 bg-black overflow-hidden pointer-events-none">
      {/* Base Grid - Subtle Operational Foundation */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Dynamic Topology Streams */}
      <svg className="absolute inset-0 w-full h-full opacity-30 blur-[60px]">
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="100" />
        </filter>
        
        <motion.circle 
          cx="30%" cy="40%" r="20%" 
          fill="rgba(220, 38, 38, 0.15)" // Crimson
          animate={{
            cx: ["30%", "35%", "30%"],
            cy: ["40%", "45%", "40%"],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        
        <motion.circle 
          cx="70%" cy="60%" r="25%" 
          fill="rgba(39, 39, 42, 0.2)" // Zinc
          animate={{
            cx: ["70%", "65%", "70%"],
            cy: ["60%", "55%", "60%"],
            scale: [1, 1.05, 1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
      </svg>

      {/* Floating Operational Nodes */}
      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-px bg-gradient-to-r from-transparent via-zinc-500/20 to-transparent w-full"
            style={{ top: `${(i + 1) * 15}%` }}
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: "linear",
              delay: i * 1.5
            }}
          />
        ))}
      </div>

      {/* Scanline Effect */}
      <div className="absolute inset-0 bg-scanlines opacity-[0.02]" />
      
      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-40" />
    </div>
  );
}
