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
    <div className="h-8 bg-surface-2 dark:bg-[#1f1c19] text-text-muted text-[10px] uppercase tracking-[0.2em] font-medium flex items-center justify-center px-4 border-b border-border-hairline transition-colors">
      <span>{announcement.text}</span>
    </div>
  );
};
