import { Package, ArrowDownToLine, ArrowUpFromLine, AlertTriangle } from 'lucide-react';
import StatCard from '../components/StatCard';
import { useAppData } from '../context/AppDataContext';
import { useSite } from '../context/SiteContext';
import { useAuth } from '../context/AuthContext';

export default function Index() {
  const { dashboard, loading, error } = useAppData();
  const { activeSite } = useSite();
  const { user, isSuperAdmin } = useAuth();
  const siteNom = isSuperAdmin ? (activeSite?.nom ?? 'Tous les sites') : (user?.site?.nom ?? 'Mon site');

  if (loading) return <Skeleton />;
  if (error)   return <div className="p-6 text-destructive">Erreur : {error}</div>;
  if (!dashboard) return null;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground text-sm mt-1">Gestion de maintenance — <span className="font-medium text-foreground">{siteNom}</span></p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Références en stock"  value={dashboard.total_articles}     icon={Package}         variant="primary" />
        <StatCard title="Qté totale entrées"   value={dashboard.total_entrees_qty}  icon={ArrowDownToLine} variant="success" />
        <StatCard title="Qté totale sorties"   value={dashboard.total_sorties_qty}  icon={ArrowUpFromLine} variant="warning" />
        <StatCard title="Alertes stock min"    value={dashboard.nb_alertes}         icon={AlertTriangle}   variant="destructive" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg border shadow-sm">
          <div className="p-4 border-b"><h2 className="font-semibold">Derniers mouvements</h2></div>
          <div className="divide-y max-h-80 overflow-auto">
            {dashboard.derniers_mouvements.map((m, i) => (
              <div key={i} className="p-3 flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${m.type === 'entree' ? 'bg-green-500' : 'bg-red-500'}`} />
                  <div>
                    <p className="font-medium">{m.designation}</p>
                    <p className="text-xs text-muted-foreground">{m.date}{m.detail ? ` • ${m.detail}` : ''}</p>
                  </div>
                </div>
                <span className={`font-mono font-bold ${m.type === 'entree' ? 'text-green-600' : 'text-red-600'}`}>
                  {m.type === 'entree' ? '+' : '-'}{m.quantite}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-lg border shadow-sm">
          <div className="p-4 border-b"><h2 className="font-semibold">Alertes stock minimum</h2></div>
          <div className="divide-y max-h-80 overflow-auto">
            {dashboard.alertes.length === 0
              ? <p className="p-4 text-sm text-muted-foreground">Aucune alerte.</p>
              : dashboard.alertes.map(a => (
                <div key={a.id} className="p-3 flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{a.designation}</p>
                    <p className="text-xs text-muted-foreground">{a.reference}{a.marque ? ` • ${a.marque}` : ''} • Min: {a.stock_min}</p>
                  </div>
                  <span className="font-mono font-bold text-destructive">{a.stock_actuel}</span>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg border shadow-sm">
        <div className="p-4 border-b"><h2 className="font-semibold">Top 5 pièces consommées</h2></div>
        <div className="divide-y">
          {dashboard.top5_sorties.map((t, i) => (
            <div key={i} className="p-3 flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">{i+1}</span>
                <div>
                  <p className="font-medium">{t.designation}</p>
                  {t.marque && <p className="text-xs text-muted-foreground">{t.marque}</p>}
                </div>
              </div>
              <span className="font-mono font-bold text-red-600">{t.total_qty} unités</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-muted rounded" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-lg" />)}
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="h-64 bg-muted rounded-lg" />
        <div className="h-64 bg-muted rounded-lg" />
      </div>
    </div>
  );
}
