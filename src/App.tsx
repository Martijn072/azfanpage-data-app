import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DarkModeProvider } from "@/contexts/DarkModeContext";
import { WordPressAuthProvider } from "@/contexts/WordPressAuthContext";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import Index from "./pages/Index";
import News from "./pages/News";
import NotFound from "./pages/NotFound";

// Lazy loaded pages
const ArticleDetail = lazy(() => import('./pages/ArticleDetail'));
const SpelerProfiel = lazy(() => import('./pages/SpelerProfiel'));
const SpelerStatistieken = lazy(() => import('./pages/SpelerStatistieken'));
const Standen = lazy(() => import('./pages/Standen'));
const Wedstrijden = lazy(() => import('./pages/Wedstrijden'));
const TeamDetail = lazy(() => import('./pages/TeamDetail'));
const WedstrijdDetail = lazy(() => import('./pages/WedstrijdDetail'));
const Forum = lazy(() => import('./pages/Forum'));
const Over = lazy(() => import('./pages/Over'));
const Auth = lazy(() => import('./pages/Auth').then(m => ({ default: m.Auth })));
const Notifications = lazy(() => import('./pages/Notifications'));
const NotificationSettings = lazy(() => import('./pages/NotificationSettings'));

const queryClient = new QueryClient();

function App() {
  return (
    <DarkModeProvider>
      <WordPressAuthProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={<PageSkeleton />}>
                <Routes>
                  {/* Home */}
                  <Route path="/" element={<Index />} />
                  
                  {/* Nieuws */}
                  <Route path="/nieuws" element={<News />} />
                  <Route path="/news" element={<Navigate to="/nieuws" replace />} />
                  <Route path="/artikel/:id" element={<ArticleDetail />} />
                  
                  {/* Wedstrijden */}
                  <Route path="/wedstrijden" element={<Wedstrijden />} />
                  <Route path="/programma" element={<Navigate to="/wedstrijden" replace />} />
                  <Route path="/wedstrijd/:fixtureId" element={<WedstrijdDetail />} />
                  
                  {/* Standen */}
                  <Route path="/standen" element={<Standen />} />
                  <Route path="/eredivisie" element={<Navigate to="/standen?tab=eredivisie" replace />} />
                  <Route path="/conference-league" element={<Navigate to="/standen?tab=europa" replace />} />
                  <Route path="/jong-az" element={<Navigate to="/standen?tab=jong-az" replace />} />
                  
                  {/* Selectie */}
                  <Route path="/selectie" element={<SpelerStatistieken />} />
                  <Route path="/spelers" element={<Navigate to="/selectie" replace />} />
                  <Route path="/selectie/:playerId" element={<SpelerProfiel />} />
                  <Route path="/speler/:playerId" element={<SpelerProfiel />} />
                  
                  {/* Overig */}
                  <Route path="/forum" element={<Forum />} />
                  <Route path="/over" element={<Over />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/notification-settings" element={<NotificationSettings />} />
                  <Route path="/team/:teamId" element={<TeamDetail />} />
                  
                  {/* 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </WordPressAuthProvider>
    </DarkModeProvider>
  );
}

export default App;
