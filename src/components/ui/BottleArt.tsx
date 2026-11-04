import React from 'react';

interface BottleArtProps {
  art?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const BottleArt: React.FC<BottleArtProps> = ({ art = 'black-art', size = 'md', className = '' }) => {
  const isLight = art === 'cream-art';
  const isRose = art === 'rose-art';

  const sizeClasses = {
    sm: 'w-16 h-28',
    md: 'w-24 h-40',
    lg: 'w-36 h-56',
  };

  const capSizes = {
    sm: 'w-8 h-5 -top-4',
    md: 'w-12 h-7 -top-6',
    lg: 'w-16 h-10 -top-8',
  };

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* Flakon korpusi */}
      <div
        className={`relative rounded-t-xl rounded-b-2xl flex flex-col items-center justify-center transition-transform duration-500 hover:scale-105 ${sizeClasses[size]} ${
          isLight
            ? 'bg-gradient-to-r from-[#d9cfc2] via-[#faf4eb] to-[#bfb3a4] text-[#42372c] bottle-shadow-light'
            : isRose
            ? 'bg-gradient-to-r from-[#8c554b] via-[#f0cfc2] to-[#73403a] text-[#361916] bottle-shadow'
            : 'bg-gradient-to-r from-[#0c0c0c] via-[#2c241b] to-[#0c0c0c] text-[#e5c785] bottle-shadow'
        }`}
      >
        {/* Qopqoq (Gold Cap) */}
        <div
          className={`absolute rounded-t-sm bg-gradient-to-r from-[#b5904e] via-[#f7dda0] to-[#9d7537] shadow-md border border-[#ffffff33] ${capSizes[size]}`}
        />

        {/* Shisha yorug'lik aks ettirishi */}
        <div className="absolute inset-y-2 left-2 w-1.5 bg-gradient-to-b from-white/40 via-white/10 to-transparent rounded-full pointer-events-none" />

        {/* Ichki etiketka */}
        <div
          className={`border border-current/40 px-3 py-2 text-center rounded-sm backdrop-blur-[1px] ${
            size === 'sm' ? 'scale-75' : size === 'lg' ? 'scale-110' : ''
          }`}
        >
          <span className="block font-serif font-bold tracking-widest text-lg leading-none">N</span>
          <span className="block text-[7px] tracking-[0.25em] opacity-75 mt-1 font-sans">EXTRAIT</span>
        </div>
      </div>
    </div>
  );
};
