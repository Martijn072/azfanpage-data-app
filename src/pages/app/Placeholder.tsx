import { useLocation } from "react-router-dom";

const routeTitles: Record<string, string> = {
  "/wedstrijden": "Wedstrijden",
  "/voorbeschouwing": "Voorbeschouwing",
  "/nabeschouwing": "Nabeschouwing",
  "/competitie": "Competitie",
  "/spelers": "Spelers",
};

const Placeholder = () => {
  const location = useLocation();
  const title = routeTitles[location.pathname] || "Module";

  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <h2 className="font-headline text-app-title text-foreground mb-2">{title}</h2>
        <p className="text-app-body text-muted-foreground">Deze module wordt in een volgende fase gebouwd.</p>
      </div>
    </div>
  );
};

export default Placeholder;
