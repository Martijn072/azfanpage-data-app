import { useRef } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BackgroundUploaderProps {
  backgroundImage: string | null;
  onUpload: (url: string) => void;
  onRemove: () => void;
}

export const BackgroundUploader = ({ backgroundImage, onUpload, onRemove }: BackgroundUploaderProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onUpload(url);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="flex items-center gap-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => inputRef.current?.click()}
      >
        <ImagePlus className="h-4 w-4" />
        {backgroundImage ? 'Achtergrond wijzigen' : 'Achtergrond uploaden'}
      </Button>
      {backgroundImage && (
        <>
          <img
            src={backgroundImage}
            alt="Achtergrond preview"
            className="h-9 w-9 rounded-md object-cover border border-border"
          />
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRemove}>
            <X className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
};
