
import { useState } from 'react';
import { useAZTeamId, useAZFixtures, useNextAZFixture } from '@/hooks/useFootballApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

export const FootballApiTest = () => {
  const [showTest, setShowTest] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const { data: teamId, isLoading: teamLoading, error: teamError, refetch: refetchTeam } = useAZTeamId();
  const { data: fixtures, isLoading: fixturesLoading, error: fixturesError, refetch: refetchFixtures } = useAZFixtures(teamId, 5);
  const { data: nextFixture, isLoading: nextLoading, error: nextError, refetch: refetchNext } = useNextAZFixture(teamId);

  const handleRefreshAll = () => {
    console.log('🔄 Refreshing all API calls with new key...');
    setRefreshKey(prev => prev + 1);
    refetchTeam();
    refetchFixtures();
    refetchNext();
  };

  if (!showTest) {
    return (
      <div className="p-4">
        <Button 
          onClick={() => setShowTest(true)}
          className="bg-az-red hover:bg-red-700 text-white"
        >
          Test API-Football Integratie
        </Button>
      </div>
    );
  }

  const getStatusIcon = (loading: boolean, error: any, data: any) => {
    if (loading) return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
    if (error) return <XCircle className="w-5 h-5 text-red-500" />;
    if (data) return <CheckCircle className="w-5 h-5 text-green-500" />;
    return <div className="w-5 h-5 rounded-full bg-gray-300" />;
  };

  const getStatusText = (loading: boolean, error: any, data: any) => {
    if (loading) return "Bezig...";
    if (error) return "Fout";
    if (data) return "Succes";
    return "Wachten";
  };

  return (
    <div className="p-4 space-y-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">API-Football Test Resultaten</h2>
        <div className="flex gap-2">
          <Button 
            onClick={handleRefreshAll}
            variant="outline"
            size="sm"
            disabled={teamLoading || fixturesLoading || nextLoading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Vernieuw
          </Button>
          <Button 
            onClick={() => setShowTest(false)}
            variant="outline"
          >
            Verberg Test
          </Button>
        </div>
      </div>

      {/* API Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>🔧 API Status Overzicht</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              {getStatusIcon(teamLoading, teamError, teamId)}
              <div>
                <div className="font-semibold">Team ID</div>
                <div className="text-sm text-gray-600">{getStatusText(teamLoading, teamError, teamId)}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              {getStatusIcon(fixturesLoading, fixturesError, fixtures)}
              <div>
                <div className="font-semibold">Wedstrijden</div>
                <div className="text-sm text-gray-600">{getStatusText(fixturesLoading, fixturesError, fixtures)}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              {getStatusIcon(nextLoading, nextError, nextFixture)}
              <div>
                <div className="font-semibold">Volgende</div>
                <div className="text-sm text-gray-600">{getStatusText(nextLoading, nextError, nextFixture)}</div>
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="text-sm">
              <strong>Timestamp:</strong> {new Date().toLocaleString('nl-NL')}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              Open Developer Tools (F12) → Console voor gedetailleerde logs
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team ID Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(teamLoading, teamError, teamId)}
            1. AZ Team ID Zoeken
          </CardTitle>
        </CardHeader>
        <CardContent>
          {teamLoading && (
            <div className="flex items-center gap-2 text-blue-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Zoeken naar AZ team met nieuwe API key...</span>
            </div>
          )}
          {teamError && (
            <div className="space-y-3">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-red-700 font-semibold">❌ API Fout</div>
                <div className="text-red-600 text-sm mt-1">
                  {teamError.message}
                </div>
              </div>
              <details className="text-xs">
                <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                  Klik hier voor technische details
                </summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto text-xs">
                  {JSON.stringify(teamError, null, 2)}
                </pre>
              </details>
            </div>
          )}
          {teamId && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-green-700 font-semibold">✅ Succes!</div>
              <div className="text-green-600">AZ Team ID gevonden: <strong>{teamId}</strong></div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fixtures Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(fixturesLoading, fixturesError, fixtures)}
            2. Laatste 5 AZ Wedstrijden
          </CardTitle>
        </CardHeader>
        <CardContent>
          {fixturesLoading && (
            <div className="flex items-center gap-2 text-blue-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Laden van wedstrijden...</span>
            </div>
          )}
          {fixturesError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-red-700 font-semibold">❌ Fout bij laden wedstrijden</div>
              <div className="text-red-600 text-sm mt-1">
                {fixturesError.message}
              </div>
            </div>
          )}
          {fixtures && fixtures.length > 0 && (
            <div className="space-y-3">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-green-700 font-semibold">✅ Succes!</div>
                <div className="text-green-600">{fixtures.length} wedstrijden gevonden</div>
              </div>
              <div className="space-y-2">
                {fixtures.slice(0, 3).map((fixture) => (
                  <div key={fixture.fixture.id} className="p-3 bg-gray-50 rounded-lg border">
                    <div className="font-semibold text-gray-800">
                      {fixture.teams.home.name} vs {fixture.teams.away.name}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Score: {fixture.goals.home} - {fixture.goals.away}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(fixture.fixture.date).toLocaleDateString('nl-NL')} • {fixture.league.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Next Fixture Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(nextLoading, nextError, nextFixture)}
            3. Volgende AZ Wedstrijd
          </CardTitle>
        </CardHeader>
        <CardContent>
          {nextLoading && (
            <div className="flex items-center gap-2 text-blue-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Laden van volgende wedstrijd...</span>
            </div>
          )}
          {nextError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-red-700 font-semibold">❌ Fout bij laden volgende wedstrijd</div>
              <div className="text-red-600 text-sm mt-1">
                {nextError.message}
              </div>
            </div>
          )}
          {nextFixture && (
            <div className="space-y-3">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-green-700 font-semibold">✅ Volgende wedstrijd gevonden!</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border">
                <div className="font-semibold text-gray-800">
                  {nextFixture.teams.home.name} vs {nextFixture.teams.away.name}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {new Date(nextFixture.fixture.date).toLocaleDateString('nl-NL')} om{' '}
                  {new Date(nextFixture.fixture.date).toLocaleTimeString('nl-NL', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {nextFixture.league.name}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
