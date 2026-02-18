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
            <AppLayout>
              <Suspense fallback={<div className="animate-pulse h-64 bg-card rounded-xl" />}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/wedstrijden" element={<Wedstrijden />} />
                  <Route path="/wedstrijden/:id" element={<WedstrijdDetail />} />
                  <Route path="/voorbeschouwing" element={<Voorbeschouwing />} />
                  <Route path="/nabeschouwing" element={<Nabeschouwing />} />
                  <Route path="/competitie" element={<Competitie />} />
                  <Route path="/spelers" element={<Spelers />} />
                  <Route path="/spelers/:id" element={<SpelerDetail />} />
                  <Route path="*" element={<Dashboard />} />
                </Routes>
              </Suspense>
            </AppLayout>
          </SeasonProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
