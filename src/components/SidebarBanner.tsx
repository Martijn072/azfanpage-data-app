import { cn } from "@/lib/utils";

interface SidebarBannerProps {
  slot: string;
  aspectRatio?: string;
  className?: string;
}

export const SidebarBanner = ({ 
  slot, 
  aspectRatio = "300/250", 
  className 
}: SidebarBannerProps) => {
  return (
    <div 
      data-ad-slot={slot}
      className={cn(
        "bg-muted/30 rounded-xl border-2 border-dashed border-muted-foreground/20",
        "flex items-center justify-center text-muted-foreground/40 text-xs font-medium",
        "transition-colors hover:bg-muted/40",
        className
      )}
      style={{ aspectRatio }}
    >
      <span>Advertentie</span>
    </div>
  );
};
