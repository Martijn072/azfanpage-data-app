
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Home, Bell, Calendar, Table } from "lucide-react";

// Simplified navigation menu - only core navigation items that are also in bottom nav
const menuItems = [
  { id: "home", label: "Home", icon: Home, path: "/" },
  { id: "news", label: "Nieuws", icon: Bell, path: "/nieuws" },
  { id: "programma", label: "Programma", icon: Calendar, path: "/programma" },
  { id: "eredivisie", label: "Eredivisie Stand", icon: Table, path: "/eredivisie" },
];

export const NavigationMenuItems = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuClick = (path: string) => {
    navigate(path);
  };

  return (
    <>
      {menuItems.map((item) => {
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
    </>
  );
};
