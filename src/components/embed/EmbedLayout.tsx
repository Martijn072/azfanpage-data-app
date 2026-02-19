import { useEffect, ReactNode } from "react";

interface EmbedLayoutProps {
  children: ReactNode;
}

export const EmbedLayout = ({ children }: EmbedLayoutProps) => {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <div className="min-h-screen bg-background p-3">
      {children}
      <div className="mt-2 text-center">
        <span className="text-[10px] text-muted-foreground/50">
          Powered by{" "}
          <a
            href="https://azfanpage.nl"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary/50 hover:text-primary transition-colors"
          >
            AZ Fanpage
          </a>
        </span>
      </div>
    </div>
  );
};
