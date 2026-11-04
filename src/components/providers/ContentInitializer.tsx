'use client';

import { useEffect } from 'react';
import { useSiteContentStore } from '@/store/useSiteContentStore';

export const ContentInitializer: React.FC = () => {
  const { fetchContent } = useSiteContentStore();

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  return null;
};
