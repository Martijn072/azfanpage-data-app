import { useEersteDivisieStandings } from '@/hooks/useJongAZHooks';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorMessage } from "@/components/ErrorMessage";
import { getCurrentActiveSeason } from '@/utils/seasonUtils';
import { useNavigate } from 'react-router-dom';

export const EersteDivisieStandings = () => {
  const seasonInfo = getCurrentActiveSeason();
  const { data: standings, isLoading, error, refetch } = useEersteDivisieStandings();
  const navigate = useNavigate();

  const handleTeamClick = (teamId: number) => {
    navigate(`/team/${teamId}`);
  };

  if (error) {
    return (
      <div className="animate-fade-in">
        <ErrorMessage onRetry={() => refetch()} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(20)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {standings?.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-premium-gray-600 dark:text-gray-300">
            Geen Eerste Divisie data beschikbaar
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg">
          <Table>
            <TableHeader>
              <TableRow className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <TableHead className="w-12 text-gray-900 dark:text-gray-100 font-semibold">#</TableHead>
                <TableHead className="text-gray-900 dark:text-gray-100 font-semibold">Team</TableHead>
                <TableHead className="text-center w-12 text-gray-900 dark:text-gray-100 font-semibold">Wed</TableHead>
                <TableHead className="text-center w-12 text-gray-900 dark:text-gray-100 font-semibold">W</TableHead>
                <TableHead className="text-center w-12 text-gray-900 dark:text-gray-100 font-semibold">G</TableHead>
                <TableHead className="text-center w-12 text-gray-900 dark:text-gray-100 font-semibold">V</TableHead>
                <TableHead className="text-center w-16 text-gray-900 dark:text-gray-100 font-semibold">Doelpunten</TableHead>
                <TableHead className="text-center w-12 text-gray-900 dark:text-gray-100 font-semibold">Ptn</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white dark:bg-gray-800">
              {standings?.map((standing, index) => {
                const isJongAZ = standing.team.name.toLowerCase().includes('jong') && 
                               standing.team.name.toLowerCase().includes('az');
                
                return (
                  <TableRow 
                    key={standing.team.id}
                    onClick={() => handleTeamClick(standing.team.id)}
                    className={`${isJongAZ ? 'bg-az-red/10 dark:bg-az-red/20 border-b border-az-red/20 dark:border-az-red/30 hover:bg-az-red/15 dark:hover:bg-az-red/25' : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600'} transition-all duration-200 animate-fade-in cursor-pointer`}
                    style={{ animationDelay: `${index * 0.02}s` }}
                  >
                    <TableCell className="font-medium">
                      <span className={isJongAZ ? 'text-az-red font-bold' : 'text-gray-900 dark:text-gray-100'}>
                        {standing.rank}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img 
                          src={standing.team.logo} 
                          alt={standing.team.name}
                          className="w-6 h-6 object-contain transform transition-transform duration-200 hover:scale-110"
                        />
                        <span className={`hidden sm:block font-medium ${isJongAZ ? 'text-az-red font-bold' : 'text-az-black dark:text-gray-100'}`}>
                          {standing.team.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={isJongAZ ? 'text-az-red font-bold' : 'text-gray-900 dark:text-gray-100'}>
                        {standing.all.played}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={isJongAZ ? 'text-az-red font-bold' : 'text-gray-900 dark:text-gray-100'}>
                        {standing.all.win}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={isJongAZ ? 'text-az-red font-bold' : 'text-gray-900 dark:text-gray-100'}>
                        {standing.all.draw}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={isJongAZ ? 'text-az-red font-bold' : 'text-gray-900 dark:text-gray-100'}>
                        {standing.all.lose}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={isJongAZ ? 'text-az-red font-bold' : 'text-gray-900 dark:text-gray-100'}>
                        {standing.all.goals.for}-{standing.all.goals.against}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`font-bold ${isJongAZ ? 'text-az-red' : 'text-gray-900 dark:text-gray-100'}`}>
                        {standing.points}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
