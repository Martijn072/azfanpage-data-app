import { useEredivisieStandings } from '@/hooks/useFootballApi';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorMessage } from "@/components/ErrorMessage";
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export const MiniEredivisieStandings = () => {
  const { data: standings, isLoading, error, refetch } = useEredivisieStandings();
  const navigate = useNavigate();

  if (error) {
    return null; // Silent fail for homepage widget
  }

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm animate-pulse">
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const top5 = standings?.slice(0, 5) || [];

  if (top5.length === 0) return null;

  return (
    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold text-az-black dark:text-white">
          Eredivisie Stand
        </CardTitle>
        <button
          onClick={() => navigate('/eredivisie')}
          className="text-az-red hover:text-red-700 transition-colors flex items-center gap-1 text-sm font-medium"
        >
          Bekijk alles
          <ChevronRight className="w-4 h-4" />
        </button>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {top5.map((standing, index) => {
            const isAZ = standing.team.name.toLowerCase().includes('az') && 
                        (standing.team.name.toLowerCase().includes('alkmaar') || 
                         standing.team.name === 'AZ');
            
            return (
              <div
                key={standing.team.id}
                onClick={() => navigate(`/team/${standing.team.id}`)}
                className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-200 cursor-pointer ${
                  isAZ 
                    ? 'bg-az-red/10 dark:bg-az-red/20 hover:bg-az-red/15 dark:hover:bg-az-red/25' 
                    : 'hover:bg-premium-gray-50 dark:hover:bg-gray-700'
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <span className={`text-sm font-bold w-6 ${isAZ ? 'text-az-red' : 'text-gray-600 dark:text-gray-400'}`}>
                  {standing.rank}
                </span>
                <img 
                  src={standing.team.logo} 
                  alt={standing.team.name}
                  className="w-6 h-6 object-contain"
                />
                <span className={`flex-1 text-sm font-medium ${isAZ ? 'text-az-red' : 'text-az-black dark:text-gray-100'}`}>
                  {standing.team.name}
                </span>
                <span className={`text-sm font-bold ${isAZ ? 'text-az-red' : 'text-gray-900 dark:text-gray-100'}`}>
                  {standing.points}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
