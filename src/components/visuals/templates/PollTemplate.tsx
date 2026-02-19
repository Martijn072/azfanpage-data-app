import { forwardRef } from 'react';

interface PollTemplateProps {
  question: string;
  backgroundImage?: string | null;
}

export const PollTemplate = forwardRef<HTMLDivElement, PollTemplateProps>(
  ({ question, backgroundImage }, ref) => {
    return (
      <div ref={ref} style={{ width: 1080, height: 1080 }} className="relative overflow-hidden">
        {backgroundImage ? (
          <img src={backgroundImage} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div className="absolute inset-0 bg-[#0F1117]" />
        )}

        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(160deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.8) 100%)' }}
        />

        {/* Red top bar */}
        <div className="absolute top-0 left-0 right-0 h-[6px] z-10" style={{ background: 'linear-gradient(90deg, #DB0021 0%, #DB0021 60%, transparent 100%)' }} />

        {/* Question content */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-16 text-center">
          <p
            className="text-white font-headline font-black leading-tight"
            style={{ fontSize: question.length > 100 ? 48 : question.length > 50 ? 56 : 68, textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}
          >
            {question || 'Wat denk jij?'}
          </p>

          <div className="mt-10 flex items-center gap-3">
            <div className="w-12 h-[3px] bg-white/80" />
            <span className="text-white/70 font-body font-semibold uppercase tracking-widest" style={{ fontSize: 24, textShadow: '0 1px 6px rgba(0,0,0,0.7)' }}>
              Wat denk jij?
            </span>
            <div className="w-12 h-[3px] bg-white/80" />
          </div>
        </div>

        {/* Logo */}
        <div className="absolute top-14 right-10 z-10">
          <img src="/images/az-fanpage-logo.png" alt="AZ Fanpage" className="h-20 w-auto opacity-80" />
        </div>
      </div>
    );
  }
);

PollTemplate.displayName = 'PollTemplate';
