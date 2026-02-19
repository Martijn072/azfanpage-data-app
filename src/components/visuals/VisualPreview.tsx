import { useRef, useMemo } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVisualDownload } from '@/hooks/useVisualDownload';
import { TemplateType, VisualFormat } from './TemplateSelector';
import { ResultTemplate } from './templates/ResultTemplate';
import { PreviewTemplate } from './templates/PreviewTemplate';
import { StandingsTemplate } from './templates/StandingsTemplate';
import { MatchdayTemplate } from './templates/MatchdayTemplate';
import { PlayerHighlightTemplate } from './templates/PlayerHighlightTemplate';
import { QuoteTemplate } from './templates/QuoteTemplate';
import { BreakingTemplate } from './templates/BreakingTemplate';
import { StatTemplate } from './templates/StatTemplate';
import { GamedayTemplate } from './templates/GamedayTemplate';
import { PollTemplate } from './templates/PollTemplate';
import { useAZTeamId, useAZFixtures, useNextAZFixture, useEredivisieStandings } from '@/hooks/useFootballApi';
import { format } from 'date-fns';

interface VisualPreviewProps {
  template: TemplateType;
  format: VisualFormat;
  backgroundImage: string | null;
  playerName?: string;
  tagline?: string;
  headline?: string;
  subtitle?: string;
  statValue?: string;
  statLabel?: string;
  question?: string;
}

const getTemplateSize = (template: TemplateType, format: VisualFormat) => {
  const storyTemplates = ['player', 'quote', 'breaking', 'gameday'];
  const h = storyTemplates.includes(template) && format === 'story' ? 1920 : 1080;
  return { w: 1080, h };
};

export const VisualPreview = ({ template, format: visualFormat, backgroundImage, playerName = '', tagline = '', headline = '', subtitle = '', statValue = '', statLabel = '', question = '' }: VisualPreviewProps) => {
  const templateRef = useRef<HTMLDivElement>(null);
  const { downloadPng } = useVisualDownload();

  const { data: teamId } = useAZTeamId();
  const { data: fixtures, isLoading: fixturesLoading } = useAZFixtures(teamId ?? null, 1);
  const { data: nextFixture, isLoading: nextLoading } = useNextAZFixture(teamId ?? null);
  const { data: standings, isLoading: standingsLoading } = useEredivisieStandings();

  const lastFixture = fixtures?.[0] ?? null;
  const size = getTemplateSize(template, visualFormat);

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
      quote: 'citaat',
      breaking: 'breaking',
      stat: 'statistiek',
      gameday: 'matchday',
      poll: 'poll',
    };
    const suffix = visualFormat === 'story' ? '-story' : '';
    downloadPng(templateRef, `az-${labels[template]}${suffix}-${format(new Date(), 'yyyyMMdd')}.png`);
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
            {template === 'player' && <PlayerHighlightTemplate ref={templateRef} playerName={playerName} tagline={tagline} backgroundImage={backgroundImage} format={visualFormat} />}
            {template === 'quote' && <QuoteTemplate ref={templateRef} playerName={playerName} tagline={tagline} backgroundImage={backgroundImage} format={visualFormat} />}
            {template === 'breaking' && <BreakingTemplate ref={templateRef} headline={headline} subtitle={subtitle} backgroundImage={backgroundImage} format={visualFormat} />}
            {template === 'stat' && <StatTemplate ref={templateRef} statValue={statValue} statLabel={statLabel} backgroundImage={backgroundImage} />}
            {template === 'gameday' && <GamedayTemplate ref={templateRef} fixture={nextFixture} backgroundImage={backgroundImage} format={visualFormat} />}
            {template === 'poll' && <PollTemplate ref={templateRef} question={question} backgroundImage={backgroundImage} />}
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
