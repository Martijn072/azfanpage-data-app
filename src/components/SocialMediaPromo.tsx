import { Instagram, Facebook, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

export const SocialMediaPromo = () => {
  const socialMediaLinks = [
    {
      name: "Instagram",
      handle: "@azfanpagenl",
      followers: "12.5K",
      url: "https://instagram.com/azfanpagenl",
      icon: Instagram,
      color: "bg-gradient-to-r from-purple-500 to-pink-500"
    },
    {
      name: "Twitter/X",
      handle: "@azfanpage",
      followers: "8.2K",
      url: "https://twitter.com/azfanpage",
      icon: X,
      color: "bg-black"
    },
    {
      name: "Facebook",
      handle: "AZFanpage",
      followers: "15.8K",
      url: "https://facebook.com/azfanpage",
      icon: Facebook,
      color: "bg-blue-600"
    }
  ];

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-850 rounded-xl shadow-lg border border-premium-gray-200 dark:border-gray-700 p-6 my-8">
      <div className="text-center mb-6">
        <h3 className="headline-premium text-headline-md text-az-black dark:text-white mb-2">
          Volg AZFanpage
        </h3>
        <p className="body-premium text-premium-gray-600 dark:text-gray-300 text-body-md">
          Mis geen AZ nieuws! Volg ons voor de laatste updates
        </p>
      </div>

      <Carousel
        opts={{
          align: "start",
          loop: true
        }}
        className="w-full max-w-sm mx-auto sm:max-w-2xl"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {socialMediaLinks.map((platform) => {
            const Icon = platform.icon;
            return (
              <CarouselItem key={platform.name} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-premium-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200 group h-full">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-full ${platform.color} text-white`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-semibold text-premium-gray-600 dark:text-gray-300">
                      {platform.followers}
                    </span>
                  </div>
                  
                  <div className="mb-3">
                    <h4 className="font-semibold text-az-black dark:text-white text-sm">
                      {platform.name}
                    </h4>
                    <p className="text-premium-gray-500 dark:text-gray-400 text-xs">
                      {platform.handle}
                    </p>
                  </div>

                  <Button asChild className="w-full bg-az-red hover:bg-red-700 text-white text-sm py-2 group-hover:scale-105 transition-all duration-200">
                    <a href={platform.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                      Volgen
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </Button>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex" />
        <CarouselNext className="hidden sm:flex" />
      </Carousel>

      <div className="text-center mt-6">
        <p className="text-xs text-premium-gray-500 dark:text-gray-400">🔥 Volg ons en blijf altijd op de hoogte!</p>
      </div>
    </div>
  );
};
