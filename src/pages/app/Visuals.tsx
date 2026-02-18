import { useState } from 'react';
import { TemplateSelector, TemplateType } from '@/components/visuals/TemplateSelector';
import { VisualPreview } from '@/components/visuals/VisualPreview';
import { BackgroundUploader } from '@/components/visuals/BackgroundUploader';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Visuals = () => {
  const [selected, setSelected] = useState<TemplateType>('result');
  const [playerName, setPlayerName] = useState('');
  const [tagline, setTagline] = useState('');
  const [backgrounds, setBackgrounds] = useState<Record<TemplateType, string | null>>({
    result: null,
    preview: null,
    standings: null,
    matchday: null,
    player: null,
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

      <TemplateSelector selected={selected} onSelect={setSelected} />

      <BackgroundUploader
        backgroundImage={backgrounds[selected]}
        onUpload={handleUpload}
        onRemove={handleRemove}
      />

      {selected === 'player' && (
        <div className="flex gap-4">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="playerName">Spelernaam</Label>
            <Input
              id="playerName"
              placeholder="bijv. Vangelis Pavlidis"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
            />
          </div>
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="tagline">Tagline</Label>
            <Input
              id="tagline"
              placeholder="bijv. Hat-trick hero"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
            />
          </div>
        </div>
      )}

      <VisualPreview
        template={selected}
        backgroundImage={backgrounds[selected]}
        playerName={playerName}
        tagline={tagline}
      />
    </div>
  );
};

export default Visuals;
