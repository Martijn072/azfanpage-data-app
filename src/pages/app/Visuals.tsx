import { useState } from 'react';
import { TemplateSelector, TemplateType } from '@/components/visuals/TemplateSelector';
import { VisualPreview } from '@/components/visuals/VisualPreview';
import { BackgroundUploader } from '@/components/visuals/BackgroundUploader';

const Visuals = () => {
  const [selected, setSelected] = useState<TemplateType>('result');
  const [backgrounds, setBackgrounds] = useState<Record<TemplateType, string | null>>({
    result: null,
    preview: null,
    standings: null,
    matchday: null,
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

      <VisualPreview template={selected} backgroundImage={backgrounds[selected]} />
    </div>
  );
};

export default Visuals;
