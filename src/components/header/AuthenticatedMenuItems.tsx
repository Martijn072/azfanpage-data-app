
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Settings, LogOut } from "lucide-react";
import { useWordPressAuth } from "@/contexts/WordPressAuthContext";
import { useIsMobile } from "@/hooks/use-mobile";

const authMenuItems = [
  { id: "settings", label: "Instellingen", icon: Settings, path: "/instellingen/notificaties" },
];

export const AuthenticatedMenuItems = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useWordPressAuth();
  const isMobile = useIsMobile();

  const handleMenuClick = (path: string) => {
    navigate(path);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <>
      <DropdownMenuSeparator />
      {authMenuItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        
        return (
          <DropdownMenuItem
            key={item.id}
            onClick={() => handleMenuClick(item.path)}
            className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors focus:ring-2 focus:ring-az-red ${
              isActive 
                ? 'bg-az-red/10 text-az-red dark:bg-az-red/20' 
                : 'hover:bg-az-red/5 dark:hover:bg-az-red/10 text-premium-gray-700 dark:text-gray-200 hover:text-az-red dark:hover:text-az-red'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-az-red' : ''}`} />
            <span className={`font-medium ${isActive ? 'text-az-red' : ''}`}>
              {item.label}
            </span>
          </DropdownMenuItem>
        );
      })}

      {/* Mobile logout */}
      {isMobile && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors focus:ring-2 focus:ring-az-red hover:bg-az-red/5 dark:hover:bg-az-red/10 text-premium-gray-700 dark:text-gray-200 hover:text-az-red dark:hover:text-az-red"
          >
            <LogOut className="w-4 h-4" />
            <span className="font-medium">Uitloggen</span>
          </DropdownMenuItem>
        </>
      )}
    </>
  );
};
