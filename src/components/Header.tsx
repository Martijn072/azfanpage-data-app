
import { useState } from "react";
import { Search, Moon, Sun, Bell, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HeaderMenu } from "./HeaderMenu";
import { SearchOverlay } from "./SearchOverlay";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "./auth/AuthModal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export const Header = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { user, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();

  const handleNotificationClick = () => {
    navigate('/notifications');
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-premium-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <img
                src="/lovable-uploads/02689d46-9781-412f-9093-feef3e99cfe2.png"
                alt="AZ Fanpage"
                className="h-8 w-8 object-contain"
              />
              <span className="font-bold text-lg text-az-red">AZ Fanpage</span>
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSearchOpen(true)}
              className="p-2 hover:bg-az-red/10 dark:hover:bg-az-red/20 rounded-lg transition-colors"
            >
              <Search className="w-5 h-5 text-premium-gray-600 dark:text-gray-300" />
            </Button>

            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDarkMode}
              className="p-2 hover:bg-az-red/10 dark:hover:bg-az-red/20 rounded-lg transition-colors"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-premium-gray-600 dark:text-gray-300" />
              ) : (
                <Moon className="w-5 h-5 text-premium-gray-600 dark:text-gray-300" />
              )}
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNotificationClick}
              className="p-2 hover:bg-az-red/10 dark:hover:bg-az-red/20 rounded-lg transition-colors relative"
            >
              <Bell className="w-5 h-5 text-premium-gray-600 dark:text-gray-300" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-az-red text-white border-2 border-white dark:border-gray-900">
                3
              </Badge>
            </Button>

            {/* User Menu */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 hover:bg-az-red/10 dark:hover:bg-az-red/20 rounded-lg transition-colors"
                  >
                    <User className="w-5 h-5 text-premium-gray-600 dark:text-gray-300" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium text-premium-gray-900 dark:text-white">
                      {user?.email}
                    </p>
                    <p className="text-xs text-premium-gray-500 dark:text-gray-400">
                      Ingelogd
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/community')}>
                    <User className="w-4 h-4 mr-2" />
                    Community
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/notifications')}>
                    <Bell className="w-4 h-4 mr-2" />
                    Notificaties
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Uitloggen
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAuthModal(true)}
                className="p-2 hover:bg-az-red/10 dark:hover:bg-az-red/20 rounded-lg transition-colors"
              >
                <User className="w-5 h-5 text-premium-gray-600 dark:text-gray-300" />
              </Button>
            )}

            {/* Menu */}
            <HeaderMenu />
          </div>
        </div>
      </header>

      {/* Search Overlay */}
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      
      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
};
