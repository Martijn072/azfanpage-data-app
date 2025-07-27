import { Instagram, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export const SocialMediaSidebar = () => {
  const socialLinks = [
    {
      name: "Instagram",
      handle: "@azfanpagenl",
      url: "https://instagram.com/azfanpagenl",
      icon: Instagram,
      color: "bg-gradient-to-r from-purple-500 to-pink-500"
    },
    {
      name: "Twitter/X",
      handle: "@azfanpage",
      url: "https://twitter.com/azfanpage",
      icon: X,
      color: "bg-black"
    }
  ];

  return (
    <div className="bg-card rounded-lg border overflow-hidden">
      <div className="p-4 border-b">
        <h3 className="text-lg font-bold text-foreground">Volg ons op:</h3>
      </div>
      
      <div className="p-4">
        <div className="space-y-3">
          {socialLinks.map((platform) => {
            const Icon = platform.icon;
            return (
              <Button
                key={platform.name}
                asChild
                className="w-full bg-az-red hover:bg-red-700 text-white justify-start gap-3 p-4 h-auto"
              >
                <a href={platform.url} target="_blank" rel="noopener noreferrer">
                  <div className={`p-2 rounded-full ${platform.color} text-white`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{platform.name}</div>
                    <div className="text-sm opacity-90">{platform.handle}</div>
                  </div>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};