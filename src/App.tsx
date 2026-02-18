import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";

const Dashboard = lazy(() => import("./pages/app/Dashboard"));
const Wedstrijden = lazy(() => import("./pages/app/Wedstrijden"));
const WedstrijdDetail = lazy(() => import("./pages/app/WedstrijdDetail"));
const Placeholder = lazy(() => import("./pages/app/Placeholder"));

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
            <AppLayout>
              <Suspense fallback={<div className="animate-pulse h-64 bg-card rounded-xl" />}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/wedstrijden" element={<Wedstrijden />} />
                  <Route path="/wedstrijden/:id" element={<WedstrijdDetail />} />
                  <Route path="/voorbeschouwing" element={<Placeholder />} />
                  <Route path="/nabeschouwing" element={<Placeholder />} />
                  <Route path="/competitie" element={<Placeholder />} />
                  <Route path="/spelers" element={<Placeholder />} />
                  <Route path="*" element={<Dashboard />} />
                </Routes>
              </Suspense>
            </AppLayout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
