import { useParams, useNavigate } from "react-router-dom";
import { usePlayerStatistics } from "@/hooks/usePlayerStatistics";
import { PlayerSeasonStats } from "@/types/footballApi";
import { ArrowLeft, Calendar, MapPin, Flag, Ruler, Weight, Shirt, Star, Goal as GoalIcon, Footprints, ShieldAlert, CreditCard } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getOverriddenPosition } from "@/utils/positionOverrides";

const StatBox = ({ label, value, sub }: { label: string; value: string | number; sub?: string }) => (
  <div className="bg-card border border-border rounded-xl p-4 text-center">
    <p className="font-mono text-2xl font-bold text-foreground">{value}</p>
    <p className="text-app-small text-muted-foreground mt-1">{label}</p>
    {sub && <p className="text-[11px] text-muted-foreground/60 mt-0.5">{sub}</p>}
  </div>
);

const LeagueStatsRow = ({ stats }: { stats: PlayerSeasonStats }) => {
  const g = stats.games;
  const goals = stats.goals;
  const cards = stats.cards;
  const rating = g.rating ? parseFloat(g.rating).toFixed(2) : null;

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center gap-3 mb-4">
        <img src={stats.league.logo} alt={stats.league.name} className="h-6 w-6" />
        <div className="flex-1 min-w-0">
          <h4 className="text-app-body font-semibold text-foreground truncate">{stats.league.name}</h4>
          <p className="text-app-small text-muted-foreground">{stats.league.season}/{stats.league.season + 1}</p>
        </div>
        {rating && (
          <span className={cn(
            "font-mono text-app-body font-bold px-2 py-0.5 rounded",
            parseFloat(rating) >= 7.5 ? "bg-emerald-500/15 text-emerald-400" :
            parseFloat(rating) >= 6.5 ? "bg-amber-500/15 text-amber-400" :
            "bg-red-500/15 text-red-400"
          )}>
            {rating}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-center">
        <div>
          <p className="font-mono text-lg font-bold text-foreground">{g.appearences || 0}</p>
          <p className="text-[11px] text-muted-foreground">Wedstrijden</p>
        </div>
        <div>
          <p className="font-mono text-lg font-bold text-foreground">{g.lineups || 0}</p>
          <p className="text-[11px] text-muted-foreground">Basisplaatsen</p>
        </div>
        <div>
          <p className="font-mono text-lg font-bold text-foreground">{g.minutes || 0}</p>
          <p className="text-[11px] text-muted-foreground">Minuten</p>
        </div>
        <div>
          <p className="font-mono text-lg font-bold text-foreground">{goals.total || 0}</p>
          <p className="text-[11px] text-muted-foreground">Goals</p>
        </div>
        <div>
          <p className="font-mono text-lg font-bold text-foreground">{goals.assists || 0}</p>
          <p className="text-[11px] text-muted-foreground">Assists</p>
        </div>
        <div className="flex items-center justify-center gap-2">
          <span className="flex items-center gap-0.5">
            <span className="inline-block w-2.5 h-3.5 rounded-sm bg-amber-400" />
            <span className="font-mono text-sm text-foreground">{cards.yellow}</span>
          </span>
          <span className="flex items-center gap-0.5">
            <span className="inline-block w-2.5 h-3.5 rounded-sm bg-red-500" />
            <span className="font-mono text-sm text-foreground">{cards.red}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

const SpelerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const playerId = id ? parseInt(id) : null;
  const { data, isLoading } = usePlayerStatistics(playerId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-6">
          <Skeleton className="h-32 w-32 rounded-full" />
          <div className="space-y-3 flex-1">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-52" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <button onClick={() => navigate("/spelers")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Terug naar selectie
        </button>
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <p className="text-app-body text-muted-foreground">Speler niet gevonden</p>
        </div>
      </div>
    );
  }

  const { player, statistics } = data;
  // Filter out friendly matches
  const filteredStats = statistics.filter(s => s.league.name !== "Friendlies" && s.league.name !== "Club Friendlies");

  // Aggregate totals across all competitions
  const totals = filteredStats.reduce(
    (acc, s) => ({
      appearances: acc.appearances + (s.games.appearences || 0),
      goals: acc.goals + (s.goals.total || 0),
      assists: acc.assists + (s.goals.assists || 0),
      minutes: acc.minutes + (s.games.minutes || 0),
    }),
    { appearances: 0, goals: 0, assists: 0, minutes: 0 }
  );

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button onClick={() => navigate("/spelers")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-app-body">
        <ArrowLeft className="h-4 w-4" /> Terug naar selectie
      </button>

      {/* Player header */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <img
            src={player.photo}
            alt={player.name}
            className="h-28 w-28 rounded-full object-cover border-4 border-border bg-muted"
          />
          <div className="text-center sm:text-left flex-1">
            <h2 className="font-headline text-app-title tracking-tight text-foreground">
              {player.firstname} {player.lastname}
            </h2>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2 text-app-small text-muted-foreground">
              {filteredStats[0]?.games.position && (
                <span className="bg-primary/15 text-primary px-2 py-0.5 rounded-full font-semibold text-[11px] uppercase tracking-wider">
                  {getOverriddenPosition(player.name, filteredStats[0].games.position)}
                </span>
              )}
              {filteredStats[0]?.games.number && (
                <span className="flex items-center gap-1"><Shirt className="h-3.5 w-3.5" /> #{filteredStats[0].games.number}</span>
              )}
              <span className="flex items-center gap-1"><Flag className="h-3.5 w-3.5" /> {player.nationality}</span>
              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {player.age} jaar</span>
              {player.height && <span className="flex items-center gap-1"><Ruler className="h-3.5 w-3.5" /> {player.height}</span>}
              {player.weight && <span className="flex items-center gap-1"><Weight className="h-3.5 w-3.5" /> {player.weight}</span>}
              {player.birth?.place && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {player.birth.place}, {player.birth.country}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Season totals */}
      <div>
        <h3 className="text-app-body font-semibold text-foreground mb-3">Seizoenstotalen</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatBox label="Wedstrijden" value={totals.appearances} />
          <StatBox label="Goals" value={totals.goals} />
          <StatBox label="Assists" value={totals.assists} />
          <StatBox label="Minuten" value={totals.minutes.toLocaleString()} />
        </div>
      </div>

      {/* Per competition */}
      {filteredStats.length > 0 && (
        <div>
          <h3 className="text-app-body font-semibold text-foreground mb-3">Per competitie</h3>
          <div className="space-y-3">
            {filteredStats.map((s, i) => (
              <LeagueStatsRow key={i} stats={s} />
            ))}
          </div>
        </div>
      )}

      {filteredStats.length === 0 && (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <p className="text-app-body text-muted-foreground">Geen statistieken beschikbaar voor dit seizoen</p>
        </div>
      )}
    </div>
  );
};

export default SpelerDetail;
