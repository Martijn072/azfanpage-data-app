import { useRef, useMemo } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVisualDownload } from '@/hooks/useVisualDownload';
import { TemplateType } from './TemplateSelector';
import { ResultTemplate } from './templates/ResultTemplate';
import { PreviewTemplate } from './templates/PreviewTemplate';
import { StandingsTemplate } from './templates/StandingsTemplate';
import { MatchdayTemplate } from './templates/MatchdayTemplate';
import { PlayerHighlightTemplate } from './templates/PlayerHighlightTemplate';
import { useAZTeamId, useAZFixtures, useNextAZFixture, useEredivisieStandings } from '@/hooks/useFootballApi';
import { format } from 'date-fns';

interface VisualPreviewProps {
  template: TemplateType;
  backgroundImage: string | null;
  playerName?: string;
  tagline?: string;
}

const TEMPLATE_SIZES: Record<TemplateType, { w: number; h: number }> = {
  result: { w: 1080, h: 1080 },
  preview: { w: 1080, h: 1080 },
  standings: { w: 1080, h: 1080 },
  matchday: { w: 1080, h: 1080 },
  player: { w: 1080, h: 1080 },
};

export const VisualPreview = ({ template, backgroundImage, playerName = '', tagline = '' }: VisualPreviewProps) => {
  const templateRef = useRef<HTMLDivElement>(null);
  const { downloadPng } = useVisualDownload();

  const { data: teamId } = useAZTeamId();
  const { data: fixtures, isLoading: fixturesLoading } = useAZFixtures(teamId ?? null, 1);
  const { data: nextFixture, isLoading: nextLoading } = useNextAZFixture(teamId ?? null);
  const { data: standings, isLoading: standingsLoading } = useEredivisieStandings();

  const lastFixture = fixtures?.[0] ?? null;
  const size = TEMPLATE_SIZES[template];

  const isLoading = fixturesLoading || nextLoading || standingsLoading;

  const scale = useMemo(() => {
    return Math.min(540 / size.w, 540 / size.h);
  }, [size]);

  const handleDownload = () => {
    const labels: Record<TemplateType, string> = {
      result: 'uitslag',
      preview: 'voorbeschouwing',
      standings: 'stand',
      matchday: 'speelronde',
      player: 'speler',
    };
    downloadPng(templateRef, `az-${labels[template]}-${format(new Date(), 'yyyyMMdd')}.png`);
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        className="rounded-xl border border-border overflow-hidden bg-secondary/30 mx-auto"
        style={{ width: size.w * scale, height: size.h * scale }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              width: size.w,
              height: size.h,
            }}
          >
            {template === 'result' && <ResultTemplate ref={templateRef} fixture={lastFixture} backgroundImage={backgroundImage} />}
            {template === 'preview' && <PreviewTemplate ref={templateRef} fixture={nextFixture} backgroundImage={backgroundImage} />}
            {template === 'standings' && <StandingsTemplate ref={templateRef} standings={standings ?? null} backgroundImage={backgroundImage} />}
            {template === 'matchday' && <MatchdayTemplate ref={templateRef} lastFixture={lastFixture} nextFixture={nextFixture} backgroundImage={backgroundImage} />}
            {template === 'player' && <PlayerHighlightTemplate ref={templateRef} playerName={playerName} tagline={tagline} backgroundImage={backgroundImage} />}
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <Button onClick={handleDownload} disabled={isLoading} className="gap-2">
          <Download className="h-4 w-4" />
          Download PNG
        </Button>
      </div>
    </div>
  );
};
