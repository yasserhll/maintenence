import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppDataProvider } from "./context/AppDataContext";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Stock from "./pages/Stock";
import Entrees from "./pages/Entrees";
import Sorties from "./pages/Sorties";
import Inventaire from "./pages/Inventaire";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/* AppDataProvider charge TOUTES les données une seule fois au démarrage */}
      {/* Ensuite chaque page lit depuis le cache — affichage instantané */}
      <AppDataProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/"           element={<Index />} />
              <Route path="/stock"      element={<Stock />} />
              <Route path="/entrees"    element={<Entrees />} />
              <Route path="/sorties"    element={<Sorties />} />
              <Route path="/inventaire" element={<Inventaire />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppDataProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
