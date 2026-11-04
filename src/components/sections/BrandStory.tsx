'use client';

import React from 'react';
import { MapPin, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';

export const BrandStory: React.FC = () => {
  const openMaps = () => {
    window.open(
      'https://www.google.com/maps/search/?api=1&query=Bekbaraka+bozori+12-qator+2-blok+472-magazin',
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <section id="about" className="py-20 lg:py-28 border-b border-border-hairline bg-surface-1/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Chap tomon: Vizual Kartochka */}
          <div className="lg:col-span-5 bg-surface-1 rounded-2xl border border-border-hairline p-8 sm:p-12 relative overflow-hidden flex flex-col justify-between min-h-[380px]">
            <div className="w-16 h-16 rounded-full border border-gold-primary/30 flex items-center justify-center font-serif text-3xl text-gold-primary">
              N
            </div>

            <div className="space-y-4 my-8">
              <span className="text-[10px] uppercase tracking-[0.25em] text-gold-primary block font-medium">
                Toshkent, O‘zbekiston
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-normal text-text-main leading-snug">
                Haqiqiy parfyumeriya san’ati va beqiyos his-tuyg‘ular.
              </h3>
            </div>

            <div className="pt-6 border-t border-border-hairline flex items-center justify-between text-xs text-text-muted">
              <span>Showroom & Do‘kon</span>
              <button
                type="button"
                onClick={openMaps}
                className="text-gold-primary hover:text-gold-light inline-flex items-center gap-1 font-medium"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Bekbaraka, 472-do‘kon</span>
              </button>
            </div>
          </div>

          {/* O'ng tomon: Brend Falsafasi va Afzalliklari */}
          <div className="lg:col-span-7 space-y-8">
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-gold-primary block mb-2 font-medium">
                Bizning Falsafamiz
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-text-main leading-tight">
                Har bir inson o‘z <span className="italic text-gold-light">izini</span> qoldiradi.
              </h2>
              <p className="text-text-muted text-sm sm:text-base leading-relaxed mt-4 font-light max-w-xl">
                NOXAR PARFUM — bu shunchaki atir do‘koni emas. Bu o‘ziga xoslik, jasorat va nafosat timsoli bo‘lgan
                tanlangan hidlar maskanidir. Biz har bir notani ehtiyotkorlik bilan tanlaymiz, toki siz xonaga
                kirganingizda ham, ketganingizdan keyin ham xotiralar siz haqingizda so‘zlasin.
              </p>
            </div>

            {/* Afzalliklar Mini-Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-xl bg-surface-1 border border-border-hairline">
                <ShieldCheck className="w-5 h-5 text-gold-primary mb-2" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-text-main">100% Original</h4>
                <p className="text-[11px] text-text-muted mt-1">Faqat sertifikatlangan premium kompozitsiyalar</p>
              </div>

              <div className="p-4 rounded-xl bg-surface-1 border border-border-hairline">
                <Sparkles className="w-5 h-5 text-gold-primary mb-2" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-text-main">Uzoq Saqlanish</h4>
                <p className="text-[11px] text-text-muted mt-1">8 soatdan 12 soatgacha toza va boy ochilish</p>
              </div>

              <div className="p-4 rounded-xl bg-surface-1 border border-border-hairline">
                <RefreshCw className="w-5 h-5 text-gold-primary mb-2" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-text-main">14 Kun Qaytarish</h4>
                <p className="text-[11px] text-text-muted mt-1">Shartlar asosida xavfsiz va ishonchli xarid</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
