'use client';

import React from 'react';
import { BottleArt } from '@/components/ui/BottleArt';
import { ArrowUpRight } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section id="home" className="relative min-h-[640px] lg:min-h-[720px] flex items-center overflow-hidden border-b border-border-hairline">
      {/* Orqa fon nafis nur effekti */}
      <div className="absolute right-[10%] top-[20%] w-[380px] h-[380px] rounded-full bg-gold-primary/10 blur-[90px] pointer-events-none" />
      <div className="absolute left-[5%] bottom-[10%] w-[260px] h-[260px] rounded-full bg-surface-2/40 blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Chap tomon: Asimmetrik Tipografiya */}
        <div className="lg:col-span-7 space-y-6 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold-primary/30 text-[10px] uppercase tracking-[0.25em] text-gold-primary bg-gold-primary/5">
            <span>Hid — bu xotira</span>
          </div>

          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-normal tracking-tight text-text-main leading-[1.02]">
            O‘zingning <br />
            <span className="italic font-normal text-gold-light">afsonangni</span> <br />
            yarat.
          </h1>

          <p className="text-text-muted text-sm sm:text-base max-w-lg leading-relaxed font-light">
            Har bir tomchida xarakter, har bir notada sening beqiyos hikoyang. NOXAR bilan unutilmas va nafis iz qoldir.
          </p>

          <div className="pt-4 flex flex-wrap items-center gap-4">
            <a
              href="#catalog"
              className="inline-flex items-center gap-3 px-7 py-3.5 rounded-full bg-gold-primary hover:bg-gold-light text-black font-semibold text-xs uppercase tracking-widest transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-gold-primary/20"
            >
              <span>Kolleksiyani ko‘rish</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
            <a
              href="#about"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-border-hairline hover:border-gold-primary/50 text-text-main text-xs uppercase tracking-widest hover:bg-surface-1 transition-all"
            >
              <span>Biz haqimizda</span>
            </a>
          </div>
        </div>

        {/* O'ng tomon: Flakon Kompozitsiyasi */}
        <div className="lg:col-span-5 flex justify-center items-center relative py-8">
          {/* Halqalar */}
          <div className="absolute w-[340px] sm:w-[420px] h-[340px] sm:h-[420px] rounded-full border border-gold-primary/20 pointer-events-none" />
          <div className="absolute w-[240px] sm:w-[300px] h-[240px] sm:h-[300px] rounded-full border border-border-hairline pointer-events-none" />

          {/* Katta va kichik flakonlar uyg'unligi */}
          <div className="relative z-10 flex items-end justify-center gap-4 sm:gap-6">
            <div className="transform -rotate-6 translate-y-3 transition-transform duration-700 hover:rotate-0">
              <BottleArt art="black-art" size="lg" />
              <div className="text-center mt-3 text-[11px] font-serif text-text-muted">
                NO. 01 <span className="text-gold-primary">—</span> Obsidian
              </div>
            </div>

            <div className="transform rotate-6 -translate-y-4 hidden sm:block transition-transform duration-700 hover:rotate-0">
              <BottleArt art="cream-art" size="md" />
              <div className="text-center mt-3 text-[10px] font-serif text-text-muted">
                NO. 02 <span className="text-gold-primary">—</span> Santal
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
