import { useState, useMemo } from 'react';
import { useAppData } from '../context/AppDataContext';
import { useSite } from '../context/SiteContext';
import { articlesApi } from '../api/articles';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Plus, Search, Trash2, Pencil, Check, Package } from 'lucide-react';
import type { Article } from '../types/stock';

function ArticleForm({
  article,
  onSubmit,
  onClose,
  title,
}: {
  article?: Article;
  onSubmit: (data: any) => Promise<void>;
  onClose: () => void;
  title: string;
}) {
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSaving(true);
    try {
      await onSubmit({
        designation:   fd.get('designation') as string,
        reference:     fd.get('reference') as string || null,
        marque:        fd.get('marque') as string || null,
        unite:         fd.get('unite') as string || 'Pièce',
        emplacement:   fd.get('emplacement') as string || null,
        stock_initial: Number(fd.get('stock_initial')),
        stock_min:     Number(fd.get('stock_min')),
        prix_unitaire: Number(fd.get('prix_unitaire')),
      });
      onClose();
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Désignation — champ principal */}
      <div>
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Désignation (nom de la pièce) *
        </Label>
        <Input
          name="designation"
          required
          placeholder="Ex: Filtre à huile, Courroie..."
          defaultValue={article?.designation ?? ''}
          className="mt-1"
        />
      </div>

      {/* REF + Marque */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">REF / Code</Label>
          <Input name="reference" placeholder="Ex: 060606" defaultValue={article?.reference ?? ''} className="mt-1" />
        </div>
        <div>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Marque</Label>
          <Input name="marque" placeholder="Ex: Bosch, SKF..." defaultValue={article?.marque ?? ''} className="mt-1" />
        </div>
      </div>

      {/* Unité + Emplacement */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Unité</Label>
          <Input name="unite" placeholder="Pièce, L, kg..." defaultValue={article?.unite ?? 'Pièce'} className="mt-1" />
        </div>
        <div>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Emplacement</Label>
          <Input name="emplacement" placeholder="Ex: Étagère A3" defaultValue={article?.emplacement ?? ''} className="mt-1" />
        </div>
      </div>

      {/* Stock initial + Stock min */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Stock initial</Label>
          <Input name="stock_initial" type="number" min="0" defaultValue={article?.stock_initial ?? 0} className="mt-1" />
        </div>
        <div>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Stock minimum alerte</Label>
          <Input name="stock_min" type="number" min="0" defaultValue={article?.stock_min ?? 0} className="mt-1" />
        </div>
      </div>

      {/* Prix */}
      <div>
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Prix unitaire (MAD)</Label>
        <Input name="prix_unitaire" type="number" min="0" step="0.01" defaultValue={article?.prix_unitaire ?? 0} className="mt-1" />
      </div>

      {/* Boutons */}
      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Annuler</Button>
        <Button type="submit" className="flex-1" disabled={saving}>
          {saving ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Enregistrement...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4" />{title}
            </span>
          )}
        </Button>
      </div>
    </form>
  );
}

export default function Stock() {
  const {
    articles, loading, error,
    optimisticAddArticle, optimisticUpdateArticle, optimisticRemoveArticle,
    refreshArticles,
  } = useAppData();
  const { activeSiteId } = useSite();

  const [search, setSearch]   = useState('');
  const [openAdd, setOpenAdd] = useState(false);
  const [editArt, setEditArt] = useState<Article | null>(null);

  const filtered = useMemo(() =>
    articles.filter(a =>
      `${a.designation} ${a.reference ?? ''} ${a.marque ?? ''}`.toLowerCase().includes(search.toLowerCase())
    ), [articles, search]
  );

  const alertCount = articles.filter(a => a.stock_min > 0 && a.stock_actuel <= a.stock_min).length;

  const handleAdd = async (data: any) => {
    const temp: Article = { id: Date.now(), ...data, stock_actuel: data.stock_initial ?? 0 };
    optimisticAddArticle(temp);
    setOpenAdd(false);
    try {
      await articlesApi.create(data, activeSiteId ?? undefined);
      refreshArticles();
    } catch (err: any) { alert('Erreur : ' + err.message); refreshArticles(); }
  };

  const handleUpdate = async (data: any) => {
    if (!editArt) return;
    optimisticUpdateArticle({ ...editArt, ...data });
    setEditArt(null);
    try {
      await articlesApi.update(editArt.id, data);
      refreshArticles();
    } catch (err: any) { alert('Erreur : ' + err.message); refreshArticles(); }
  };

  const handleDelete = async (a: Article) => {
    if (!confirm('Supprimer cet article ?')) return;
    optimisticRemoveArticle(a.id);
    try {
      await articlesApi.remove(a.id);
    } catch (err: any) { alert('Erreur : ' + err.message); refreshArticles(); }
  };

  if (loading) return <Skeleton />;
  if (error)   return <div className="p-6 text-destructive">Erreur : {error}</div>;

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Stock actuel</h1>
          <p className="text-muted-foreground text-sm">
            {articles.length} références
            {alertCount > 0 && (
              <span className="ml-2 text-destructive font-semibold">⚠ {alertCount} en alerte</span>
            )}
          </p>
        </div>
        <Button onClick={() => setOpenAdd(true)}>
          <Plus className="w-4 h-4 mr-2" />Nouvel article
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher désignation, REF, marque..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Pièce</TableHead>
              <TableHead>Marque</TableHead>
              <TableHead>REF</TableHead>
              <TableHead className="text-right">Stock initial</TableHead>
              <TableHead className="text-right">Stock actuel</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(a => {
              const isLow = a.stock_min > 0 && a.stock_actuel <= a.stock_min;
              return (
                <TableRow key={a.id} className={`hover:bg-muted/20 ${isLow ? 'bg-red-50' : ''}`}>
                  <TableCell className="font-medium">{a.designation}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{a.marque || '—'}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{a.reference || '—'}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{a.stock_initial}</TableCell>
                  <TableCell className="text-right">
                    <span className={`font-bold text-xl ${isLow ? 'text-destructive' : ''}`}>
                      {a.stock_actuel}{isLow && ' ⚠'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="sm" onClick={() => setEditArt(a)} title="Modifier">
                        <Pencil className="w-3.5 h-3.5 text-blue-500" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(a)} title="Supprimer">
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  {search ? 'Aucun résultat pour cette recherche' : 'Aucun article enregistré'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog Ajout */}
      <Dialog open={openAdd} onOpenChange={setOpenAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-blue-100 flex items-center justify-center">
                <Package className="w-4 h-4 text-blue-600" />
              </div>
              Nouvel article
            </DialogTitle>
          </DialogHeader>
          <ArticleForm onSubmit={handleAdd} onClose={() => setOpenAdd(false)} title="Ajouter l'article" />
        </DialogContent>
      </Dialog>

      {/* Dialog Modification */}
      <Dialog open={!!editArt} onOpenChange={o => !o && setEditArt(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-blue-100 flex items-center justify-center">
                <Pencil className="w-4 h-4 text-blue-600" />
              </div>
              Modifier l'article
            </DialogTitle>
          </DialogHeader>
          {editArt && (
            <ArticleForm
              article={editArt}
              onSubmit={handleUpdate}
              onClose={() => setEditArt(null)}
              title="Enregistrer les modifications"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="p-6 space-y-4 animate-pulse">
      <div className="h-8 w-40 bg-muted rounded" />
      <div className="h-10 w-64 bg-muted rounded" />
      <div className="h-96 bg-muted rounded-lg" />
    </div>
  );
}
