
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const NavigationMenuItems = () => {
  const location = useLocation();

  const isActiveLink = (paths: string[]) => {
    return paths.some(path => {
      if (path.endsWith('/*')) {
        return location.pathname.startsWith(path.replace('/*', ''));
      }
      return location.pathname === path;
    });
  };

  const navItems = [
    { paths: ['/'], label: 'Home' },
    { paths: ['/nieuws', '/news', '/artikel/*'], label: 'Nieuws' },
    { paths: ['/wedstrijden', '/programma', '/wedstrijd/*'], label: 'Wedstrijden' },
    { paths: ['/standen', '/eredivisie', '/conference-league', '/jong-az'], label: 'Standen' },
    { paths: ['/selectie', '/spelers', '/speler/*', '/selectie/*'], label: 'Selectie' },
    { paths: ['/forum'], label: 'Forum' },
  ];

  return (
    <nav className="hidden md:flex items-center space-x-8">
      {navItems.map((item) => (
        <Link
          key={item.label}
          to={item.paths[0]}
          className={`text-sm font-medium transition-colors ${
            isActiveLink(item.paths) 
              ? 'text-az-red' 
              : 'text-az-black hover:text-az-red dark:text-white dark:hover:text-az-red'
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
};
