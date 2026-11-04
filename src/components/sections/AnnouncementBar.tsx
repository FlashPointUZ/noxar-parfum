'use client';

import React from 'react';
import { useSiteContentStore } from '@/store/useSiteContentStore';

export const AnnouncementBar: React.FC = () => {
  const { content } = useSiteContentStore();
  const announcement = content.announcement;

  if (!announcement || announcement.active === false) {
    return null;
  }

  return (
    <div className="min-h-[28px] sm:h-8 py-1.5 sm:py-0 bg-surface-2 dark:bg-[#1f1c19] text-text-muted text-[9.5px] sm:text-[10px] uppercase tracking-wider sm:tracking-[0.2em] font-medium flex items-center justify-center px-3 sm:px-4 border-b border-border-hairline transition-colors text-center leading-snug">
      <span className="max-w-3xl">{announcement.text}</span>
    </div>
  );
};
