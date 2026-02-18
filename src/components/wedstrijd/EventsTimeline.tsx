import { FixtureEvent } from "@/hooks/useFixtureEvents";
import { cn } from "@/lib/utils";

interface EventsTimelineProps {
  events: FixtureEvent[];
  homeTeamId: number;
}

const AZ_TEAM_ID = 201;

const eventIcon = (type: string, detail: string) => {
  if (type === "Goal" && detail === "Normal Goal") return "⚽";
  if (type === "Goal" && detail === "Own Goal") return "⚽🔴";
  if (type === "Goal" && detail === "Penalty") return "⚽(P)";
  if (type === "Goal" && detail === "Missed Penalty") return "❌(P)";
  if (type === "Card" && detail === "Yellow Card") return "🟡";
  if (type === "Card" && detail === "Red Card") return "🔴";
  if (type === "Card" && detail === "Second Yellow card") return "🟡🔴";
  if (type === "subst") return "🔄";
  if (type === "Var") return "📺";
  return "•";
};

export const EventsTimeline = ({ events, homeTeamId }: EventsTimelineProps) => {
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-8 text-app-body text-muted-foreground">
        Geen events beschikbaar voor deze wedstrijd
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Center line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border" />

      <div className="space-y-1">
        {events.map((event, index) => {
          const isHome = event.team.id === homeTeamId;
          const isAZ = event.team.id === AZ_TEAM_ID;
          const minute = event.time.extra
            ? `${event.time.elapsed}+${event.time.extra}'`
            : `${event.time.elapsed}'`;

          return (
            <div
              key={index}
              className={cn(
                "flex items-center gap-2",
                isHome ? "flex-row" : "flex-row-reverse"
              )}
            >
              {/* Event content */}
              <div className={cn(
                "flex-1 flex items-center gap-2 py-1.5 px-3 rounded-lg",
                isHome ? "justify-end text-right" : "justify-start text-left",
                isAZ && event.type === "Goal" && !event.detail.includes("Own") && "bg-primary/8"
              )}>
                <div className={cn("flex flex-col", isHome ? "items-end" : "items-start")}>
                  <span className="text-app-body text-foreground">
                    {event.player.name}
                    {event.type === "subst" && event.assist && (
                      <span className="text-muted-foreground text-app-small"> ← {event.assist.name}</span>
                    )}
                    {event.type === "Goal" && event.assist?.name && (
                      <span className="text-muted-foreground text-app-small"> ({event.assist.name})</span>
                    )}
                  </span>
                  <span className="text-app-tiny text-muted-foreground">
                    {event.detail === "Normal Goal" ? "Doelpunt" : 
                     event.detail === "Own Goal" ? "Eigen doelpunt" :
                     event.detail === "Penalty" ? "Strafschop" :
                     event.detail === "Yellow Card" ? "Gele kaart" :
                     event.detail === "Red Card" ? "Rode kaart" :
                     event.detail === "Second Yellow card" ? "Tweede geel" :
                     event.type === "subst" ? "Wissel" :
                     event.detail}
                  </span>
                </div>
              </div>

              {/* Minute badge (center) */}
              <div className="shrink-0 w-14 text-center z-10">
                <span className="text-app-tiny font-mono bg-card border border-border px-2 py-0.5 rounded-full text-muted-foreground">
                  {minute}
                </span>
              </div>

              {/* Spacer for other side */}
              <div className="flex-1" />
            </div>
          );
        })}
      </div>
    </div>
  );
};
