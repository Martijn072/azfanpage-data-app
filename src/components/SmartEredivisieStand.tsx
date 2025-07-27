import { useEredivisieStandings } from "@/hooks/useStandingHooks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

export function SmartEredivisieStand() {
  const { data: standings, isLoading, error } = useEredivisieStandings()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold">Eredivisie Stand</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="w-6 h-4" />
                <Skeleton className="w-16 h-4" />
              </div>
              <Skeleton className="w-8 h-4" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (error || !standings?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold">Eredivisie Stand</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Stand momenteel niet beschikbaar
          </p>
        </CardContent>
      </Card>
    )
  }

  // Find AZ position
  const azTeam = standings.find(team => 
    team.team.name.toLowerCase().includes('az') || 
    team.team.name.toLowerCase().includes('alkmaar')
  )
  const azPosition = azTeam?.rank || 0

  // Smart display logic
  const getDisplayTeams = () => {
    if (azPosition <= 5) {
      // Show top 5 with AZ highlighted
      return standings.slice(0, 5)
    } else {
      // Show top 4 + "..." + AZ position
      const top4 = standings.slice(0, 4)
      return [...top4, { isEllipsis: true }, azTeam].filter(Boolean)
    }
  }

  const displayTeams = getDisplayTeams()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold">Eredivisie Stand</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {displayTeams.map((team: any, index) => {
          if (team.isEllipsis) {
            return (
              <div key="ellipsis" className="text-center py-1">
                <span className="text-muted-foreground">...</span>
              </div>
            )
          }

          const isAZ = team.team.name.toLowerCase().includes('az') || 
                      team.team.name.toLowerCase().includes('alkmaar')

          return (
            <div
              key={team.team.id}
              className={`flex items-center justify-between py-2 px-3 rounded-lg transition-colors ${
                isAZ 
                  ? 'bg-primary/10 border border-primary/20' 
                  : 'hover:bg-muted/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`text-sm font-medium w-6 ${isAZ ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                  {team.rank}.
                </span>
                <span className={`text-sm font-medium ${isAZ ? 'text-primary font-bold' : ''}`}>
                  {team.team.name === 'AZ Alkmaar' ? 'AZ' : team.team.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${isAZ ? 'text-primary font-bold' : ''}`}>
                  {team.points}
                </span>
                {isAZ && <Badge variant="destructive" className="text-xs">AZ</Badge>}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}