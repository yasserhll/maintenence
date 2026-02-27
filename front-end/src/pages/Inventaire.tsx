import { useState, useEffect } from 'react';
import { inventaireApi } from '../api/inventaire';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Save, RefreshCw } from 'lucide-react';
import type { LigneInventaire, Inventaire as InvType } from '../types/stock';

// État local d'une ligne avec stock_trouve éditable
interface LigneEditable extends LigneInventaire {
  stock_trouve_local: number;
  obs_local: string;
  modifie: boolean;
}

export default function Inventaire() {
  const [inventaire, setInventaire]   = useState<InvType | null>(null);
  const [lignes, setLignes]           = useState<LigneEditable[]>([]);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [recalculating, setRecalc]    = useState(false);
  const [saved, setSaved]             = useState(false);
  const [error, setError]             = useState<string | null>(null);

  // Chargement initial de l'inventaire (une seule fois)
  useEffect(() => {
    loadInventaire();
  }, []);

  const loadInventaire = async () => {
    try {
      setLoading(true);
      setError(null);
      const inv = await inventaireApi.get();
      setInventaire(inv);
      // Initialiser les lignes éditables
      setLignes(inv.lignes.map(l => ({
        ...l,
        stock_trouve_local: l.stock_trouve ?? l.stock_theorique,
        obs_local:          l.observation ?? '',
        modifie:            false,
      })));
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

  const updateObs = (idx: number, val: string) => {
    setLignes(prev => prev.map((l, i) =>
      i === idx ? { ...l, obs_local: val, modifie: true } : l
    ));
    setSaved(false);
  };

  // Sauvegarde uniquement les lignes modifiées (stock_trouve)
  const handleSave = async () => {
    const modifiees = lignes.filter(l => l.modifie);
    if (modifiees.length === 0) return;
    setSaving(true);
    try {
      await inventaireApi.saveTrouves(
        modifiees.map(l => ({
          id:           l.id,
          stock_trouve: l.stock_trouve_local,
          observation:  l.obs_local,
        }))
      );
      // Marquer toutes comme sauvegardées
      setLignes(prev => prev.map(l => ({ ...l, modifie: false })));
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  // Forcer un recalcul depuis le backend (après import Excel par exemple)
  const handleRecalculer = async () => {
    setRecalc(true);
    try {
      const inv = await inventaireApi.recalculer();
      setInventaire(inv);
      setLignes(inv.lignes.map(l => ({
        ...l,
        stock_trouve_local: l.stock_trouve ?? l.stock_theorique,
        obs_local:          l.observation ?? '',
        modifie:            false,
      })));
      setSaved(false);
    } finally { setRecalc(false); }
  };

  const nbModifies      = lignes.filter(l => l.modifie).length;
  const nbSaisis        = lignes.filter(l => l.stock_trouve !== null).length;
  const lignesAvecEcart = lignes.filter(l => l.stock_trouve !== null && l.stock_trouve !== l.stock_theorique);
  const totalEcartAbs   = lignesAvecEcart.reduce((s, l) => s + Math.abs(l.stock_trouve_local - l.stock_theorique), 0);

  if (loading) return <Skeleton />;
  if (error)   return <div className="p-6 text-destructive">Erreur : {error}</div>;

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inventaire du stock</h1>
          <p className="text-muted-foreground text-sm">
            Site {inventaire?.site} — Créé le {inventaire?.date_creation}
            {inventaire?.derniere_maj && (
              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                ✓ Mis à jour automatiquement : {new Date(inventaire.derniere_maj).toLocaleString('fr-FR')}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRecalculer} disabled={recalculating} size="sm">
            <RefreshCw className={`w-4 h-4 mr-2 ${recalculating ? 'animate-spin' : ''}`} />
            Recalculer
          </Button>
          {nbModifies > 0 && (
            <Button onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Sauvegarde...' : `Sauvegarder (${nbModifies} modifiés)`}
            </Button>
          )}
          {saved && nbModifies === 0 && (
            <span className="flex items-center text-sm text-green-600 font-medium px-3">✓ Sauvegardé</span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Articles</p>
          <p className="text-2xl font-bold mt-1">{lignes.length}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Stock trouvé saisi</p>
          <p className="text-2xl font-bold mt-1 text-blue-600">{nbSaisis} / {lignes.length}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Écarts détectés</p>
          <p className="text-2xl font-bold mt-1 text-yellow-600">{lignesAvecEcart.length}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Total écart absolu</p>
          <p className="text-2xl font-bold mt-1 text-destructive">{totalEcartAbs}</p>
        </div>
      </div>

      {/* Bannière info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
        💡 Le <strong>stock actuel (théorique)</strong> est mis à jour automatiquement à chaque entrée ou sortie enregistrée.
        Saisissez le <strong>stock trouvé</strong> manuellement lors de votre comptage physique, puis cliquez sur <strong>Sauvegarder</strong>.
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border shadow-sm overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pièce</TableHead>
              <TableHead>Marque / REF</TableHead>
              <TableHead className="text-right">Stock initial</TableHead>
              <TableHead className="text-right">Entrées</TableHead>
              <TableHead className="text-right">Sorties</TableHead>
              <TableHead className="text-right bg-blue-50">Stock actuel (théorique)</TableHead>
              <TableHead className="text-right bg-green-50">Stock trouvé ✏️</TableHead>
              <TableHead className="text-right">Écart</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lignes.map((l, idx) => {
              const ecart = l.stock_trouve !== null
                ? l.stock_trouve_local - l.stock_theorique
                : null;
              return (
                <TableRow key={l.id} className={l.modifie ? 'bg-yellow-50' : ''}>
                  <TableCell className="font-medium">{l.article?.designation || '—'}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {l.article?.marque && <span className="block">{l.article.marque}</span>}
                    <span className="font-mono">{l.article?.reference || '—'}</span>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">{l.article?.stock_initial ?? 0}</TableCell>
                  <TableCell className="text-right text-green-700 font-medium">
                    +{(l.article?.stock_actuel ?? 0) - (l.article?.stock_initial ?? 0) + (l.stock_theorique - (l.article?.stock_initial ?? 0)) < 0 ? 0 : '?'}
                  </TableCell>
                  <TableCell className="text-right text-red-600 font-medium">
                    -{Math.max(0, (l.article?.stock_initial ?? 0) - l.stock_theorique)}
                  </TableCell>
                  <TableCell className="text-right font-bold bg-blue-50 text-blue-800">{l.stock_theorique}</TableCell>
                  <TableCell className="bg-green-50">
                    <Input
                      type="number"
                      value={l.stock_trouve_local}
                      onChange={e => updateTrouve(idx, Number(e.target.value))}
                      className="w-20 text-right"
                      min="0"
                    />
                  </TableCell>
                  <TableCell className={`text-right font-bold ${
                    ecart === null ? 'text-muted-foreground' :
                    ecart < 0     ? 'text-red-600' :
                    ecart > 0     ? 'text-green-600' : 'text-muted-foreground'
                  }`}>
                    {ecart === null ? '—' : ecart > 0 ? `+${ecart}` : ecart}
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
      <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-muted rounded-lg" />)}</div>
      <div className="h-96 bg-muted rounded-lg" />
    </div>
  );
}
