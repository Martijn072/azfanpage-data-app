import { forwardRef } from 'react';

interface BreakingTemplateProps {
  headline: string;
  subtitle: string;
  backgroundImage?: string | null;
  format?: 'square' | 'story';
}

export const BreakingTemplate = forwardRef<HTMLDivElement, BreakingTemplateProps>(
  ({ headline, subtitle, backgroundImage, format = 'square' }, ref) => {
    const isStory = format === 'story';
    const height = isStory ? 1920 : 1080;
    return (
      <div ref={ref} style={{ width: 1080, height }} className="relative overflow-hidden">
        {backgroundImage ? (
          <img src={backgroundImage} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div className="absolute inset-0 bg-[#0F1117]" />
        )}

        <div className="absolute inset-0 bg-black/40" />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 35%, transparent 60%)' }}
        />

        {/* Red top bar */}
        <div className="absolute top-0 left-0 right-0 h-[6px] z-10" style={{ background: 'linear-gradient(90deg, #DB0021 0%, #DB0021 60%, transparent 100%)' }} />

        {/* Breaking badge */}
        <div className={`absolute left-14 right-36 z-10 ${isStory ? 'bottom-24' : 'bottom-14'}`}>
          <div
            className="inline-block px-5 py-2 mb-5"
            style={{ background: '#DB0021' }}
          >
            <span className="text-white font-headline font-black uppercase tracking-widest" style={{ fontSize: 28 }}>
              Breaking
            </span>
          </div>

          <p
            className="text-white font-headline font-black leading-tight"
            style={{ fontSize: headline.length > 60 ? 52 : headline.length > 30 ? 64 : 80, textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}
          >
            {headline || 'Headline'}
          </p>

          {(subtitle || !headline) && (
            <p className="text-white/80 font-body font-medium mt-4" style={{ fontSize: 36, textShadow: '0 1px 6px rgba(0,0,0,0.7)' }}>
              {subtitle || 'Subtitel'}
            </p>
          )}
        </div>

        {/* Logo */}
        <div className="absolute top-14 right-10 z-10">
          <img src="/images/az-fanpage-logo.png" alt="AZ Fanpage" className="h-24 w-auto" />
        </div>
      </div>
    );
  }
);

BreakingTemplate.displayName = 'BreakingTemplate';
