import { TeamLineup, LineupPlayer } from "@/hooks/useFixtureLineups";
import { cn } from "@/lib/utils";

interface FormationDisplayProps {
  lineups: TeamLineup[];
  homeTeamId: number;
}

const AZ_TEAM_ID = 201;

// Parse grid position "1:1" → { row, col }
const parseGrid = (grid: string) => {
  const [row, col] = grid.split(":").map(Number);
  return { row, col };
};

const PlayerDot = ({ player, isAZ, isGK }: { player: LineupPlayer["player"]; isAZ: boolean; isGK: boolean }) => (
  <div className="flex flex-col items-center gap-0.5">
    <div
      className={cn(
        "w-9 h-9 rounded-full flex items-center justify-center text-white text-app-tiny font-bold border-2",
        isGK
          ? "bg-warning border-warning/60"
          : isAZ
            ? "bg-primary border-primary/60"
            : "bg-muted-foreground/60 border-muted-foreground/40"
      )}
    >
      {player.number}
    </div>
    <span className="text-[10px] text-foreground/80 whitespace-nowrap max-w-[60px] truncate text-center">
      {player.name.split(" ").pop()}
    </span>
  </div>
);

const TeamFormation = ({ lineup, isHome }: { lineup: TeamLineup; isHome: boolean }) => {
  const isAZ = lineup.team.id === AZ_TEAM_ID;

  // Group players by row
  const rows: Map<number, LineupPlayer["player"][]> = new Map();
  lineup.startXI.forEach(({ player }) => {
    if (!player.grid) return;
    const { row, col } = parseGrid(player.grid);
    if (!rows.has(row)) rows.set(row, []);
    rows.get(row)!.push(player);
  });

  // Sort rows and players within rows
  const sortedRows = Array.from(rows.entries()).sort((a, b) => 
    isHome ? a[0] - b[0] : b[0] - a[0]
  );

  return (
    <div className="flex-1">
      {/* Team header */}
      <div className="flex items-center gap-2 mb-3 justify-center">
        <img src={lineup.team.logo} alt="" className="h-5 w-5 object-contain" />
        <span className={cn("text-app-body-strong", isAZ && "text-primary")}>{lineup.team.name}</span>
        <span className="text-app-tiny text-muted-foreground">{lineup.formation}</span>
      </div>

      {/* Formation grid */}
      <div className="relative rounded-xl overflow-hidden" style={{ background: "linear-gradient(180deg, #1B5E20 0%, #2E7D32 50%, #1B5E20 100%)" }}>
        {/* Field lines */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-24 h-24 border border-white/15 rounded-full" />
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-12 border-b border-l border-r border-white/15 rounded-b-sm" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-12 border-t border-l border-r border-white/15 rounded-t-sm" />
        <div className="absolute left-0 right-0 top-1/2 h-px bg-white/10" />

        {/* Players */}
        <div className="relative py-4 px-2 space-y-3" style={{ minHeight: "320px" }}>
          {sortedRows.map(([rowNum, players]) => (
            <div key={rowNum} className="flex justify-around items-center">
              {players
                .sort((a, b) => {
                  const colA = parseGrid(a.grid).col;
                  const colB = parseGrid(b.grid).col;
                  return colA - colB;
                })
                .map(player => (
                  <PlayerDot
                    key={player.id}
                    player={player}
                    isAZ={isAZ}
                    isGK={player.pos === "G"}
                  />
                ))}
            </div>
          ))}
        </div>
      </div>

      {/* Substitutes */}
      <div className="mt-3">
        <h4 className="text-app-tiny text-muted-foreground uppercase tracking-wider mb-2">Bank</h4>
        <div className="flex flex-wrap gap-2">
          {lineup.substitutes.map(({ player }) => (
            <div
              key={player.id}
              className="flex items-center gap-1.5 bg-card border border-border rounded-lg px-2 py-1"
            >
              <span className="text-app-tiny font-mono text-muted-foreground">{player.number}</span>
              <span className="text-app-tiny text-foreground">{player.name.split(" ").pop()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const FormationDisplay = ({ lineups, homeTeamId }: FormationDisplayProps) => {
  if (!lineups || lineups.length < 2) {
    return (
      <div className="text-center py-8 text-app-body text-muted-foreground">
        Geen opstellingen beschikbaar voor deze wedstrijd
      </div>
    );
  }

  const homeLineup = lineups.find(l => l.team.id === homeTeamId) || lineups[0];
  const awayLineup = lineups.find(l => l.team.id !== homeTeamId) || lineups[1];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <TeamFormation lineup={homeLineup} isHome={true} />
      <TeamFormation lineup={awayLineup} isHome={false} />
    </div>
  );
};
