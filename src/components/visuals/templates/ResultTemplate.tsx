import { forwardRef } from 'react';
import { Fixture } from '@/types/footballApi';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

interface ResultTemplateProps {
  fixture: Fixture | null;
  backgroundImage?: string | null;
}

export const ResultTemplate = forwardRef<HTMLDivElement, ResultTemplateProps>(
  ({ fixture, backgroundImage }, ref) => {
    if (!fixture) {
      return (
        <div ref={ref} style={{ width: 1080, height: 1080 }} className="bg-[#0F1117] flex items-center justify-center">
          <p className="text-muted-foreground text-xl">Geen wedstrijddata beschikbaar</p>
        </div>
      );
    }

    const { teams, goals, league } = fixture;
    const matchDate = format(new Date(fixture.fixture.date), "d MMMM yyyy", { locale: nl });

    return (
      <div
        ref={ref}
        style={{ width: 1080, height: 1080 }}
        className="relative overflow-hidden flex flex-col items-center justify-center"
      >
        {backgroundImage ? (
          <>
            <img src={backgroundImage} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            <div className="absolute inset-0 bg-black/70" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-[#0F1117]" />
            <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 40%, rgba(219,0,33,0.08) 0%, transparent 60%)' }} />
          </>
        )}
        <div
          className="absolute top-0 left-0 right-0 h-[6px]"
          style={{ background: 'linear-gradient(90deg, #DB0021 0%, #DB0021 60%, transparent 100%)' }}
        />

        <div className="relative z-10 flex flex-col items-center w-full px-16">
          <div className="flex items-center gap-4 mb-3">
            <img src={league.logo} alt={league.name} className="h-10 w-10 object-contain" />
            <span className="text-white text-2xl font-body tracking-wide uppercase" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.7)' }}>
              {league.name} · {league.round}
            </span>
          </div>

          <p className="text-white/80 text-xl font-body mb-14" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.7)' }}>{matchDate}</p>

          <div className="flex items-center justify-center gap-12 w-full">
            <div className="flex flex-col items-center gap-5 flex-1">
              <img src={teams.home.logo} alt={teams.home.name} className="h-36 w-36 object-contain drop-shadow-lg" />
              <span className="text-white text-3xl font-headline font-semibold text-center leading-tight" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}>
                {teams.home.name}
              </span>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex items-baseline gap-4">
                <span className="text-white font-mono text-[130px] font-bold leading-none" style={{ textShadow: '0 2px 16px rgba(0,0,0,0.8)' }}>{goals.home ?? '-'}</span>
                <span className="text-white/70 font-mono text-[90px] font-light leading-none">–</span>
                <span className="text-white font-mono text-[130px] font-bold leading-none" style={{ textShadow: '0 2px 16px rgba(0,0,0,0.8)' }}>{goals.away ?? '-'}</span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-5 flex-1">
              <img src={teams.away.logo} alt={teams.away.name} className="h-36 w-36 object-contain drop-shadow-lg" />
              <span className="text-white text-3xl font-headline font-semibold text-center leading-tight" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}>
                {teams.away.name}
              </span>
            </div>
          </div>

          {fixture.fixture.venue && (
            <p className="text-white/80 text-2xl font-body mt-14" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.7)' }}>
              {fixture.fixture.venue.name}, {fixture.fixture.venue.city}
            </p>
          )}
        </div>

        <div className="absolute bottom-8 right-10 flex items-center gap-2 z-10">
          <img src="/images/az-fanpage-logo.png" alt="AZ Fanpage" className="h-24 w-auto" style={{ mixBlendMode: 'screen' }} />
        </div>
      </div>
    );
  }
);

ResultTemplate.displayName = 'ResultTemplate';
