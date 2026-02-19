import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { SeasonProvider } from "@/contexts/SeasonContext";

const Dashboard = lazy(() => import("./pages/app/Dashboard"));
const Wedstrijden = lazy(() => import("./pages/app/Wedstrijden"));
const WedstrijdDetail = lazy(() => import("./pages/app/WedstrijdDetail"));
const Voorbeschouwing = lazy(() => import("./pages/app/Voorbeschouwing"));
const Nabeschouwing = lazy(() => import("./pages/app/Nabeschouwing"));
const Competitie = lazy(() => import("./pages/app/Competitie"));
const Spelers = lazy(() => import("./pages/app/Spelers"));
const SpelerDetail = lazy(() => import("./pages/app/SpelerDetail"));
const Visuals = lazy(() => import("./pages/app/Visuals"));

// Embed widgets (no AppLayout)
const EmbedStandings = lazy(() => import("./pages/embed/EmbedStandings"));
const EmbedLastMatch = lazy(() => import("./pages/embed/EmbedLastMatch"));
const EmbedNextMatch = lazy(() => import("./pages/embed/EmbedNextMatch"));
const EmbedH2H = lazy(() => import("./pages/embed/EmbedH2H"));
const EmbedMatchStats = lazy(() => import("./pages/embed/EmbedMatchStats"));

const queryClient = new QueryClient();

function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SeasonProvider>
            <Suspense fallback={<div className="animate-pulse h-64 bg-card rounded-xl" />}>
              <Routes>
                {/* Embed routes - no AppLayout */}
                <Route path="/embed/standings" element={<EmbedStandings />} />
                <Route path="/embed/last-match" element={<EmbedLastMatch />} />
                <Route path="/embed/next-match" element={<EmbedNextMatch />} />
                <Route path="/embed/h2h" element={<EmbedH2H />} />
                <Route path="/embed/match-stats/:id" element={<EmbedMatchStats />} />

                {/* App routes - with AppLayout */}
                <Route path="*" element={
                  <AppLayout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/wedstrijden" element={<Wedstrijden />} />
                      <Route path="/wedstrijden/:id" element={<WedstrijdDetail />} />
                      <Route path="/voorbeschouwing" element={<Voorbeschouwing />} />
                      <Route path="/nabeschouwing" element={<Nabeschouwing />} />
                      <Route path="/competitie" element={<Competitie />} />
                      <Route path="/spelers" element={<Spelers />} />
                      <Route path="/spelers/:id" element={<SpelerDetail />} />
                      <Route path="/visuals" element={<Visuals />} />
                      <Route path="*" element={<Dashboard />} />
                    </Routes>
                  </AppLayout>
                } />
              </Routes>
            </Suspense>
          </SeasonProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
