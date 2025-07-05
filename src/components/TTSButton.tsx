import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTTS } from "@/hooks/useTTS";

interface TTSButtonProps {
  text: string;
  title: string;
  className?: string;
}

export const TTSButton = ({ text, title, className = '' }: TTSButtonProps) => {
  const { isLoading, isPlaying, speak, stop } = useTTS();

  const handleClick = () => {
    if (isPlaying) {
      stop();
    } else {
      speak(text, { speed: 0.9 });
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      variant="outline"
      size="sm"
      className={`flex items-center gap-2 bg-az-red text-white border-az-red hover:bg-red-700 ${className}`}
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