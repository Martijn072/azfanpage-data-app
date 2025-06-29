
import React from 'react';
import { useAZTeamId, useNextAZFixture } from '@/hooks/useFootballApi';
import { Calendar, Clock } from 'lucide-react';

export const NextMatchWidget = () => {
  const { data: teamId, isLoading: teamLoading, error: teamError } = useAZTeamId();
  const { data: nextFixture, isLoading: fixtureLoading, error: fixtureError } = useNextAZFixture(teamId);

  const isLoading = teamLoading || fixtureLoading;
  const hasError = teamError || fixtureError;

  if (isLoading) {
    return (
      <div className="mx-4 mt-4 mb-6">
        <div className="card-premium dark:bg-gray-800 dark:border-gray-700 p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-premium-gray-200 dark:bg-gray-600 rounded w-48 mb-4"></div>
            <div className="flex items-center justify-center space-x-8">
              <div className="w-16 h-16 bg-premium-gray-200 dark:bg-gray-600 rounded-full"></div>
              <div className="h-6 bg-premium-gray-200 dark:bg-gray-600 rounded w-8"></div>
              <div className="w-16 h-16 bg-premium-gray-200 dark:bg-gray-600 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (hasError || !nextFixture) {
    return (
      <div className="mx-4 mt-4 mb-6">
        <div className="card-premium dark:bg-gray-800 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-az-black dark:text-white mb-4">
            Eerstvolgende AZ Wedstrijd
          </h3>
          <p className="text-premium-gray-600 dark:text-gray-400">
            Geen wedstrijd gepland
          </p>
        </div>
      </div>
    );
  }

  const matchDate = new Date(nextFixture.fixture.date);
  const now = new Date();
  const timeUntilMatch = matchDate.getTime() - now.getTime();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('nl-NL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('nl-NL', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCountdown = (milliseconds: number) => {
    if (milliseconds <= 0) return "Wedstrijd begonnen";
    
    const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
    const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days}d ${hours}u ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}u ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const isAZHome = nextFixture.teams.home.id === teamId;
  const azTeam = isAZHome ? nextFixture.teams.home : nextFixture.teams.away;
  const opponentTeam = isAZHome ? nextFixture.teams.away : nextFixture.teams.home;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';
    const fallback = target.nextElementSibling as HTMLSpanElement | null;
    if (fallback) {
      fallback.style.display = 'flex';
    }
  };

  return (
    <div className="mx-4 mt-4 mb-6">
      <div className="card-premium dark:bg-gray-800 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200">
        {/* Header */}
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-az-black dark:text-white mb-2">
            Eerstvolgende AZ Wedstrijd
          </h3>
          <p className="text-sm text-premium-gray-600 dark:text-gray-400">
            {nextFixture.league.name}
          </p>
        </div>

        {/* Teams with Logos Only */}
        <div className="flex items-center justify-center space-x-12 mb-6">
          {/* AZ Logo */}
          <div className="flex flex-col items-center">
            <div className="relative w-20 h-20 mb-2">
              <img
                src={azTeam.logo}
                alt="AZ Alkmaar"
                className="w-full h-full object-contain"
                onError={handleImageError}
              />
              <span 
                className="absolute inset-0 bg-az-red text-white text-xs font-bold rounded-full flex items-center justify-center"
                style={{ display: 'none' }}
              >
                AZ
              </span>
            </div>
          </div>

          {/* VS */}
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-premium-gray-400 dark:text-gray-500">
              VS
            </span>
          </div>

          {/* Opponent Logo */}
          <div className="flex flex-col items-center">
            <div className="relative w-20 h-20 mb-2">
              <img
                src={opponentTeam.logo}
                alt={opponentTeam.name}
                className="w-full h-full object-contain"
                onError={handleImageError}
              />
              <span 
                className="absolute inset-0 bg-premium-gray-600 text-white text-xs font-bold rounded-full flex items-center justify-center"
                style={{ display: 'none' }}
              >
                {opponentTeam.name.substring(0, 3).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Match Details */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center space-x-4 text-premium-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <Calendar size={16} />
              <span className="text-sm">{formatDate(matchDate)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock size={16} />
              <span className="text-sm">{formatTime(matchDate)}</span>
            </div>
          </div>

          {/* Countdown */}
          <div className="bg-az-red text-white px-4 py-2 rounded-full inline-block">
            <span className="font-semibold text-sm">
              {formatCountdown(timeUntilMatch)}
            </span>
          </div>
        </div>

        {/* Powered by */}
        <div className="text-center mt-6 pt-4 border-t border-premium-gray-100 dark:border-gray-700">
          <p className="text-xs text-premium-gray-400 dark:text-gray-500">
            Powered by 072DESIGN
          </p>
        </div>
      </div>
    </div>
  );
};
