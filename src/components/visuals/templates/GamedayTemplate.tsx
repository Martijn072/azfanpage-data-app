import { forwardRef } from 'react';
import { Fixture } from '@/types/footballApi';
import { format as formatDate } from 'date-fns';
import { nl } from 'date-fns/locale';

interface GamedayTemplateProps {
  fixture: Fixture | null;
  backgroundImage?: string | null;
  format?: 'square' | 'story';
}

export const GamedayTemplate = forwardRef<HTMLDivElement, GamedayTemplateProps>(
  ({ fixture, backgroundImage, format = 'square' }, ref) => {
    const isStory = format === 'story';
    const height = isStory ? 1920 : 1080;

    if (!fixture) {
      return (
        <div ref={ref} style={{ width: 1080, height }} className="bg-[#0F1117] flex items-center justify-center">
          <p className="text-[#9CA3AF] text-xl">Geen wedstrijddata beschikbaar</p>
        </div>
      );
    }

    return (
      <div ref={ref} style={{ width: 1080, height }} className="relative overflow-hidden">
        {backgroundImage ? (
          <img src={backgroundImage} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div className="absolute inset-0 bg-[#0F1117]" />
        )}

        {/* Base overlay */}
        <div className="absolute inset-0 bg-black/50" />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.4) 100%)' }}
        />

        {/* Red top bar */}
        <div className="absolute top-0 left-0 right-0 h-[6px] z-10" style={{ background: 'linear-gradient(90deg, #DB0021 0%, #DB0021 60%, transparent 100%)' }} />

        {/* Content */}
        <div className={`absolute inset-0 z-10 flex flex-col items-center justify-center px-16 ${isStory ? 'gap-16' : 'gap-10'}`}>
          {/* MATCHDAY header */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-[4px]" style={{ background: '#DB0021' }} />
            <span
              className="text-white font-headline font-black uppercase tracking-[0.3em]"
              style={{ fontSize: 56, textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}
            >
              Matchday
            </span>
          </div>

          {/* Teams & time */}
          <div className="flex items-center justify-center gap-12 w-full">
            <div className="flex flex-col items-center gap-4">
              <img src={fixture.teams.home.logo} alt={fixture.teams.home.name} className="h-32 w-32 object-contain drop-shadow-lg" />
              <span className="text-white text-2xl font-headline font-semibold text-center" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}>{fixture.teams.home.name}</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <span className="text-white font-headline font-bold" style={{ fontSize: 72, textShadow: '0 2px 16px rgba(0,0,0,0.8)' }}>
                {formatDate(new Date(fixture.fixture.date), 'HH:mm')}
              </span>
              <span className="text-white/90 text-2xl font-body capitalize" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.7)' }}>
                {formatDate(new Date(fixture.fixture.date), 'EEEE d MMMM', { locale: nl })}
              </span>
            </div>

            <div className="flex flex-col items-center gap-4">
              <img src={fixture.teams.away.logo} alt={fixture.teams.away.name} className="h-32 w-32 object-contain drop-shadow-lg" />
              <span className="text-white text-2xl font-headline font-semibold text-center" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}>{fixture.teams.away.name}</span>
            </div>
          </div>

          {/* Venue & league */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-white/80 text-xl font-body" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.7)' }}>
              {fixture.fixture.venue?.name}
            </span>
            <span className="text-white/60 text-lg font-body" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.7)' }}>
              {fixture.league.name} · {fixture.league.round}
            </span>
          </div>
        </div>

        {/* Logo */}
        <div className="absolute top-14 right-10 z-10">
          <img src="/images/az-fanpage-logo.png" alt="AZ Fanpage" style={{ height: 96, width: 96, objectFit: 'contain' }} />
        </div>
      </div>
    );
  }
);

GamedayTemplate.displayName = 'GamedayTemplate';
