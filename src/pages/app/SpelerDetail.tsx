import { useParams, useNavigate } from "react-router-dom";
import { usePlayerStatistics } from "@/hooks/usePlayerStatistics";
import { PlayerSeasonStats } from "@/types/footballApi";
import { ArrowLeft, Calendar, MapPin, Flag, Ruler, Weight, Shirt, Star, Goal as GoalIcon, Footprints, ShieldAlert, CreditCard, Target, Crosshair, Handshake, Swords, CircleDot, AlertTriangle } from "lucide-react";
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

const StatMini = ({ label, value }: { label: string; value: string | number | null }) => (
  <div className="text-center">
    <p className="font-mono text-lg font-bold text-foreground">{value ?? 0}</p>
    <p className="text-[11px] text-muted-foreground">{label}</p>
  </div>
);

const StatSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <h4 className="text-app-small font-semibold text-muted-foreground uppercase tracking-wider mb-2">{title}</h4>
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {children}
    </div>
  </div>
);

const LeagueStatsRow = ({ stats }: { stats: PlayerSeasonStats }) => {
  const g = stats.games;
  const goals = stats.goals;
  const cards = stats.cards;
  const subs = stats.substitutes;
  const shots = stats.shots;
  const passes = stats.passes;
  const tackles = stats.tackles;
  const duels = stats.duels;
  const dribbles = stats.dribbles;
  const fouls = stats.fouls;
  const penalty = stats.penalty;
  const rating = g.rating ? parseFloat(g.rating).toFixed(2) : null;

  const duelsWonPct = duels.total && duels.won ? Math.round((duels.won / duels.total) * 100) : null;
  const dribblesSuccessPct = dribbles.attempts && dribbles.success ? Math.round((dribbles.success / dribbles.attempts) * 100) : null;

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
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

      {/* Appearances & Minutes */}
      <StatSection title="Speeltijd">
        <StatMini label="Wedstrijden" value={g.appearences || 0} />
        <StatMini label="Basisplaatsen" value={g.lineups || 0} />
        <StatMini label="Minuten" value={g.minutes || 0} />
        <StatMini label="Invalbeurten" value={subs.in || 0} />
        <StatMini label="Gewisseld" value={subs.out || 0} />
        <StatMini label="Op de bank" value={subs.bench || 0} />
      </StatSection>

      {/* Goals & Scoring */}
      <StatSection title="Doelpunten & assists">
        <StatMini label="Goals" value={goals.total || 0} />
        <StatMini label="Assists" value={goals.assists || 0} />
        <StatMini label="Tegendoelpunten" value={goals.conceded ?? 0} />
        <StatMini label="Reddingen" value={goals.saves ?? 0} />
      </StatSection>

      {/* Shots */}
      <StatSection title="Schoten">
        <StatMini label="Schoten totaal" value={shots.total ?? 0} />
        <StatMini label="Op doel" value={shots.on ?? 0} />
      </StatSection>

      {/* Passes */}
      <StatSection title="Passes">
        <StatMini label="Passes totaal" value={passes.total ?? 0} />
        <StatMini label="Key passes" value={passes.key ?? 0} />
        <StatMini label="Nauwkeurigheid" value={passes.accuracy != null ? `${passes.accuracy}%` : "–"} />
      </StatSection>

      {/* Defensive */}
      <StatSection title="Verdedigend">
        <StatMini label="Tackles" value={tackles.total ?? 0} />
        <StatMini label="Blocks" value={tackles.blocks ?? 0} />
        <StatMini label="Intercepties" value={tackles.interceptions ?? 0} />
      </StatSection>

      {/* Duels */}
      <StatSection title="Duels">
        <StatMini label="Duels totaal" value={duels.total ?? 0} />
        <StatMini label="Duels gewonnen" value={duels.won ?? 0} />
        <StatMini label="Duel %" value={duelsWonPct != null ? `${duelsWonPct}%` : "–"} />
      </StatSection>

      {/* Dribbles */}
      <StatSection title="Dribbels">
        <StatMini label="Pogingen" value={dribbles.attempts ?? 0} />
        <StatMini label="Geslaagd" value={dribbles.success ?? 0} />
        <StatMini label="Dribbel %" value={dribblesSuccessPct != null ? `${dribblesSuccessPct}%` : "–"} />
        <StatMini label="Voorbij gedribbeld" value={dribbles.past ?? 0} />
      </StatSection>

      {/* Fouls & Cards */}
      <StatSection title="Overtredingen & kaarten">
        <StatMini label="Overtredingen" value={fouls.committed ?? 0} />
        <StatMini label="Overtr. verkregen" value={fouls.drawn ?? 0} />
        <div className="flex items-center justify-center gap-3">
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-3.5 rounded-sm bg-amber-400" />
            <span className="font-mono text-sm text-foreground">{cards.yellow}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-3.5 rounded-sm bg-amber-600" />
            <span className="font-mono text-sm text-foreground">{cards.yellowred}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-3.5 rounded-sm bg-red-500" />
            <span className="font-mono text-sm text-foreground">{cards.red}</span>
          </span>
        </div>
      </StatSection>

      {/* Penalties */}
      {(penalty.won || penalty.scored || penalty.missed || penalty.saved || penalty.commited) ? (
        <StatSection title="Penalty's">
          <StatMini label="Gewonnen" value={penalty.won ?? 0} />
          <StatMini label="Gescoord" value={penalty.scored ?? 0} />
          <StatMini label="Gemist" value={penalty.missed ?? 0} />
          <StatMini label="Gestopt" value={penalty.saved ?? 0} />
          <StatMini label="Veroorzaakt" value={penalty.commited ?? 0} />
        </StatSection>
      ) : null}
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
  const filteredStats = statistics.filter(s => s.league.name !== "Friendlies" && s.league.name !== "Club Friendlies");

  // Aggregate totals across all competitions
  const totals = filteredStats.reduce(
    (acc, s) => ({
      appearances: acc.appearances + (s.games.appearences || 0),
      goals: acc.goals + (s.goals.total || 0),
      assists: acc.assists + (s.goals.assists || 0),
      minutes: acc.minutes + (s.games.minutes || 0),
      shots: acc.shots + (s.shots.total || 0),
      shotsOn: acc.shotsOn + (s.shots.on || 0),
      passes: acc.passes + (s.passes.total || 0),
      keyPasses: acc.keyPasses + (s.passes.key || 0),
      tackles: acc.tackles + (s.tackles.total || 0),
      interceptions: acc.interceptions + (s.tackles.interceptions || 0),
      duelsWon: acc.duelsWon + (s.duels.won || 0),
      duelsTotal: acc.duelsTotal + (s.duels.total || 0),
      dribblesSuccess: acc.dribblesSuccess + (s.dribbles.success || 0),
      dribblesAttempts: acc.dribblesAttempts + (s.dribbles.attempts || 0),
      yellow: acc.yellow + (s.cards.yellow || 0),
      red: acc.red + (s.cards.red || 0),
    }),
    { appearances: 0, goals: 0, assists: 0, minutes: 0, shots: 0, shotsOn: 0, passes: 0, keyPasses: 0, tackles: 0, interceptions: 0, duelsWon: 0, duelsTotal: 0, dribblesSuccess: 0, dribblesAttempts: 0, yellow: 0, red: 0 }
  );

  const duelPct = totals.duelsTotal > 0 ? Math.round((totals.duelsWon / totals.duelsTotal) * 100) : null;
  const dribblePct = totals.dribblesAttempts > 0 ? Math.round((totals.dribblesSuccess / totals.dribblesAttempts) * 100) : null;

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

      {/* Season totals - expanded */}
      <div>
        <h3 className="text-app-body font-semibold text-foreground mb-3">Seizoenstotalen</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <StatBox label="Wedstrijden" value={totals.appearances} />
          <StatBox label="Goals" value={totals.goals} />
          <StatBox label="Assists" value={totals.assists} />
          <StatBox label="Minuten" value={totals.minutes.toLocaleString()} />
          <StatBox label="Schoten" value={totals.shots} sub={`${totals.shotsOn} op doel`} />
          <StatBox label="Key passes" value={totals.keyPasses} sub={`${totals.passes} totaal`} />
          <StatBox label="Tackles" value={totals.tackles} sub={`${totals.interceptions} intercepties`} />
          <StatBox label="Duels gewonnen" value={totals.duelsWon} sub={duelPct != null ? `${duelPct}% van ${totals.duelsTotal}` : undefined} />
          <StatBox label="Dribbels" value={totals.dribblesSuccess} sub={dribblePct != null ? `${dribblePct}% geslaagd` : undefined} />
          <StatBox label="Gele kaarten" value={totals.yellow} />
          <StatBox label="Rode kaarten" value={totals.red} />
          <StatBox label="Passes totaal" value={totals.passes.toLocaleString()} />
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
