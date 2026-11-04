'use client';

import React from 'react';

export const AnnouncementBar: React.FC = () => {
  return (
    <div className="h-8 bg-surface-2 dark:bg-[#1f1c19] text-text-muted text-[10px] uppercase tracking-[0.2em] font-medium flex items-center justify-center px-4 border-b border-border-hairline transition-colors">
      <span>Bepul yetkazib berish — 500 000 so‘mdan yuqori xaridlarga</span>
      <span className="text-gold-primary ml-3 animate-pulse">✦</span>
    </div>
  );
};
