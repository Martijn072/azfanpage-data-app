import { Facebook, Instagram } from "lucide-react";

// Custom X (Twitter) icon
const XIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="w-5 h-5"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const socialLinks = [
  {
    name: "X",
    icon: XIcon,
    url: "https://x.com/azfanpage",
    hoverClass: "hover:text-foreground hover:bg-muted",
  },
  {
    name: "Facebook",
    icon: Facebook,
    url: "https://www.facebook.com/azfanpage",
    hoverClass: "hover:text-[#1877F2] hover:bg-blue-50 dark:hover:bg-blue-950/30",
  },
  {
    name: "Instagram",
    icon: Instagram,
    url: "https://www.instagram.com/azfanpage",
    hoverClass: "hover:text-[#E4405F] hover:bg-pink-50 dark:hover:bg-pink-950/30",
  },
];

export const InlineFollowWidget = () => {
  return (
    <div className="mt-8 p-4 bg-muted/50 border border-border rounded-lg">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm font-medium text-foreground">
          Volg AZFanpage
        </p>
        
        <div className="flex items-center gap-2">
          {socialLinks.map((social) => (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-2 rounded-full text-muted-foreground transition-all duration-200 ${social.hoverClass}`}
              aria-label={`Volg ons op ${social.name}`}
            >
              <social.icon />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
