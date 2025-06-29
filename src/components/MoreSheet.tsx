
import { useState } from 'react';
import { Users, Trophy, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface MoreSheetProps {
  children: React.ReactNode;
}

export const MoreSheet = ({ children }: MoreSheetProps) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const moreItems = [
    { 
      id: "spelers", 
      label: "Speler Statistieken", 
      icon: Users, 
      path: "/spelers",
      description: "Bekijk statistieken van alle AZ spelers"
    },
    { 
      id: "conference", 
      label: "Conference League", 
      icon: Trophy, 
      path: "/conference-league",
      description: "Stand en wedstrijden Conference League"
    },
  ];

  const handleItemClick = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent 
        side="bottom" 
        className="bg-white dark:bg-gray-900 border-t border-premium-gray-200 dark:border-gray-700"
      >
        <SheetHeader className="pb-4">
          <SheetTitle className="text-left text-lg font-semibold text-premium-gray-900 dark:text-gray-100">
            Meer opties
          </SheetTitle>
        </SheetHeader>
        
        <div className="space-y-2 pb-6">
          {moreItems.map((item) => {
            const Icon = item.icon;
            
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.path)}
                className="w-full flex items-center gap-4 p-4 rounded-lg hover:bg-premium-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-az-red/10 dark:bg-az-red/20 rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5 text-az-red" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-premium-gray-900 dark:text-gray-100">
                    {item.label}
                  </h3>
                  <p className="text-sm text-premium-gray-600 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-premium-gray-400 dark:text-gray-500" />
              </button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
};
