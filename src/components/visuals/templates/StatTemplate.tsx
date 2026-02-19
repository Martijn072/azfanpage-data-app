import { forwardRef } from 'react';

interface StatTemplateProps {
  statValue: string;
  statLabel: string;
  backgroundImage?: string | null;
}

export const StatTemplate = forwardRef<HTMLDivElement, StatTemplateProps>(
  ({ statValue, statLabel, backgroundImage }, ref) => {
    return (
      <div ref={ref} style={{ width: 1080, height: 1080 }} className="relative overflow-hidden">
        {backgroundImage ? (
          <img src={backgroundImage} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div className="absolute inset-0 bg-[#0F1117]" />
        )}

        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.85) 100%)' }}
        />

        {/* Red top bar */}
        <div className="absolute top-0 left-0 right-0 h-[6px] z-10" style={{ background: 'linear-gradient(90deg, #DB0021 0%, #DB0021 60%, transparent 100%)' }} />

        {/* Stat content */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
          <span
            className="text-white font-headline font-black leading-none"
            style={{ fontSize: statValue.length > 4 ? 160 : 240, textShadow: '0 2px 16px rgba(0,0,0,0.8)' }}
          >
            {statValue || '0'}
          </span>
          <span
            className="text-white/90 font-headline font-bold uppercase tracking-widest mt-4"
            style={{ fontSize: 48, textShadow: '0 1px 6px rgba(0,0,0,0.7)' }}
          >
            {statLabel || 'Statistiek'}
          </span>
        </div>

        {/* Logo */}
        <div className="absolute top-14 right-10 z-10">
          <img src="/images/az-fanpage-logo.png" alt="AZ Fanpage" className="h-24 w-auto" style={{ mixBlendMode: 'screen' }} />
        </div>
      </div>
    );
  }
);

StatTemplate.displayName = 'StatTemplate';
