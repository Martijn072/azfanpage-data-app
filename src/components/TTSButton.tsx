import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTTS } from "@/hooks/useTTS";

interface TTSButtonProps {
  text: string;
  title: string;
  voice?: string;
  className?: string;
}

export const TTSButton = ({ text, title, voice = 'nl-NL-Standard-A', className = '' }: TTSButtonProps) => {
  const { isLoading, isPlaying, speak, stop } = useTTS();

  const handleClick = () => {
    if (isPlaying) {
      stop();
    } else {
      speak(text, { voice });
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      variant="outline"
      size="sm"
      className={`flex items-center gap-2 text-az-red border-az-red hover:bg-az-red hover:text-white ${className}`}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : isPlaying ? (
        <VolumeX className="w-4 h-4" />
      ) : (
        <Volume2 className="w-4 h-4" />
      )}
      <span className="text-sm font-medium">
        {isLoading ? 'Laden...' : isPlaying ? 'Stop' : 'Voorlezen'}
      </span>
    </Button>
  );
};