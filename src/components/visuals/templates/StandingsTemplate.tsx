import { forwardRef } from 'react';
import { Standing } from '@/types/footballApi';

interface StandingsTemplateProps {
  standings: Standing[] | null;
}

export const StandingsTemplate = forwardRef<HTMLDivElement, StandingsTemplateProps>(
  ({ standings }, ref) => {
    const top10 = standings?.slice(0, 10) || [];

    if (top10.length === 0) {
      return (
        <div ref={ref} style={{ width: 1080, height: 1350 }} className="bg-[#0F1117] flex items-center justify-center">
          <p className="text-[#9CA3AF] text-xl">Geen standgegevens beschikbaar</p>
        </div>
      );
    }

    return (
      <div ref={ref} style={{ width: 1080, height: 1350 }} className="relative overflow-hidden flex flex-col">
        <div className="absolute inset-0 bg-[#0F1117]" />
        <div className="absolute top-0 left-0 right-0 h-[6px]" style={{ background: 'linear-gradient(90deg, #DB0021 0%, #DB0021 60%, transparent 100%)' }} />

        <div className="relative z-10 flex flex-col px-14 py-14 flex-1">
          <div className="flex items-center justify-between mb-10">
            <div>
              <span className="text-[#DB0021] text-lg font-body font-semibold uppercase tracking-[0.25em]">
                Eredivisie
              </span>
              <h2 className="text-white text-4xl font-headline font-bold mt-1">Stand</h2>
            </div>
            <img src="/lovable-uploads/02689d46-9781-412f-9093-feef3e99cfe2.png" alt="AZ Fanpage" className="h-8 w-auto opacity-60" />
          </div>

          <div className="flex items-center px-5 py-3 text-[#6B7280] text-sm font-body font-semibold uppercase tracking-wider">
            <span className="w-12 text-center">#</span>
            <span className="flex-1 ml-4">Club</span>
            <span className="w-14 text-center">W</span>
            <span className="w-14 text-center">G</span>
            <span className="w-14 text-center">V</span>
            <span className="w-16 text-center">+/-</span>
            <span className="w-16 text-center font-bold">Ptn</span>
          </div>

          <div className="flex flex-col gap-1.5">
            {top10.map((team) => {
              const isAZ = team.team.name.toLowerCase().includes('az');
              return (
                <div
                  key={team.rank}
                  className="flex items-center px-5 py-4 rounded-xl"
                  style={{
                    backgroundColor: isAZ ? 'rgba(219,0,33,0.12)' : 'rgba(255,255,255,0.03)',
                    borderLeft: isAZ ? '4px solid #DB0021' : '4px solid transparent',
                  }}
                >
                  <span className={`w-12 text-center font-mono text-lg font-bold ${isAZ ? 'text-[#DB0021]' : 'text-[#9CA3AF]'}`}>
                    {team.rank}
                  </span>
                  <div className="flex items-center gap-3 flex-1 ml-4">
                    <img src={team.team.logo} alt={team.team.name} className="h-8 w-8 object-contain" />
                    <span className={`text-lg font-headline font-semibold ${isAZ ? 'text-white' : 'text-[#E5E7EB]'}`}>
                      {team.team.name}
                    </span>
                  </div>
                  <span className="w-14 text-center text-[#E5E7EB] font-mono text-base">{team.all.win}</span>
                  <span className="w-14 text-center text-[#E5E7EB] font-mono text-base">{team.all.draw}</span>
                  <span className="w-14 text-center text-[#E5E7EB] font-mono text-base">{team.all.lose}</span>
                  <span className={`w-16 text-center font-mono text-base ${team.goalsDiff > 0 ? 'text-[#22C55E]' : team.goalsDiff < 0 ? 'text-[#EF4444]' : 'text-[#9CA3AF]'}`}>
                    {team.goalsDiff > 0 ? '+' : ''}{team.goalsDiff}
                  </span>
                  <span className={`w-16 text-center font-mono text-xl font-bold ${isAZ ? 'text-white' : 'text-[#E5E7EB]'}`}>
                    {team.points}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
);

StandingsTemplate.displayName = 'StandingsTemplate';
