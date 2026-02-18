import { forwardRef } from 'react';
import { Fixture } from '@/types/footballApi';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

interface MatchdayTemplateProps {
  lastFixture: Fixture | null;
  nextFixture: Fixture | null;
  backgroundImage?: string | null;
}

export const MatchdayTemplate = forwardRef<HTMLDivElement, MatchdayTemplateProps>(
  ({ lastFixture, nextFixture, backgroundImage }, ref) => {
    if (!lastFixture && !nextFixture) {
      return (
        <div ref={ref} style={{ width: 1080, height: 1080 }} className="bg-[#0F1117] flex items-center justify-center">
          <p className="text-[#9CA3AF] text-xl">Geen wedstrijddata beschikbaar</p>
        </div>
      );
    }

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
            <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(219,0,33,0.05) 0%, transparent 50%)' }} />
          </>
        )}
        <div className="absolute top-0 left-0 right-0 h-[6px]" style={{ background: 'linear-gradient(90deg, #DB0021 0%, #DB0021 60%, transparent 100%)' }} />

        <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-16 gap-12">
          <span className="text-[#DB0021] text-lg font-body font-semibold uppercase tracking-[0.25em]">
            Speelronde
          </span>

          {lastFixture && (
            <div className="flex flex-col items-center gap-6 w-full">
              <span className="text-[#6B7280] text-sm font-body uppercase tracking-wider">Laatste uitslag</span>
              <div className="flex items-center justify-center gap-8 w-full">
                <div className="flex flex-col items-center gap-3">
                  <img src={lastFixture.teams.home.logo} alt={lastFixture.teams.home.name} className="h-20 w-20 object-contain" />
                  <span className="text-[#E5E7EB] text-base font-headline font-semibold">{lastFixture.teams.home.name}</span>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-white font-mono text-7xl font-bold">{lastFixture.goals.home ?? '-'}</span>
                  <span className="text-[#4B5563] font-mono text-4xl">–</span>
                  <span className="text-white font-mono text-7xl font-bold">{lastFixture.goals.away ?? '-'}</span>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <img src={lastFixture.teams.away.logo} alt={lastFixture.teams.away.name} className="h-20 w-20 object-contain" />
                  <span className="text-[#E5E7EB] text-base font-headline font-semibold">{lastFixture.teams.away.name}</span>
                </div>
              </div>
              <span className="text-[#6B7280] text-sm font-body">
                {lastFixture.league.name} · {lastFixture.league.round}
              </span>
            </div>
          )}

          <div className="w-48 h-px bg-[#374151]" />

          {nextFixture && (
            <div className="flex flex-col items-center gap-6 w-full">
              <span className="text-[#6B7280] text-sm font-body uppercase tracking-wider">Volgende wedstrijd</span>
              <div className="flex items-center justify-center gap-10 w-full">
                <div className="flex flex-col items-center gap-3">
                  <img src={nextFixture.teams.home.logo} alt={nextFixture.teams.home.name} className="h-20 w-20 object-contain" />
                  <span className="text-[#E5E7EB] text-base font-headline font-semibold">{nextFixture.teams.home.name}</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-white text-3xl font-headline font-bold">
                    {format(new Date(nextFixture.fixture.date), "HH:mm")}
                  </span>
                  <span className="text-[#9CA3AF] text-base font-body capitalize">
                    {format(new Date(nextFixture.fixture.date), "EEE d MMM", { locale: nl })}
                  </span>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <img src={nextFixture.teams.away.logo} alt={nextFixture.teams.away.name} className="h-20 w-20 object-contain" />
                  <span className="text-[#E5E7EB] text-base font-headline font-semibold">{nextFixture.teams.away.name}</span>
                </div>
              </div>
              <span className="text-[#6B7280] text-sm font-body">
                {nextFixture.league.name} · {nextFixture.league.round}
              </span>
            </div>
          )}
        </div>

        <div className="absolute bottom-8 right-10 z-10">
          <img src="/lovable-uploads/02689d46-9781-412f-9093-feef3e99cfe2.png" alt="AZ Fanpage" className="h-7 w-auto opacity-60" />
        </div>
      </div>
    );
  }
);

MatchdayTemplate.displayName = 'MatchdayTemplate';
