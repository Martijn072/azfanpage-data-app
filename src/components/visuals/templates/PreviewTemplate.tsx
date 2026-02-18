import { forwardRef } from 'react';
import { Fixture } from '@/types/footballApi';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

interface PreviewTemplateProps {
  fixture: Fixture | null;
  backgroundImage?: string | null;
}

export const PreviewTemplate = forwardRef<HTMLDivElement, PreviewTemplateProps>(
  ({ fixture, backgroundImage }, ref) => {
    if (!fixture) {
      return (
        <div ref={ref} style={{ width: 1080, height: 1080 }} className="bg-[#0F1117] flex items-center justify-center">
          <p className="text-[#9CA3AF] text-xl">Geen aankomende wedstrijd</p>
        </div>
      );
    }

    const { teams, league } = fixture;
    const matchDate = format(new Date(fixture.fixture.date), "EEEE d MMMM", { locale: nl });
    const matchTime = format(new Date(fixture.fixture.date), "HH:mm");

    return (
      <div ref={ref} style={{ width: 1080, height: 1080 }} className="relative overflow-hidden flex flex-col">
        {backgroundImage ? (
          <>
            <img src={backgroundImage} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            <div className="absolute inset-0 bg-black/65" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-[#0F1117]" />
            <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 30%, rgba(219,0,33,0.06) 0%, transparent 60%)' }} />
          </>
        )}
        <div className="absolute top-0 left-0 right-0 h-[6px]" style={{ background: 'linear-gradient(90deg, #DB0021 0%, #DB0021 60%, transparent 100%)' }} />

        <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-16">
          <span className="text-[#DB0021] text-2xl font-body font-semibold uppercase tracking-[0.25em] mb-2">
            Voorbeschouwing
          </span>

          <div className="flex items-center gap-4 mb-20">
            <img src={league.logo} alt={league.name} className="h-9 w-9 object-contain" />
            <span className="text-white/90 text-xl font-body">{league.name} · {league.round}</span>
          </div>

          <div className="flex items-center justify-center gap-16 w-full">
            <div className="flex flex-col items-center gap-5 flex-1">
              <img src={teams.home.logo} alt={teams.home.name} className="h-40 w-40 object-contain drop-shadow-lg" />
              <span className="text-white text-3xl font-headline font-semibold text-center">{teams.home.name}</span>
            </div>

            <span className="text-white/60 font-mono text-7xl font-light">VS</span>

            <div className="flex flex-col items-center gap-5 flex-1">
              <img src={teams.away.logo} alt={teams.away.name} className="h-40 w-40 object-contain drop-shadow-lg" />
              <span className="text-white text-3xl font-headline font-semibold text-center">{teams.away.name}</span>
            </div>
          </div>

          <div className="mt-20 flex flex-col items-center gap-2">
            <span className="text-white text-4xl font-headline font-bold">{matchTime}</span>
            <span className="text-white/80 text-xl font-body capitalize">{matchDate}</span>
            {fixture.fixture.venue && (
              <span className="text-white/70 text-xl font-body mt-1">
                {fixture.fixture.venue.name}
              </span>
            )}
          </div>
        </div>

        <div className="absolute bottom-8 right-10 z-10">
          <img src="/lovable-uploads/02689d46-9781-412f-9093-feef3e99cfe2.png" alt="AZ Fanpage" className="h-12 w-auto opacity-80" />
        </div>
      </div>
    );
  }
);

PreviewTemplate.displayName = 'PreviewTemplate';
