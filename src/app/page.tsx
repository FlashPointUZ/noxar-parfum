import { HeroSection } from '@/components/sections/HeroSection';
import { NewCollectionBento } from '@/components/sections/NewCollectionBento';
import { CatalogSection } from '@/components/sections/CatalogSection';
import { BrandStory } from '@/components/sections/BrandStory';
import { Testimonials } from '@/components/sections/Testimonials';

export default function Home() {
  return (
    <>
      <HeroSection />
      <NewCollectionBento />
      <CatalogSection />
      <BrandStory />
      <Testimonials />
    </>
  );
}
