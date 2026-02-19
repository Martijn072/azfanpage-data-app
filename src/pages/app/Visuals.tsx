import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { TemplateSelector, TemplateType, VisualFormat, STORY_TEMPLATES } from '@/components/visuals/TemplateSelector';
import { VisualPreview } from '@/components/visuals/VisualPreview';
import { BackgroundUploader } from '@/components/visuals/BackgroundUploader';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Square, RectangleVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

const Visuals = () => {
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const prev = theme;
    setTheme('dark');
    return () => { if (prev && prev !== 'dark') setTheme(prev); };
  }, []);
  const [selected, setSelected] = useState<TemplateType>('result');
  const [format, setFormat] = useState<VisualFormat>('square');
  const [playerName, setPlayerName] = useState('');
  const [tagline, setTagline] = useState('');
  const [headline, setHeadline] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [statValue, setStatValue] = useState('');
  const [statLabel, setStatLabel] = useState('');
  const [question, setQuestion] = useState('');
  const [backgrounds, setBackgrounds] = useState<Record<TemplateType, string | null>>({
    result: null,
    preview: null,
    standings: null,
    matchday: null,
    player: null,
    quote: null,
    breaking: null,
    stat: null,
    gameday: null,
    poll: null,
  });

  const handleUpload = (url: string) => {
    setBackgrounds((prev) => ({ ...prev, [selected]: url }));
  };

  const handleRemove = () => {
    setBackgrounds((prev) => ({ ...prev, [selected]: null }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-app-title font-headline text-foreground">Visuals</h1>
        <p className="text-app-body text-muted-foreground mt-1">
          Genereer social media-afbeeldingen met live wedstrijddata
        </p>
      </div>

      <TemplateSelector selected={selected} onSelect={(t) => { setSelected(t); if (!STORY_TEMPLATES.includes(t)) setFormat('square'); }} />

      {STORY_TEMPLATES.includes(selected) && (
        <div className="flex items-center gap-2">
          <span className="text-app-body text-muted-foreground text-sm">Formaat:</span>
          <button
            onClick={() => setFormat('square')}
            className={cn(
              "p-2 rounded-md border transition-all",
              format === 'square' ? "bg-primary/10 text-primary border-primary/30" : "bg-card text-muted-foreground border-border hover:border-primary/20"
            )}
            title="Vierkant (1080×1080)"
          >
            <Square className="h-4 w-4" />
          </button>
          <button
            onClick={() => setFormat('story')}
            className={cn(
              "p-2 rounded-md border transition-all",
              format === 'story' ? "bg-primary/10 text-primary border-primary/30" : "bg-card text-muted-foreground border-border hover:border-primary/20"
            )}
            title="Story (1080×1920)"
          >
            <RectangleVertical className="h-4 w-4" />
          </button>
          <span className="text-app-tiny text-muted-foreground/60 ml-1">
            {format === 'square' ? '1080×1080' : '1080×1920'}
          </span>
        </div>
      )}

      <BackgroundUploader
        backgroundImage={backgrounds[selected]}
        onUpload={handleUpload}
        onRemove={handleRemove}
      />

      {(selected === 'player' || selected === 'quote') && (
        <div className="flex gap-4">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="playerName">Spelernaam</Label>
            <Input id="playerName" placeholder="bijv. Vangelis Pavlidis" value={playerName} onChange={(e) => setPlayerName(e.target.value)} />
          </div>
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="tagline">{selected === 'quote' ? 'Citaat' : 'Tagline'}</Label>
            <Input id="tagline" placeholder={selected === 'quote' ? 'bijv. Dit was onze beste wedstrijd' : 'bijv. Hat-trick hero'} value={tagline} onChange={(e) => setTagline(e.target.value)} />
          </div>
        </div>
      )}

      {selected === 'breaking' && (
        <div className="flex gap-4">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="headline">Headline</Label>
            <Input id="headline" placeholder="bijv. Pavlidis tekent bij tot 2028" value={headline} onChange={(e) => setHeadline(e.target.value)} />
          </div>
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="subtitle">Subtitel</Label>
            <Input id="subtitle" placeholder="bijv. Transfernieuws" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
          </div>
        </div>
      )}

      {selected === 'stat' && (
        <div className="flex gap-4">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="statValue">Getal / waarde</Label>
            <Input id="statValue" placeholder="bijv. 100" value={statValue} onChange={(e) => setStatValue(e.target.value)} />
          </div>
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="statLabel">Beschrijving</Label>
            <Input id="statLabel" placeholder="bijv. Goals voor AZ" value={statLabel} onChange={(e) => setStatLabel(e.target.value)} />
          </div>
        </div>
      )}

      {selected === 'poll' && (
        <div className="space-y-1.5">
          <Label htmlFor="question">Vraag / stelling</Label>
          <Input id="question" placeholder="bijv. Wordt AZ kampioen dit seizoen?" value={question} onChange={(e) => setQuestion(e.target.value)} />
        </div>
      )}

      <VisualPreview
        template={selected}
        format={format}
        backgroundImage={backgrounds[selected]}
        playerName={playerName}
        tagline={tagline}
        headline={headline}
        subtitle={subtitle}
        statValue={statValue}
        statLabel={statLabel}
        question={question}
      />
    </div>
  );
};

export default Visuals;
