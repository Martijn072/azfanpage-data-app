import { cn } from "@/lib/utils";
import { TeamStatistics } from "@/types/footballApi";
import { FixtureEvent } from "@/hooks/useFixtureEvents";
import { useMemo } from "react";
import { Gauge, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MatchVerdictProps {
  azGoals: number;
  oppGoals: number;
  opponentName: string;
  isAZHome: boolean;
  stats: TeamStatistics[] | null;
  events: FixtureEvent[] | null;
  halftimeAZ: number | null;
  halftimeOpp: number | null;
}

const AZ_TEAM_ID = 201;

const getStat = (teamStats: TeamStatistics, type: string): number => {
  const s = teamStats.statistics.find(s => s.type === type);
  if (!s || s.value === null || s.value === undefined) return 0;
  return parseFloat(String(s.value).replace("%", "")) || 0;
};

interface VerdictDimension {
  label: string;
  azValue: number;
  oppValue: number;
  azScore: number; // 0-100
  description: string;
}

export const MatchVerdict = ({
  azGoals,
  oppGoals,
  opponentName,
  isAZHome,
  stats,
  events,
  halftimeAZ,
  halftimeOpp,
}: MatchVerdictProps) => {
  const verdict = useMemo(() => {
    if (!stats || stats.length < 2) return null;

    const azStats = stats.find(s => s.team.id === AZ_TEAM_ID);
    const oppStats = stats.find(s => s.team.id !== AZ_TEAM_ID);
    if (!azStats || !oppStats) return null;

    const dimensions: VerdictDimension[] = [];

    // 1. Dominantie (balbezit + passes)
    const azPoss = getStat(azStats, "Ball Possession");
    const oppPoss = getStat(oppStats, "Ball Possession");
    const azPassAcc = getStat(azStats, "Passes %");
    const dominanceScore = Math.min(100, Math.max(0, (azPoss / (azPoss + oppPoss || 1)) * 100 * 0.7 + azPassAcc * 0.3));
    dimensions.push({
      label: "Dominantie",
      azValue: azPoss,
      oppValue: oppPoss,
      azScore: Math.round(dominanceScore),
      description: azPoss >= 55 ? "AZ controleerde de wedstrijd" : azPoss <= 45 ? `${opponentName} had het overwicht` : "Gelijkwaardig balbezit",
    });

    // 2. Dreiging (schoten, schoten op doel)
    const azShots = getStat(azStats, "Total Shots");
    const oppShots = getStat(oppStats, "Total Shots");
    const azOnTarget = getStat(azStats, "Shots on Goal");
    const oppOnTarget = getStat(oppStats, "Shots on Goal");
    const threatScore = Math.min(100, Math.max(0, ((azShots + azOnTarget * 2) / ((azShots + azOnTarget * 2) + (oppShots + oppOnTarget * 2) || 1)) * 100));
    dimensions.push({
      label: "Dreiging",
      azValue: azShots,
      oppValue: oppShots,
      azScore: Math.round(threatScore),
      description: threatScore >= 60 ? "AZ was dreigender" : threatScore <= 40 ? `${opponentName} creëerde meer kansen` : "Vergelijkbaar gevaar",
    });

    // 3. Efficiëntie (goals vs xG of shots on target)
    const azXG = getStat(azStats, "expected_goals");
    const oppXG = getStat(oppStats, "expected_goals");
    let efficiencyScore: number;
    let effDesc: string;
    if (azXG > 0 || oppXG > 0) {
      const azEff = azXG > 0 ? (azGoals / azXG) : 1;
      efficiencyScore = Math.min(100, Math.max(0, azEff * 50));
      const diff = azGoals - azXG;
      effDesc = diff > 0.5 ? `Boven verwachting gescoord (+${diff.toFixed(1)} vs xG)` : diff < -0.5 ? `Onder verwachting gebleven (${diff.toFixed(1)} vs xG)` : "Conform verwachting gescoord";
    } else {
      const conversionAZ = azOnTarget > 0 ? (azGoals / azOnTarget) * 100 : 0;
      efficiencyScore = Math.min(100, conversionAZ);
      effDesc = conversionAZ >= 50 ? "Hoge conversie" : conversionAZ > 0 ? "Matige conversie" : "Niet gescoord";
    }
    dimensions.push({
      label: "Efficiëntie",
      azValue: azGoals,
      oppValue: oppGoals,
      azScore: Math.round(efficiencyScore),
      description: effDesc,
    });

    // 4. Defensief (schoten tegen, xG tegen)
    const defScore = Math.min(100, Math.max(0, ((oppShots > 0 ? (1 - oppOnTarget / oppShots) : 1) * 50 + (oppGoals === 0 ? 50 : oppGoals === 1 ? 30 : 10))));
    dimensions.push({
      label: "Defensief",
      azValue: oppOnTarget,
      oppValue: oppShots,
      azScore: Math.round(defScore),
      description: oppGoals === 0 ? "Clean sheet!" : oppOnTarget <= 2 ? "Tegenstander nauwelijks dreigend" : `${oppOnTarget} schoten op doel tegen`,
    });

    // Overall score
    const overall = Math.round(dimensions.reduce((sum, d) => sum + d.azScore, 0) / dimensions.length);

    // Verdict text
    let verdictText: string;
    let verdictTone: "success" | "warning" | "danger";
    if (azGoals > oppGoals) {
      if (overall >= 65) { verdictText = "Overtuigende overwinning"; verdictTone = "success"; }
      else if (overall >= 50) { verdictText = "Verdiende zege"; verdictTone = "success"; }
      else { verdictText = "Geflatteerde overwinning"; verdictTone = "warning"; }
    } else if (azGoals < oppGoals) {
      if (overall >= 55) { verdictText = "Ongelukkige nederlaag"; verdictTone = "warning"; }
      else if (overall >= 40) { verdictText = "Terechte nederlaag"; verdictTone = "danger"; }
      else { verdictText = "Kansloos verloren"; verdictTone = "danger"; }
    } else {
      if (overall >= 60) { verdictText = "Puntverlies"; verdictTone = "warning"; }
      else if (overall >= 40) { verdictText = "Terecht gelijkspel"; verdictTone = "warning"; }
      else { verdictText = "Gelukkig punt"; verdictTone = "success"; }
    }

    // Comeback or collapse detection
    let narrative: string | null = null;
    if (halftimeAZ !== null && halftimeOpp !== null) {
      if (halftimeAZ < halftimeOpp && azGoals > oppGoals) narrative = "Sterke comeback na achterstand bij rust";
      else if (halftimeAZ > halftimeOpp && azGoals <= oppGoals) narrative = "Voorsprong bij rust weggegeven";
    }

    // Late goal detection
    if (events) {
      const lateAZGoals = events.filter(e => e.type === "Goal" && e.team.id === AZ_TEAM_ID && e.time.elapsed >= 85 && e.detail !== "Missed Penalty");
      if (lateAZGoals.length > 0 && azGoals > oppGoals) {
        narrative = narrative || `Beslissing viel laat (${lateAZGoals[0].time.elapsed}')`;
      }
    }

    return { dimensions, overall, verdictText, verdictTone, narrative };
  }, [stats, events, azGoals, oppGoals, opponentName, halftimeAZ, halftimeOpp]);

  if (!verdict) return null;

  const toneStyles = {
    success: "border-success/30 bg-success/5",
    warning: "border-warning/30 bg-warning/5",
    danger: "border-danger/30 bg-danger/5",
  };
  const toneBadge = {
    success: "bg-success/15 text-success",
    warning: "bg-warning/15 text-warning",
    danger: "bg-danger/15 text-danger",
  };

  return (
    <div className={cn("border rounded-xl p-5", toneStyles[verdict.verdictTone])}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Gauge className="h-4 w-4 text-foreground" />
          <h3 className="text-app-body-strong text-foreground">Wedstrijdverdikt</h3>
        </div>
        <span className={cn("text-app-small font-bold px-3 py-1 rounded-full", toneBadge[verdict.verdictTone])}>
          {verdict.verdictText}
        </span>
      </div>

      {verdict.narrative && (
        <p className="text-app-small text-muted-foreground mb-4 italic">{verdict.narrative}</p>
      )}

      {/* Overall score */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              verdict.overall >= 60 ? "bg-success" : verdict.overall >= 40 ? "bg-warning" : "bg-danger"
            )}
            style={{ width: `${verdict.overall}%` }}
          />
        </div>
        <span className="font-mono text-app-body-strong text-foreground w-10 text-right">{verdict.overall}</span>
      </div>

      {/* Dimensions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {verdict.dimensions.map((dim) => {
          const Icon = dim.azScore >= 55 ? TrendingUp : dim.azScore <= 45 ? TrendingDown : Minus;
          const iconColor = dim.azScore >= 55 ? "text-success" : dim.azScore <= 45 ? "text-danger" : "text-warning";
          return (
            <div key={dim.label} className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Icon className={cn("h-3 w-3", iconColor)} />
                <span className="text-app-tiny font-medium text-foreground uppercase tracking-wider">{dim.label}</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full",
                    dim.azScore >= 55 ? "bg-success/70" : dim.azScore <= 45 ? "bg-danger/70" : "bg-warning/70"
                  )}
                  style={{ width: `${dim.azScore}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground leading-tight">{dim.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
