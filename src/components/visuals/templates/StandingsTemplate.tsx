import { forwardRef, useMemo } from 'react';
import { Standing } from '@/types/footballApi';

interface StandingsTemplateProps {
  standings: Standing[] | null;
  backgroundImage?: string | null;
}

const FormDots = ({ form }: { form: string }) => {
  const dots = form.split('').slice(-5);
  return (
    <div className="flex gap-3">
      {dots.map((char, i) => {
        const color = char === 'W' ? '#22C55E' : char === 'D' ? '#6B7280' : '#EF4444';
        const label = char === 'W' ? 'W' : char === 'D' ? 'G' : 'V';
        return (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <div
              className="rounded-full"
              style={{ width: 28, height: 28, backgroundColor: color }}
            />
            <span className="text-white/50 text-xs font-body font-semibold">{label}</span>
          </div>
        );
      })}
    </div>
  );
};

const ContextRow = ({ team }: { team: Standing }) => (
  <div className="flex items-center px-6 py-4 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
    <span className="w-12 text-center font-mono text-lg font-bold text-[#6B7280]">{team.rank}</span>
    <div className="flex items-center gap-3 flex-1 ml-3">
      <img src={team.team.logo} alt={team.team.name} className="h-8 w-8 object-contain" />
      <span className="text-[#D1D5DB] text-lg font-headline font-medium">{team.team.name}</span>
    </div>
    <span className="text-[#9CA3AF] font-mono text-base w-16 text-center">{team.all.played}W</span>
    <span className="font-mono text-xl font-bold text-[#E5E7EB] w-16 text-center">{team.points}</span>
  </div>
);

export const StandingsTemplate = forwardRef<HTMLDivElement, StandingsTemplateProps>(
  ({ standings, backgroundImage }, ref) => {
    const { az, above, below } = useMemo(() => {
      if (!standings?.length) return { az: null, above: [], below: [] };
      const azIndex = standings.findIndex(t => t.team.name.toLowerCase().includes('az'));
      if (azIndex === -1) return { az: null, above: [], below: [] };
      const az = standings[azIndex];
      const above = standings.slice(Math.max(0, azIndex - 2), azIndex);
      const below = standings.slice(azIndex + 1, azIndex + 3);
      return { az, above, below };
    }, [standings]);

    if (!az) {
      return (
        <div ref={ref} style={{ width: 1080, height: 1080 }} className="bg-[#0F1117] flex items-center justify-center">
          <p className="text-[#9CA3AF] text-xl">Geen standgegevens beschikbaar</p>
        </div>
      );
    }

    return (
      <div ref={ref} style={{ width: 1080, height: 1080 }} className="relative overflow-hidden flex flex-col">
        {backgroundImage ? (
          <>
            <img src={backgroundImage} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            <div className="absolute inset-0 bg-black/75" />
          </>
        ) : (
          <div className="absolute inset-0 bg-[#0F1117]" />
        )}
        <div className="absolute top-0 left-0 right-0 h-[6px]" style={{ background: 'linear-gradient(90deg, #DB0021 0%, #DB0021 60%, transparent 100%)' }} />

        <div className="relative z-10 flex flex-col px-14 py-14 flex-1">
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <span className="text-[#DB0021] text-xl font-body font-semibold uppercase tracking-[0.25em]" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.7)' }}>
                Eredivisie
              </span>
              <h2 className="text-white text-4xl font-headline font-bold mt-1" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}>Stand</h2>
            </div>
            <img src="/images/az-fanpage-logo.png" alt="AZ Fanpage" style={{ height: 96, width: 96, objectFit: 'contain' }} />
          </div>

          {/* AZ Central Block */}
          <div
            className="rounded-2xl px-10 py-8 mb-8 flex flex-col items-center"
            style={{
              border: '2px solid rgba(219,0,33,0.35)',
            }}
          >
            <div className="flex items-center gap-12">
              <div className="flex flex-col items-center">
                <span className="text-white/50 text-sm font-body uppercase tracking-wider">Punten</span>
                <span className="text-white font-mono font-black" style={{ fontSize: 52, lineHeight: 1.1 }}>{az.points}</span>
              </div>
              <div className="w-px h-14 bg-white/10" />
              <div className="flex flex-col items-center">
                <span className="text-white/50 text-sm font-body uppercase tracking-wider">Gespeeld</span>
                <span className="text-white font-mono font-black" style={{ fontSize: 52, lineHeight: 1.1 }}>{az.all.played}</span>
              </div>
              <div className="w-px h-14 bg-white/10" />
              <div className="flex flex-col items-center">
                <span className="text-white/50 text-sm font-body uppercase tracking-wider">Doelsaldo</span>
                <span className={`font-mono font-black ${az.goalsDiff > 0 ? 'text-[#22C55E]' : az.goalsDiff < 0 ? 'text-[#EF4444]' : 'text-[#9CA3AF]'}`} style={{ fontSize: 52, lineHeight: 1.1 }}>
                  {az.goalsDiff > 0 ? '+' : ''}{az.goalsDiff}
                </span>
              </div>
            </div>

            {az.form && (
              <div className="flex flex-col items-center gap-2">
                <span className="text-white/40 text-xs font-body uppercase tracking-widest">Laatste 5</span>
                <FormDots form={az.form} />
              </div>
            )}
          </div>

          {/* Context teams */}
          <div className="flex flex-col gap-2">
            {above.map(t => <ContextRow key={t.rank} team={t} />)}
            {/* AZ row in context */}
            <div
              className="flex items-center px-6 py-4 rounded-xl"
              style={{
                backgroundColor: 'rgba(219,0,33,0.12)',
                borderLeft: '4px solid #DB0021',
              }}
            >
              <span className="w-12 text-center font-mono text-lg font-bold text-[#DB0021]">{az.rank}</span>
              <div className="flex items-center gap-3 flex-1 ml-3">
                <img src={az.team.logo} alt={az.team.name} className="h-8 w-8 object-contain" />
                <span className="text-white text-lg font-headline font-bold">{az.team.name}</span>
              </div>
              <span className="text-white/60 font-mono text-base w-16 text-center">{az.all.played}W</span>
              <span className="font-mono text-xl font-bold text-white w-16 text-center">{az.points}</span>
            </div>
            {below.map(t => <ContextRow key={t.rank} team={t} />)}
          </div>
        </div>
      </div>
    );
  }
);

StandingsTemplate.displayName = 'StandingsTemplate';
