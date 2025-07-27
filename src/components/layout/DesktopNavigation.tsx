import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Bell, Calendar, Table, Users, Info, MessageSquare, Mail } from 'lucide-react';

const navigationItems = [
  { id: 'home', label: 'Home', icon: Home, path: '/' },
  { id: 'news', label: 'Nieuws', icon: Bell, path: '/nieuws' },
  { id: 'programma', label: 'Programma', icon: Calendar, path: '/programma' },
  { id: 'eredivisie', label: 'Stand', icon: Table, path: '/eredivisie' },
  { id: 'spelers', label: 'Spelers', icon: Users, path: '/spelers' },
  { id: 'over', label: 'Over ons', icon: Info, path: '/over' },
  { id: 'forum', label: 'Forum', icon: MessageSquare, path: '/forum' },
  { id: 'contact', label: 'Contact', icon: Mail, path: '/contact' },
];

export const DesktopNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-16 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center space-x-8 h-12">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
              (item.path !== '/' && location.pathname.startsWith(item.path));
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 hover:bg-az-red/10 dark:hover:bg-az-red/20 ${
                  isActive 
                    ? 'text-az-red bg-az-red/5 dark:bg-az-red/10' 
                    : 'text-gray-700 dark:text-gray-300 hover:text-az-red'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};