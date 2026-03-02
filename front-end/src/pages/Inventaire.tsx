import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSite } from '../context/SiteContext';
import { inventaireApi } from '../api/inventaire';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Save, RefreshCw, FileSpreadsheet, FileText } from 'lucide-react';
import { exportExcel, exportPDF } from '../lib/exportInventaire';
import type { LigneInventaire, Inventaire as InvType } from '../types/stock';

interface LigneEditable extends LigneInventaire {
  stock_trouve_local: number;
  obs_local: string;
  modifie: boolean;
}

export default function Inventaire() {
  const { user, isSuperAdmin } = useAuth();
  const { activeSiteId, activeSite } = useSite();

  const [inventaire, setInventaire] = useState<InvType | null>(null);
  const [lignes, setLignes]         = useState<LigneEditable[]>([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [recalculating, setRecalc]  = useState(false);
  const [saved, setSaved]           = useState(false);
  const [error, setError]           = useState<string | null>(null);

  // Détermine le site à utiliser
  const siteId  = activeSiteId ?? user?.site_id ?? null;
  const siteNom = isSuperAdmin ? (activeSite?.nom ?? 'Site') : (user?.site?.nom ?? 'Mon site');

  // Recharger quand le site change
  useEffect(() => {
    if (siteId !== null) loadInventaire();
  }, [siteId]);

  const toEditable = (inv: InvType): LigneEditable[] =>
    inv.lignes.map(l => ({
      ...l,
      stock_trouve_local: l.stock_trouve ?? 0,
      obs_local:          l.observation ?? '',
      modifie:            false,
    }));

  const loadInventaire = async () => {
    try {
      setLoading(true);
      setError(null);
      const inv = await inventaireApi.get(siteId ?? undefined);
      setInventaire(inv);
      setLignes(toEditable(inv));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const updateTrouve = (idx: number, val: number) => {
    setLignes(prev => prev.map((l, i) =>
      i === idx ? { ...l, stock_trouve_local: val, modifie: true } : l
    ));
    setSaved(false);
  };

  const handleSave = async () => {
    const modifiees = lignes.filter(l => l.modifie);
    if (modifiees.length === 0) return;
    setSaving(true);
    try {
      await inventaireApi.saveTrouves(
        modifiees.map(l => ({ id: l.id, stock_trouve: l.stock_trouve_local, observation: l.obs_local })),
        siteId ?? undefined
      );
      setLignes(prev => prev.map(l => ({ ...l, modifie: false })));
      setSaved(true);
    } finally { setSaving(false); }
  };

  const handleRecalculer = async () => {
    setRecalc(true);
    try {
      const inv = await inventaireApi.recalculer(siteId ?? undefined);
      setInventaire(inv);
      setLignes(toEditable(inv));
      setSaved(false);
    } finally { setRecalc(false); }
  };

  const nbModifies      = lignes.filter(l => l.modifie).length;
  const nbSaisis        = lignes.filter(l => l.stock_trouve !== null).length;
  const lignesAvecEcart = lignes.filter(l => l.stock_trouve !== null && l.stock_trouve_local !== l.stock_theorique);
  const totalEcartAbs   = lignesAvecEcart.reduce((s, l) => s + Math.abs(l.stock_trouve_local - l.stock_theorique), 0);

  if (loading) return <Skeleton />;
  if (error)   return <div className="p-6 text-destructive">Erreur : {error}</div>;

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Inventaire du stock</h1>
          <p className="text-muted-foreground text-sm">
            <span className="font-medium text-foreground">{siteNom}</span>
            {' — '}Créé le {inventaire?.date_creation}
            {inventaire?.derniere_maj && (
              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                ✓ Mis à jour : {new Date(inventaire.derniere_maj).toLocaleString('fr-FR')}
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm"
            onClick={() => inventaire && exportExcel(inventaire, lignes.map(l => ({ ligne: l, stock_trouve_local: l.stock_trouve_local })))}
            className="border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400">
            <FileSpreadsheet className="w-4 h-4 mr-1.5" />Excel
          </Button>
          <Button variant="outline" size="sm"
            onClick={() => inventaire && exportPDF(inventaire, lignes.map(l => ({ ligne: l, stock_trouve_local: l.stock_trouve_local })))}
            className="border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400">
            <FileText className="w-4 h-4 mr-1.5" />PDF
          </Button>
          <div className="w-px bg-border mx-1" />
          <Button variant="outline" onClick={handleRecalculer} disabled={recalculating} size="sm">
            <RefreshCw className={`w-4 h-4 mr-2 ${recalculating ? 'animate-spin' : ''}`} />
            Recalculer
          </Button>
          {nbModifies > 0 && (
            <Button onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Sauvegarde...' : `Sauvegarder (${nbModifies})`}
            </Button>
          )}
          {saved && nbModifies === 0 && (
            <span className="flex items-center text-sm text-green-600 font-medium px-3">✓ Sauvegardé</span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Articles',           value: lignes.length,                     color: '' },
          { label: 'Stock trouvé saisi', value: `${nbSaisis} / ${lignes.length}`,   color: 'text-blue-600' },
          { label: 'Écarts détectés',    value: lignesAvecEcart.length,            color: 'text-yellow-600' },
          { label: 'Total écart absolu', value: totalEcartAbs,                     color: 'text-destructive' },
        ].map(s => (
          <div key={s.label} className="bg-card border rounded-lg p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
        💡 Le <strong>stock actuel (théorique)</strong> est mis à jour automatiquement à chaque entrée ou sortie.
        Saisissez le <strong>stock trouvé</strong> lors de votre comptage physique, puis <strong>Sauvegarder</strong>.
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border shadow-sm overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Pièce</TableHead>
              <TableHead>Marque / REF</TableHead>
              <TableHead className="text-right">Stock initial</TableHead>
              <TableHead className="text-right text-green-700">Entrées</TableHead>
              <TableHead className="text-right text-red-600">Sorties</TableHead>
              <TableHead className="text-right bg-blue-50/60">Stock actuel (théorique)</TableHead>
              <TableHead className="bg-green-50/60 min-w-[130px]">Stock trouvé ✏️</TableHead>
              <TableHead className="text-right">Écart</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lignes.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  Aucun article pour ce site. Ajoutez des articles dans Stock Actuel.
                </TableCell>
              </TableRow>
            )}
            {lignes.map((l, idx) => {
              const ecart    = l.stock_trouve_local - l.stock_theorique;
              const hasSaved = l.stock_trouve !== null;
              return (
                <TableRow key={l.id} className={l.modifie ? 'bg-yellow-50' : 'hover:bg-muted/10'}>
                  <TableCell className="font-medium">{l.article?.designation || '—'}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {l.article?.marque && <span className="block">{l.article.marque}</span>}
                    <span className="font-mono">{l.article?.reference || '—'}</span>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">{l.article?.stock_initial ?? 0}</TableCell>
                  <TableCell className="text-right text-green-700 font-medium">
                    {(l.total_entrees ?? 0) > 0 ? `+${l.total_entrees}` : <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell className="text-right text-red-600 font-medium">
                    {(l.total_sorties ?? 0) > 0 ? `-${l.total_sorties}` : <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell className="text-right font-bold bg-blue-50/60 text-blue-800 text-lg">{l.stock_theorique}</TableCell>
                  <TableCell className="bg-green-50/60">
                    <Input
                      type="number"
                      value={l.stock_trouve_local}
                      onChange={e => updateTrouve(idx, Number(e.target.value))}
                      className="w-24 text-right ml-auto"
                      min="0"
                    />
                  </TableCell>
                  <TableCell className={`text-right font-bold text-base ${
                    !hasSaved && !l.modifie ? 'text-muted-foreground' :
                    ecart < 0 ? 'text-red-600' : ecart > 0 ? 'text-green-600' : 'text-muted-foreground'
                  }`}>
                    {!hasSaved && !l.modifie ? '—' : ecart > 0 ? `+${ecart}` : ecart}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="p-6 space-y-4 animate-pulse">
      <div className="h-8 w-56 bg-muted rounded" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-muted rounded-lg" />)}
      </div>
      <div className="h-96 bg-muted rounded-lg" />
    </div>
  );
}
