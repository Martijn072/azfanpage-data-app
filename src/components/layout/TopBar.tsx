import { useLocation } from "react-router-dom";

const routeNames: Record<string, string> = {
  "/": "Dashboard",
  "/wedstrijden": "Wedstrijden",
  "/voorbeschouwing": "Voorbeschouwing",
  "/nabeschouwing": "Nabeschouwing",
  "/competitie": "Competitie",
  "/spelers": "Spelers",
};

export const TopBar = () => {
  const location = useLocation();
  const currentRoute = routeNames[location.pathname] || "AZ Fanpage Data";

  return (
    <header className="h-14 border-b border-border bg-card flex items-center px-6 shrink-0">
      <h1 className="font-headline text-app-heading tracking-tight text-foreground">
        {currentRoute}
      </h1>
      <div className="ml-auto flex items-center gap-3">
        <span className="text-app-small text-muted-foreground">Redactie</span>
      </div>
    </header>
  );
};
