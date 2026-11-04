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
    <div className="h-7 sm:h-8 bg-surface-2 dark:bg-[#1b1815] text-text-muted text-[9px] sm:text-[10.5px] uppercase tracking-wider sm:tracking-[0.18em] font-medium flex items-center justify-center px-3 sm:px-4 border-b border-border-hairline transition-colors text-center overflow-hidden">
      <span className="truncate max-w-3xl">{announcement.text}</span>
    </div>
  );
};
