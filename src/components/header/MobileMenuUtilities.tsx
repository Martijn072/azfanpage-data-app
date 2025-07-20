
import { useNavigate } from 'react-router-dom';
import { 
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Search } from "lucide-react";

interface MobileMenuUtilitiesProps {
  onSearchClick?: () => void;
}

export const MobileMenuUtilities = ({ onSearchClick }: MobileMenuUtilitiesProps) => {

  const handleSearchClick = () => {
    if (onSearchClick) {
      onSearchClick();
    }
  };

  return (
    <>
      {/* Search option for mobile */}
      <DropdownMenuItem
        onClick={handleSearchClick}
        className="flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors focus:ring-2 focus:ring-az-red hover:bg-az-red/5 dark:hover:bg-az-red/10 text-premium-gray-700 dark:text-gray-200 hover:text-az-red dark:hover:text-az-red"
      >
        <Search className="w-4 h-4" />
        <span className="font-medium">Zoeken</span>
      </DropdownMenuItem>

      <DropdownMenuSeparator />
    </>
  );
};
