
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useWordPressAuth } from "@/contexts/WordPressAuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { AuthenticatedMenuItems } from "./header/AuthenticatedMenuItems";
import { MobileMenuUtilities } from "./header/MobileMenuUtilities";
import { Link, useLocation } from 'react-router-dom';

interface HeaderMenuProps {
  onSearchClick?: () => void;
}

export const HeaderMenu = ({ onSearchClick }: HeaderMenuProps) => {
  const { isAuthenticated } = useWordPressAuth();
  const isMobile = useIsMobile();
  const location = useLocation();

  const isActiveLink = (path: string) => {
    return location.pathname === path;
  };

  const navigationItems = [
    { path: "/", label: "Home" },
    { path: "/news", label: "Nieuws" },
    { path: "/eredivisie", label: "Eredivisie" },
    { path: "/programma", label: "Programma" },
    { path: "/jong-az", label: "Jong AZ" },
    { path: "/spelers", label: "Spelers" },
    { path: "/conference-league", label: "Conference League" },
    { path: "/forum", label: "Forum" },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-2 hover:bg-az-red/10 dark:hover:bg-az-red/20 rounded-lg transition-colors focus:ring-2 focus:ring-az-red"
        >
          <Menu className="w-5 h-5 text-premium-gray-600 dark:text-gray-300" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg z-50"
      >
        {/* Mobile-only utilities */}
        {isMobile && (
          <MobileMenuUtilities onSearchClick={onSearchClick} />
        )}

        {/* Navigation items for mobile */}
        {isMobile && (
          <>
            <DropdownMenuSeparator />
            {navigationItems.map((item) => (
              <DropdownMenuItem key={item.path} asChild>
                <Link
                  to={item.path}
                  className={`cursor-pointer ${
                    isActiveLink(item.path) 
                      ? 'text-az-red bg-az-red/10' 
                      : 'text-az-black dark:text-white hover:text-az-red'
                  }`}
                >
                  {item.label}
                </Link>
              </DropdownMenuItem>
            ))}
          </>
        )}
        
        {/* Authenticated user menu items */}
        {isAuthenticated && <AuthenticatedMenuItems />}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
