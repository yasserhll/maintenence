import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SiteProvider } from "./context/SiteContext";
import { AppDataProvider } from "./context/AppDataContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Index from "./pages/Index";
import Stock from "./pages/Stock";
import Entrees from "./pages/Entrees";
import Sorties from "./pages/Sorties";
import Inventaire from "./pages/Inventaire";
import Admin from "./pages/Admin";
import Profil from "./pages/Profil";

const queryClient = new QueryClient();

function ProtectedApp() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-slate-600 border-t-white rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    // SiteProvider AVANT AppDataProvider — AppData a besoin du site actif
    <SiteProvider>
      <AppDataProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/"           element={<Index />} />
            <Route path="/stock"      element={<Stock />} />
            <Route path="/entrees"    element={<Entrees />} />
            <Route path="/sorties"    element={<Sorties />} />
            <Route path="/inventaire" element={<Inventaire />} />
            <Route path="/profil"     element={<Profil />} />
            <Route path="/admin" element={
              user.role === 'admin' || user.role === 'superadmin'
                ? <Admin />
                : <Navigate to="/" replace />
            } />
          </Route>
        </Routes>
      </AppDataProvider>
    </SiteProvider>
  );
}

function LoginRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <Login />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginRedirect />} />
            <Route path="/*"    element={<ProtectedApp />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
