import { forwardRef } from 'react';

interface QuoteTemplateProps {
  playerName: string;
  tagline: string; // used as the quote text
  backgroundImage?: string | null;
  format?: 'square' | 'story';
}

export const QuoteTemplate = forwardRef<HTMLDivElement, QuoteTemplateProps>(
  ({ playerName, tagline, backgroundImage, format = 'square' }, ref) => {
    const isStory = format === 'story';
    const height = isStory ? 1920 : 1080;
    return (
      <div
        ref={ref}
        style={{ width: 1080, height }}
        className="relative overflow-hidden"
      >
        {backgroundImage ? (
          <img src={backgroundImage} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div className="absolute inset-0 bg-[#0F1117]" />
        )}

        {/* Dark overlay for legibility */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(160deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.85) 100%)' }}
        />

        {/* Red top bar */}
        <div
          className="absolute top-0 left-0 right-0 h-[6px] z-10"
          style={{ background: 'linear-gradient(90deg, #DB0021 0%, #DB0021 60%, transparent 100%)' }}
        />

        {/* Quote content */}
        <div className="absolute inset-0 z-10 flex flex-col justify-center px-16">
          {/* Opening quote mark */}
          <span
            className="text-[#DB0021] font-headline font-black leading-none mb-2"
            style={{ fontSize: 120 }}
          >
            "
          </span>

          {/* Quote text */}
          <p
            className="text-white font-headline font-bold leading-tight -mt-12"
            style={{ fontSize: tagline.length > 120 ? 40 : tagline.length > 80 ? 48 : 56, textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}
          >
            {tagline || 'Typ hier het citaat...'}
          </p>

          {/* Player name */}
          <div className="mt-8 flex items-center gap-3">
            <div className="w-12 h-[3px] bg-white/80" />
            <p className="text-white/80 font-body font-semibold" style={{ fontSize: 32, textShadow: '0 1px 6px rgba(0,0,0,0.7)' }}>
              {playerName || 'Spelernaam'}
            </p>
          </div>
        </div>

        {/* AZ Fanpage logo top-right */}
        <div className="absolute top-14 right-10 z-10">
          <img src="/images/az-fanpage-logo.png" alt="AZ Fanpage" className="h-24 w-auto" />
        </div>
      </div>
    );
  }
);

QuoteTemplate.displayName = 'QuoteTemplate';
