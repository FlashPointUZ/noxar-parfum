'use client';

import React from 'react';

export const AnnouncementBar: React.FC = () => {
  return (
    <div className="h-8 bg-surface-2 dark:bg-[#1f1c19] text-text-muted text-[10px] uppercase tracking-[0.2em] font-medium flex items-center justify-center px-4 border-b border-border-hairline transition-colors">
      <span>Toshkent bo‘ylab tezkor yetkazib berish · 500 000 so‘mdan yuqori xaridlarga bepul</span>
    </div>
  );
};
