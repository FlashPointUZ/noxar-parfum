'use client';

import { create } from 'zustand';
import { SiteContent } from '@/types/database';
import { contentService, initialSiteContent } from '@/services/contentService';

export { initialSiteContent };

interface SiteContentStore {
  content: SiteContent;
  loading: boolean;
  initialized: boolean;
  fetchContent: () => Promise<void>;
  updateSection: <K extends keyof SiteContent>(section: K, data: SiteContent[K]) => Promise<boolean>;
  updateFullContent: (data: Partial<SiteContent>) => Promise<boolean>;
}

export const useSiteContentStore = create<SiteContentStore>((set, get) => ({
  content: initialSiteContent,
  loading: false,
  initialized: false,

  fetchContent: async () => {
    try {
      set({ loading: true });
      const data = await contentService.fetchContent();
      set({ content: data, initialized: true });
    } catch (err) {
      console.warn('Site content fetch xatosi:', err);
      set({ initialized: true });
    } finally {
      set({ loading: false });
    }
  },

  updateSection: async <K extends keyof SiteContent>(section: K, data: SiteContent[K]) => {
    // Optimistik mahalliy yangilash
    const current = get().content;
    const updated = {
      ...current,
      [section]: data,
    };
    set({ content: updated });

    return await contentService.updateSection(section, data);
  },

  updateFullContent: async (data: Partial<SiteContent>) => {
    const current = get().content;
    const merged = { ...current, ...data };
    set({ content: merged });

    return await contentService.updateFullContent(data);
  },
}));
