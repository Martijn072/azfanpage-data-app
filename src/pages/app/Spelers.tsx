import { useState, useMemo } from "react";
import { useSquad } from "@/hooks/useSquad";
import { useTeamStatistics } from "@/hooks/useTeamStatistics";
import { SquadPlayer } from "@/types/footballApi";
import { Users, Search, Shield, Crosshair, Footprints, Goal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const AZ_TEAM_ID = 201;

const POSITION_MAP: Record<string, { label: string; icon: typeof Shield; order: number }> = {
  Goalkeeper: { label: "Keepers", icon: Shield, order: 0 },
  Defender: { label: "Verdedigers", icon: Footprints, order: 1 },
  Midfielder: { label: "Middenvelders", icon: Crosshair, order: 2 },
  Attacker: { label: "Aanvallers", icon: Goal, order: 3 },
};

const POSITION_FILTERS = ["Alle", "Goalkeeper", "Defender", "Midfielder", "Attacker"] as const;

const PlayerCard = ({ player }: { player: SquadPlayer }) => (
  <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 hover:border-primary/30 transition-colors">
    <img
      src={player.photo}
      alt={player.name}
      className="h-14 w-14 rounded-full object-cover bg-muted border-2 border-border"
      loading="lazy"
    />
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        {player.number && (
          <span className="font-mono text-app-small text-muted-foreground font-semibold">
            #{player.number}
          </span>
        )}
        <h3 className="font-headline text-app-body font-semibold text-foreground truncate">
          {player.name}
        </h3>
      </div>
      <div className="flex items-center gap-3 mt-1">
        <span className={cn(
          "text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full",
          player.position === "Goalkeeper" && "bg-amber-500/15 text-amber-400",
          player.position === "Defender" && "bg-blue-500/15 text-blue-400",
          player.position === "Midfielder" && "bg-emerald-500/15 text-emerald-400",
          player.position === "Attacker" && "bg-red-500/15 text-red-400",
        )}>
          {POSITION_MAP[player.position]?.label.slice(0, -1) || player.position}
        </span>
        <span className="text-app-small text-muted-foreground">{player.age} jaar</span>
      </div>
    </div>
  </div>
);

const Spelers = () => {
  const { data: squad, isLoading } = useSquad(AZ_TEAM_ID);
  const [filter, setFilter] = useState<string>("Alle");
  const [search, setSearch] = useState("");

  const filteredPlayers = useMemo(() => {
    if (!squad?.players) return [];
    let players = [...squad.players];

    if (filter !== "Alle") {
      players = players.filter((p) => p.position === filter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      players = players.filter(
        (p) => p.name.toLowerCase().includes(q) || (p.number && String(p.number).includes(q))
      );
    }

    // Sort by position order, then by number
    players.sort((a, b) => {
      const orderA = POSITION_MAP[a.position]?.order ?? 9;
      const orderB = POSITION_MAP[b.position]?.order ?? 9;
      if (orderA !== orderB) return orderA - orderB;
      return (a.number ?? 99) - (b.number ?? 99);
    });

    return players;
  }, [squad, filter, search]);

  // Group by position for display
  const grouped = useMemo(() => {
    if (filter !== "Alle") return null; // flat list when filtered
    const groups: Record<string, SquadPlayer[]> = {};
    filteredPlayers.forEach((p) => {
      const key = p.position;
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    });
    return groups;
  }, [filteredPlayers, filter]);

  const positionOrder = ["Goalkeeper", "Defender", "Midfielder", "Attacker"];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-headline text-app-title tracking-tight text-foreground mb-1">Spelers</h2>
        <p className="text-app-small text-muted-foreground">
          AZ selectie {squad ? `— ${squad.players.length} spelers` : ""}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Zoek speler..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 bg-card border border-border rounded-lg text-app-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
        </div>
        <div className="flex gap-1.5">
          {POSITION_FILTERS.map((pos) => (
            <button
              key={pos}
              onClick={() => setFilter(pos)}
              className={cn(
                "h-9 px-3 rounded-lg text-app-small font-medium transition-colors",
                filter === pos
                  ? "bg-primary/15 text-primary border border-primary/30"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {pos === "Alle" ? "Alle" : POSITION_MAP[pos]?.label || pos}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-[82px] rounded-xl" />
          ))}
        </div>
      )}

      {/* Content */}
      {!isLoading && grouped && (
        <div className="space-y-6">
          {positionOrder.map((pos) => {
            const players = grouped[pos];
            if (!players?.length) return null;
            const meta = POSITION_MAP[pos];
            return (
              <div key={pos}>
                <div className="flex items-center gap-2 mb-3">
                  {meta && <meta.icon className="h-4 w-4 text-muted-foreground" />}
                  <h3 className="text-app-body font-semibold text-foreground">{meta?.label || pos}</h3>
                  <span className="text-app-small text-muted-foreground">({players.length})</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {players.map((p) => (
                    <PlayerCard key={p.id} player={p} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Filtered (flat) list */}
      {!isLoading && !grouped && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filteredPlayers.map((p) => (
            <PlayerCard key={p.id} player={p} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filteredPlayers.length === 0 && (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-app-body text-muted-foreground">Geen spelers gevonden</p>
        </div>
      )}
    </div>
  );
};

export default Spelers;
