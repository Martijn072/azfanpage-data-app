import { forwardRef } from 'react';

interface PlayerHighlightTemplateProps {
  playerName: string;
  tagline: string;
  backgroundImage?: string | null;
  format?: 'square' | 'story';
}

export const PlayerHighlightTemplate = forwardRef<HTMLDivElement, PlayerHighlightTemplateProps>(
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

        {/* Base overlay + gradient for text legibility */}
        <div className="absolute inset-0 bg-black/40" />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 35%, transparent 60%)' }}
        />

        {/* Red top bar */}
        <div
          className="absolute top-0 left-0 right-0 h-[6px] z-10"
          style={{ background: 'linear-gradient(90deg, #DB0021 0%, #DB0021 60%, transparent 100%)' }}
        />

        {/* Text content bottom-left */}
        <div className={`absolute left-14 right-36 z-10 ${isStory ? 'bottom-24' : 'bottom-14'}`}>
          <p
            className="text-white font-headline font-black leading-none"
            style={{ fontSize: playerName.length > 16 ? 72 : 88, textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}
          >
            {playerName || 'Spelernaam'}
          </p>
          {(tagline || !playerName) && (
            <p
              className="text-white/80 font-body font-medium mt-3"
              style={{ fontSize: 36, textShadow: '0 1px 6px rgba(0,0,0,0.7)' }}
            >
              {tagline || 'Man of the Match'}
            </p>
          )}
        </div>

        {/* AZ Fanpage logo top-right */}
        <div className="absolute top-14 right-10 z-10">
          <img src="/images/az-fanpage-logo.png" alt="AZ Fanpage" className="h-20 w-auto opacity-80" />
        </div>
      </div>
    );
  }
);

PlayerHighlightTemplate.displayName = 'PlayerHighlightTemplate';
