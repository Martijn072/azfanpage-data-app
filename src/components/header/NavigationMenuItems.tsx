
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const NavigationMenuItems = () => {
  const location = useLocation();

  const isActiveLink = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="hidden md:flex items-center space-x-8">
      <Link
        to="/"
        className={`text-sm font-medium transition-colors ${
          isActiveLink('/') 
            ? 'text-az-red' 
            : 'text-az-black hover:text-az-red dark:text-white dark:hover:text-az-red'
        }`}
      >
        Home
      </Link>
      <Link
        to="/news"
        className={`text-sm font-medium transition-colors ${
          isActiveLink('/news') 
            ? 'text-az-red' 
            : 'text-az-black hover:text-az-red dark:text-white dark:hover:text-az-red'
        }`}
      >
        Nieuws
      </Link>
      <Link
        to="/eredivisie"
        className={`text-sm font-medium transition-colors ${
          isActiveLink('/eredivisie') 
            ? 'text-az-red' 
            : 'text-az-black hover:text-az-red dark:text-white dark:hover:text-az-red'
        }`}
      >
        Eredivisie
      </Link>
      <Link
        to="/programma"
        className={`text-sm font-medium transition-colors ${
          isActiveLink('/programma') 
            ? 'text-az-red' 
            : 'text-az-black hover:text-az-red dark:text-white dark:hover:text-az-red'
        }`}
      >
        Programma
      </Link>
      <Link
        to="/jong-az"
        className={`text-sm font-medium transition-colors ${
          isActiveLink('/jong-az') 
            ? 'text-az-red' 
            : 'text-az-black hover:text-az-red dark:text-white dark:hover:text-az-red'
        }`}
      >
        Jong AZ
      </Link>
      <Link
        to="/spelers"
        className={`text-sm font-medium transition-colors ${
          isActiveLink('/spelers') 
            ? 'text-az-red' 
            : 'text-az-black hover:text-az-red dark:text-white dark:hover:text-az-red'
        }`}
      >
        Spelers
      </Link>
      <Link
        to="/conference-league"
        className={`text-sm font-medium transition-colors ${
          isActiveLink('/conference-league') 
            ? 'text-az-red' 
            : 'text-az-black hover:text-az-red dark:text-white dark:hover:text-az-red'
        }`}
      >
        Europa
      </Link>
      <Link
        to="/forum"
        className={`text-sm font-medium transition-colors ${
          isActiveLink('/forum') 
            ? 'text-az-red' 
            : 'text-az-black hover:text-az-red dark:text-white dark:hover:text-az-red'
        }`}
      >
        Forum
      </Link>
    </nav>
  );
};
