import { TeamStatistics as FixtureTeamStats } from "@/types/footballApi";
import { cn } from "@/lib/utils";

interface StatComparisonBarsProps {
  stats: FixtureTeamStats[];
  homeTeamId: number;
}

const AZ_TEAM_ID = 201;

// Stats we want to show, in order
const STAT_KEYS = [
  "expected_goals",
  "Ball Possession",
  "Total Shots",
  "Shots on Goal",
  "Shots off Goal",
  "Blocked Shots",
  "Shots insidebox",
  "Shots outsidebox",
  "Corner Kicks",
  "Fouls",
  "Offsides",
  "Yellow Cards",
  "Red Cards",
  "Goalkeeper Saves",
  "Total passes",
  "Passes accurate",
  "Passes %",
  "goals_prevented",
];

const STAT_LABELS: Record<string, string> = {
  "expected_goals": "Expected Goals (xG)",
  "Ball Possession": "Balbezit",
  "Total Shots": "Schoten totaal",
  "Shots on Goal": "Schoten op doel",
  "Shots off Goal": "Schoten naast",
  "Blocked Shots": "Geblokte schoten",
  "Shots insidebox": "Schoten in 16m",
  "Shots outsidebox": "Schoten buiten 16m",
  "Corner Kicks": "Corners",
  "Fouls": "Overtredingen",
  "Offsides": "Buitenspel",
  "Yellow Cards": "Gele kaarten",
  "Red Cards": "Rode kaarten",
  "Goalkeeper Saves": "Reddingen keeper",
  "Total passes": "Passes totaal",
  "Passes accurate": "Geslaagde passes",
  "Passes %": "Pass percentage",
  "goals_prevented": "Goals voorkomen",
};

export const StatComparisonBars = ({ stats, homeTeamId }: StatComparisonBarsProps) => {
  if (stats.length < 2) return null;

  const homeStats = stats.find(s => s.team.id === homeTeamId);
  const awayStats = stats.find(s => s.team.id !== homeTeamId);

  if (!homeStats || !awayStats) return null;

  const getStatValue = (teamStats: FixtureTeamStats, type: string): number => {
    const stat = teamStats.statistics.find(s => s.type === type);
    if (!stat || stat.value === null || stat.value === undefined) return 0;
    const str = String(stat.value).replace("%", "");
    return parseFloat(str) || 0;
  };

  const isAZHome = homeTeamId === AZ_TEAM_ID;

  return (
    <div className="space-y-3">
      {/* Team headers */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <img src={homeStats.team.logo} alt="" className="h-6 w-6 object-contain" />
          <span className={cn("text-app-body-strong", isAZHome && "text-primary")}>
            {homeStats.team.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("text-app-body-strong", !isAZHome && "text-primary")}>
            {awayStats.team.name}
          </span>
          <img src={awayStats.team.logo} alt="" className="h-6 w-6 object-contain" />
        </div>
      </div>

      {/* Stat bars */}
      {STAT_KEYS.map(statKey => {
        const homeVal = getStatValue(homeStats, statKey);
        const awayVal = getStatValue(awayStats, statKey);
        const total = homeVal + awayVal;
        const homePercent = total > 0 ? (homeVal / total) * 100 : 50;
        const awayPercent = total > 0 ? (awayVal / total) * 100 : 50;
        const isPercentage = statKey.includes("%") || statKey === "Ball Possession";
        const isDecimal = statKey === "expected_goals";
        const displayHome = isPercentage ? `${homeVal}%` : isDecimal ? homeVal.toFixed(2) : homeVal.toString();
        const displayAway = isPercentage ? `${awayVal}%` : isDecimal ? awayVal.toFixed(2) : awayVal.toString();

        // Determine which side "wins" this stat
        const homeIsAZ = homeTeamId === AZ_TEAM_ID;
        const azWins = homeIsAZ ? homeVal >= awayVal : awayVal >= homeVal;

        return (
          <div key={statKey}>
            <div className="flex items-center justify-between mb-1">
              <span className={cn(
                "text-app-data font-mono",
                (homeIsAZ ? homeVal > awayVal : false) ? "text-foreground font-bold" : "text-muted-foreground"
              )}>
                {displayHome}
              </span>
              <span className="text-app-small text-muted-foreground">{STAT_LABELS[statKey] || statKey}</span>
              <span className={cn(
                "text-app-data font-mono",
                (!homeIsAZ ? awayVal > homeVal : false) ? "text-foreground font-bold" : "text-muted-foreground"
              )}>
                {displayAway}
              </span>
            </div>
            <div className="flex h-2 rounded-full overflow-hidden bg-muted gap-0.5">
              <div
                className={cn(
                  "rounded-l-full transition-all duration-500",
                  homeIsAZ
                    ? homeVal >= awayVal ? "bg-primary" : "bg-muted-foreground/40"
                    : homeVal > awayVal ? "bg-muted-foreground/60" : "bg-muted-foreground/40"
                )}
                style={{ width: `${homePercent}%` }}
              />
              <div
                className={cn(
                  "rounded-r-full transition-all duration-500",
                  !homeIsAZ
                    ? awayVal >= homeVal ? "bg-primary" : "bg-muted-foreground/40"
                    : awayVal > homeVal ? "bg-muted-foreground/60" : "bg-muted-foreground/40"
                )}
                style={{ width: `${awayPercent}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
