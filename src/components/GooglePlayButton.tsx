import React from 'react';

interface GooglePlayButtonProps {
  url: string;
  className?: string;
}

const GooglePlayButton: React.FC<GooglePlayButtonProps> = ({ url, className = '' }) => {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center bg-black dark:bg-white border border-white/5 dark:border-black/5 rounded-2xl transition-all duration-300 hover:bg-neutral-900 dark:hover:bg-neutral-100 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl h-14 md:h-16 w-full sm:w-auto px-6 overflow-hidden ${className}`}
    >
      <div className="flex items-center gap-3">
        <img
          src="/icons8-google-play-96.png"
          alt="Google Play"
          className="w-7 h-7 md:w-8 md:h-8 object-contain shrink-0"
        />

        <div className="flex flex-col items-start leading-none group">
          <span className="text-[10px] font-bold text-white/70 dark:text-black/60 uppercase tracking-widest">GET IT ON</span>
          <span className="text-lg md:text-xl font-black text-white dark:text-black tracking-tight">Google Play</span>
        </div>
      </div>
    </a>
  );
};

export default GooglePlayButton;
