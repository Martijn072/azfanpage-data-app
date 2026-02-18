import { forwardRef } from 'react';
import { Fixture } from '@/types/footballApi';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

interface ResultTemplateProps {
  fixture: Fixture | null;
}

export const ResultTemplate = forwardRef<HTMLDivElement, ResultTemplateProps>(
  ({ fixture }, ref) => {
    if (!fixture) {
      return (
        <div ref={ref} style={{ width: 1080, height: 1080 }} className="bg-[#0F1117] flex items-center justify-center">
          <p className="text-muted-foreground text-xl">Geen wedstrijddata beschikbaar</p>
        </div>
      );
    }

    const { teams, goals, league } = fixture;
    const matchDate = format(new Date(fixture.fixture.date), "d MMMM yyyy", { locale: nl });
    const isAZHome = teams.home.name.toLowerCase().includes('az');
    const azWon = isAZHome ? (goals.home ?? 0) > (goals.away ?? 0) : (goals.away ?? 0) > (goals.home ?? 0);
    const isDraw = goals.home === goals.away;

    return (
      <div
        ref={ref}
        style={{ width: 1080, height: 1080 }}
        className="relative overflow-hidden flex flex-col items-center justify-center"
      >
        <div className="absolute inset-0 bg-[#0F1117]" />
        <div
          className="absolute top-0 left-0 right-0 h-[6px]"
          style={{ background: 'linear-gradient(90deg, #DB0021 0%, #DB0021 60%, transparent 100%)' }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(circle at 50% 40%, rgba(219,0,33,0.08) 0%, transparent 60%)' }}
        />

        <div className="relative z-10 flex flex-col items-center w-full px-16">
          <div className="flex items-center gap-3 mb-4">
            <img src={league.logo} alt={league.name} className="h-8 w-8 object-contain" />
            <span className="text-[#9CA3AF] text-lg font-body tracking-wide uppercase">
              {league.name} · {league.round}
            </span>
          </div>

          <p className="text-[#6B7280] text-base font-body mb-16">{matchDate}</p>

          <div className="flex items-center justify-center gap-12 w-full">
            <div className="flex flex-col items-center gap-5 flex-1">
              <img src={teams.home.logo} alt={teams.home.name} className="h-32 w-32 object-contain drop-shadow-lg" />
              <span className="text-white text-2xl font-headline font-semibold text-center leading-tight">
                {teams.home.name}
              </span>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex items-baseline gap-4">
                <span className="text-white font-mono text-[120px] font-bold leading-none">{goals.home ?? '-'}</span>
                <span className="text-[#4B5563] font-mono text-[80px] font-light leading-none">–</span>
                <span className="text-white font-mono text-[120px] font-bold leading-none">{goals.away ?? '-'}</span>
              </div>
              <div
                className="mt-6 px-6 py-2 rounded-full text-sm font-body font-semibold uppercase tracking-widest"
                style={{
                  backgroundColor: isDraw ? '#F59E0B22' : azWon ? '#22C55E22' : '#EF444422',
                  color: isDraw ? '#F59E0B' : azWon ? '#22C55E' : '#EF4444',
                }}
              >
                {isDraw ? 'Gelijkspel' : azWon ? 'Overwinning' : 'Nederlaag'}
              </div>
            </div>

            <div className="flex flex-col items-center gap-5 flex-1">
              <img src={teams.away.logo} alt={teams.away.name} className="h-32 w-32 object-contain drop-shadow-lg" />
              <span className="text-white text-2xl font-headline font-semibold text-center leading-tight">
                {teams.away.name}
              </span>
            </div>
          </div>

          {fixture.fixture.venue && (
            <p className="text-[#6B7280] text-base font-body mt-16">
              📍 {fixture.fixture.venue.name}, {fixture.fixture.venue.city}
            </p>
          )}
        </div>

        <div className="absolute bottom-8 right-10 flex items-center gap-2 z-10">
          <img src="/lovable-uploads/02689d46-9781-412f-9093-feef3e99cfe2.png" alt="AZ Fanpage" className="h-7 w-auto opacity-60" />
        </div>
      </div>
    );
  }
);

ResultTemplate.displayName = 'ResultTemplate';
