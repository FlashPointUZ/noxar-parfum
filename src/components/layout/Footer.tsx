'use client';

import React from 'react';
import { Send, Instagram } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-surface-0 border-t border-border-hairline pt-16 pb-24 md:pb-16 text-xs text-text-muted transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-border-hairline">
          {/* Logo & Falsafa */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border border-gold-primary flex items-center justify-center font-serif text-lg text-gold-primary font-bold">
                N
              </div>
              <div>
                <span className="font-serif text-base tracking-[0.2em] font-semibold text-text-main block">
                  NOXAR
                </span>
                <span className="text-[7px] tracking-[0.35em] text-gold-primary uppercase font-sans">
                  PARFUM
                </span>
              </div>
            </div>
            <p className="text-text-muted text-xs leading-relaxed max-w-sm font-light">
              Sening izing. Sening hikoyang. Biz har bir insonga o‘zining unutilmas shaxsiy hidini topishga ko‘maklashamiz.
            </p>
          </div>

          {/* Havolalar */}
          <div className="md:col-span-3 space-y-3">
            <span className="text-[11px] uppercase tracking-wider text-text-main font-semibold block">
              Navigatsiya
            </span>
            <ul className="space-y-2">
              <li>
                <a href="#new" className="hover:text-gold-primary transition-colors">
                  Yangi Kolleksiya
                </a>
              </li>
              <li>
                <a href="#catalog" className="hover:text-gold-primary transition-colors">
                  Katalog
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-gold-primary transition-colors">
                  Biz haqimizda
                </a>
              </li>
              <li>
                <a href="#reviews" className="hover:text-gold-primary transition-colors">
                  Sharhlar
                </a>
              </li>
            </ul>
          </div>

          {/* Aloqa & Showroom */}
          <div className="md:col-span-4 space-y-3">
            <span className="text-[11px] uppercase tracking-wider text-text-main font-semibold block">
              Showroom & Aloqa
            </span>
            <p className="text-xs leading-relaxed text-text-muted font-light">
              Toshkent sh., Bekbaraka bozori, 12-qator, 2-blok, 472-magazin.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://t.me"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full border border-border-hairline hover:border-gold-primary flex items-center justify-center text-text-muted hover:text-gold-primary transition-all"
                title="Telegram"
              >
                <Send className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full border border-border-hairline hover:border-gold-primary flex items-center justify-center text-text-muted hover:text-gold-primary transition-all"
                title="Instagram"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-text-dim">
          <span>© 2026 NOXAR PARFUM. Barcha huquqlar himoyalangan.</span>
          <span>Toshkentda mehr bilan yaratilgan.</span>
        </div>
      </div>
    </footer>
  );
};
