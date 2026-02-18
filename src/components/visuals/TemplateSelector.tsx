import { Trophy, FileSearch, BarChart3, Calendar, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TemplateType = 'result' | 'preview' | 'standings' | 'matchday' | 'player';

interface TemplateSelectorProps {
  selected: TemplateType;
  onSelect: (template: TemplateType) => void;
}

const templates: { id: TemplateType; label: string; icon: typeof Trophy; format: string }[] = [
  { id: 'result', label: 'Uitslag', icon: Trophy, format: '1080×1080' },
  { id: 'preview', label: 'Voorbeschouwing', icon: FileSearch, format: '1080×1080' },
  { id: 'standings', label: 'Stand', icon: BarChart3, format: '1080×1080' },
  { id: 'matchday', label: 'Speelronde', icon: Calendar, format: '1080×1080' },
  { id: 'player', label: 'Speler', icon: User, format: '1080×1080' },
];

export const TemplateSelector = ({ selected, onSelect }: TemplateSelectorProps) => {
  return (
    <div className="flex gap-2 flex-wrap">
      {templates.map((t) => (
        <button
          key={t.id}
          onClick={() => onSelect(t.id)}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-lg text-app-body font-medium transition-all duration-150 border",
            selected === t.id
              ? "bg-primary/10 text-primary border-primary/30"
              : "bg-card text-muted-foreground border-border hover:border-primary/20 hover:text-foreground"
          )}
        >
          <t.icon className="h-4 w-4" />
          <span>{t.label}</span>
          <span className="text-app-tiny text-muted-foreground/60 ml-1">{t.format}</span>
        </button>
      ))}
    </div>
  );
};
