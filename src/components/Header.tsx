
import { useState } from "react";
import { Bell, Search, Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { HeaderMenu } from "./HeaderMenu";
import { SearchOverlay } from "./SearchOverlay";

export const Header = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleSearchClick = () => {
    setIsSearchOpen(true);
  };

  return (
    <>
      <header className="bg-white dark:bg-gray-900 border-b border-premium-gray-100 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/02689d46-9781-412f-9093-feef3e99cfe2.png" 
                alt="AZ Fanpage Logo" 
                className="h-10 w-auto cursor-pointer hover:opacity-80 transition-opacity"
                onClick={handleLogoClick}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button 
                onClick={handleSearchClick}
                className="p-2 hover:bg-premium-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Zoeken"
              >
                <Search className="w-5 h-5 text-premium-gray-600 dark:text-gray-300" />
              </button>
              <button className="p-2 hover:bg-premium-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors relative">
                <Bell className="w-5 h-5 text-premium-gray-600 dark:text-gray-300" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-az-red rounded-full"></div>
              </button>
              <button 
                onClick={toggleDarkMode}
                className="p-2 hover:bg-premium-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-premium-gray-600 dark:text-gray-300" />
                ) : (
                  <Moon className="w-5 h-5 text-premium-gray-600 dark:text-gray-300" />
                )}
              </button>
              <HeaderMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Search Overlay */}
      <SearchOverlay 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </>
  );
};
