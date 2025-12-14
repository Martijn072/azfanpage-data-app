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
  // In production, return null (AdSense will be added later)
  // In development, show subtle placeholder
  const isDevelopment = import.meta.env.DEV;
  
  if (!isDevelopment) {
    return null;
  }

  return (
    <div 
      data-ad-slot={slot}
      className={cn(
        "aspect-[300/250] bg-muted/50 rounded-xl flex items-center justify-center",
        className
      )}
      style={{ aspectRatio }}
    >
      <span className="text-xs text-muted-foreground/50">{slot}</span>
    </div>
  );
};
