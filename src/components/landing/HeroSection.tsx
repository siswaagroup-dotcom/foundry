"use client";

import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="relative flex h-full min-h-screen flex-col justify-between bg-[#090706] p-10 sm:p-14 xl:p-20 text-white select-none overflow-hidden">
      
      {/* BACKGROUND DECORATION (Inspired by the line art in login-page-example-saleskip.jpg) */}
      <div className="absolute inset-0 opacity-[0.15] pointer-events-none mix-blend-screen">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <g stroke="rgba(249, 115, 22, 0.3)" strokeWidth="1.5" fill="none">
            <path d="M-100,200 Q300,400 100,800 T900,1000" />
            <path d="M-50,250 Q350,450 150,850 T950,1050" />
            <path d="M0,300 Q400,500 200,900 T1000,1100" />
          </g>
        </svg>
      </div>

      {/* Subtle Warm Ambient Core Glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-orange-600/10 blur-[130px] pointer-events-none" />

      {/* 1. BRAND LOGO */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "linear" }}
        className="relative z-10 flex items-center gap-3.5"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 font-black text-base text-white shadow-lg shadow-orange-600/20">
          F
        </div>
        <span className="text-lg font-bold tracking-tight text-stone-100">Foundry</span>
      </motion.div>

      {/* 2. CORE CONTENT STACK */}
      <div className="relative z-10 my-auto max-w-lg space-y-8">
        
        {/* Minimalist Graphic Asset */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="w-14 h-14 text-orange-500 bg-orange-500/10 rounded-2xl p-3 border border-orange-500/20"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </motion.div>

        {/* Text Stack */}
        <div className="space-y-5">
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-5xl font-black leading-[1.1] tracking-tight text-white xl:text-6xl"
          >
            Hello <br />
            <span className="bg-gradient-to-r from-white via-stone-100 to-stone-400 bg-clip-text text-transparent">
              Foundry!
            </span> 
            <motion.span 
              animate={{ rotate: [0, 15, -10, 15, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
              className="inline-block ml-3 origin-bottom-right"
            >
              👋
            </motion.span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-base leading-relaxed text-stone-400 max-w-md"
          >
            Skip manual roadblocks. Automate product workflows, track team progress metrics, and ship features from a unified terminal.
          </motion.p>
        </div>

      </div>

      {/* 3. LEGAL FOOTER INFO */}
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="relative z-10 text-xs text-stone-600 font-medium tracking-wide"
      >
        &copy; {new Date().getFullYear()} Foundry Inc. All rights reserved.
      </motion.p>

    </section>
  );
}