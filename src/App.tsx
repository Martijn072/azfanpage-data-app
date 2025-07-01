
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DarkModeProvider } from "./contexts/DarkModeContext";
import { AuthProvider } from "./hooks/useAuth";
import Index from "./pages/Index";
import News from "./pages/News";
import ArticleDetail from "./pages/ArticleDetail";
import AZProgramma from "./pages/AZProgramma";
import WedstrijdDetail from "./pages/WedstrijdDetail";
import Eredivisie from "./pages/Eredivisie";
import ConferenceLeague from "./pages/ConferenceLeague";
import SpelerStatistieken from "./pages/SpelerStatistieken";
import Notifications from "./pages/Notifications";
import Community from "./pages/Community";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DarkModeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/nieuws" element={<News />} />
                <Route path="/artikel/:id" element={<ArticleDetail />} />
                <Route path="/programma" element={<AZProgramma />} />
                <Route path="/wedstrijd/:id" element={<WedstrijdDetail />} />
                <Route path="/eredivisie" element={<Eredivisie />} />
                <Route path="/conference-league" element={<ConferenceLeague />} />
                <Route path="/spelers" element={<SpelerStatistieken />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/community" element={<Community />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </DarkModeProvider>
    </QueryClientProvider>
  );
}

export default App;
