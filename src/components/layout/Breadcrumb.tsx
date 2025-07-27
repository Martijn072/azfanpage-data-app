import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useResponsive } from '@/hooks/useResponsive';

const routeLabels: Record<string, string> = {
  '/': 'Home',
  '/nieuws': 'Nieuws',
  '/programma': 'Programma',
  '/eredivisie': 'Eredivisie Stand',
  '/spelers': 'Speler Statistieken',
  '/conference-league': 'Conference League',
  '/forum': 'Forum',
  '/over': 'Over ons',
  '/notificaties': 'Notificaties',
  '/instellingen': 'Instellingen',
};

export const Breadcrumb = () => {
  const location = useLocation();
  const { isMobile } = useResponsive();
  
  // Don't show breadcrumb on mobile or homepage
  if (isMobile || location.pathname === '/') {
    return null;
  }

  const pathSegments = location.pathname.split('/').filter(Boolean);
const breadcrumbItems: Array<{ label: string; path: string; icon?: any }> = [
    { label: 'Home', path: '/', icon: Home },
  ];

  // Build breadcrumb items
  let currentPath = '';
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Handle dynamic routes
    if (segment === 'artikel' && pathSegments[index + 1]) {
      breadcrumbItems.push({ label: 'Artikel', path: currentPath });
    } else if (segment === 'wedstrijd' && pathSegments[index + 1]) {
      breadcrumbItems.push({ label: 'Wedstrijd', path: currentPath });
    } else if (segment === 'speler' && pathSegments[index + 1]) {
      breadcrumbItems.push({ label: 'Speler', path: currentPath });
    } else if (routeLabels[currentPath]) {
      breadcrumbItems.push({ 
        label: routeLabels[currentPath], 
        path: currentPath 
      });
    }
  });

  // Don't show if only home
  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <nav className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 py-2">
        <ol className="flex items-center space-x-2 text-sm">
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1;
            const Icon = item.icon;
            
            return (
              <li key={item.path} className="flex items-center">
                {index > 0 && (
                  <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-600 mx-2" />
                )}
                
                {isLast ? (
                  <span className="text-az-red font-medium flex items-center">
                    {Icon && <Icon className="w-4 h-4 mr-1" />}
                    {item.label}
                  </span>
                ) : (
                  <Link
                    to={item.path}
                    className="text-gray-600 dark:text-gray-400 hover:text-az-red dark:hover:text-az-red transition-colors flex items-center"
                  >
                    {Icon && <Icon className="w-4 h-4 mr-1" />}
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};