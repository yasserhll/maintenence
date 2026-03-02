import { useState, useMemo } from 'react';
import { useAppData } from '../context/AppDataContext';
import { useSite } from '../context/SiteContext';
import { sortiesApi } from '../api/sorties';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Plus, Trash2, Search, Pencil, X, Check, ArrowUpFromLine } from 'lucide-react';
import type { Article, Sortie } from '../types/stock';

// Composant recherche article (réutilisable)
function ArticleSearchSelect({
  articles,
  value,
  onChange,
}: {
  articles: Article[];
  value: number | null;
  onChange: (id: number, article: Article) => void;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const selected = articles.find(a => a.id === value);

  const filtered = useMemo(() => {
    if (!query) return articles.slice(0, 50);
    const q = query.toLowerCase();
    return articles.filter(a =>
      a.designation.toLowerCase().includes(q) ||
      (a.reference ?? '').toLowerCase().includes(q) ||
      (a.marque ?? '').toLowerCase().includes(q)
    ).slice(0, 50);
  }, [articles, query]);

  return (
    <div className="relative">
      {selected && !open ? (
        <div
          className="flex items-center justify-between border rounded-md px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => { setOpen(true); setQuery(''); }}
        >
          <div>
            <span className="font-medium text-sm">{selected.designation}</span>
            {selected.marque && <span className="text-xs text-muted-foreground ml-2">— {selected.marque}</span>}
            <span className={`text-xs ml-2 font-semibold ${selected.stock_actuel <= 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
              (stock: {selected.stock_actuel})
            </span>
          </div>
          <X className="w-3.5 h-3.5 text-muted-foreground shrink-0" onClick={e => { e.stopPropagation(); onChange(0, null as any); }} />
        </div>
      ) : (
        <div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              autoFocus={open}
              placeholder="Rechercher par nom, REF, marque..."
              value={query}
              onChange={e => { setQuery(e.target.value); setOpen(true); }}
              onFocus={() => setOpen(true)}
              className="pl-9"
            />
          </div>
          {open && (
            <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-52 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="px-3 py-2 text-sm text-muted-foreground">Aucun résultat</p>
              ) : (
                filtered.map(a => (
                  <div
                    key={a.id}
                    className="px-3 py-2 cursor-pointer hover:bg-accent text-sm flex items-center justify-between"
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => { onChange(a.id, a); setOpen(false); setQuery(''); }}
                  >
                    <div>
                      <span className="font-medium">{a.designation}</span>
                      {a.marque && <span className="text-muted-foreground ml-1">— {a.marque}</span>}
                    </div>
                    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${a.stock_actuel <= 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                      {a.stock_actuel}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SortieForm({
  articles,
  initial,
  onSubmit,
  onClose,
  title,
}: {
  articles: Article[];
  initial?: Partial<Sortie>;
  onSubmit: (data: any) => Promise<void>;
  onClose: () => void;
  title: string;
}) {
  const [articleId, setArticleId] = useState<number | null>(initial?.article_id ?? null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!articleId) return;
    const fd = new FormData(e.currentTarget);
    setSaving(true);
    try {
      await onSubmit({
        article_id:  articleId,
        quantite:    Number(fd.get('quantite')),
        date:        fd.get('date') as string,
        technicien:  fd.get('technicien') as string || null,
        affectation: fd.get('affectation') as string || null,
      });
      onClose();
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date *</Label>
          <Input name="date" type="date" required defaultValue={initial?.date ?? new Date().toISOString().slice(0,10)} className="mt-1" />
        </div>
        <div>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Quantité *</Label>
          <Input name="quantite" type="number" required min="1" defaultValue={initial?.quantite ?? ''} className="mt-1" />
        </div>
      </div>

      <div>
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pièce *</Label>
        <div className="mt-1">
          <ArticleSearchSelect
            articles={articles}
            value={articleId}
            onChange={(id, a) => setArticleId(id || null)}
          />
        </div>
      </div>

      <div>
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Technicien</Label>
        <Input name="technicien" placeholder="Nom du technicien" defaultValue={initial?.technicien ?? ''} className="mt-1" />
      </div>

      <div>
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Affectation</Label>
        <Input name="affectation" placeholder="Ex: CHARGEUSES E 48" defaultValue={initial?.affectation ?? ''} className="mt-1" />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Annuler</Button>
        <Button type="submit" className="flex-1" disabled={saving || !articleId}>
          {saving ? (
            <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Enregistrement...</span>
          ) : (
            <span className="flex items-center gap-2"><Check className="w-4 h-4" />{title}</span>
          )}
        </Button>
      </div>
    </form>
  );
}

export default function Sorties() {
  const {
    articles, sorties, loading, error,
    optimisticAddSortie, optimisticRemoveSortie,
    refreshAfterSortie,
  } = useAppData();
  const { activeSiteId } = useSite();

  const [openAdd, setOpenAdd]   = useState(false);
  const [editItem, setEditItem] = useState<Sortie | null>(null);
  const [search, setSearch]     = useState('');

  const filtered = useMemo(() =>
    sorties.filter(m =>
      `${m.article?.designation ?? ''} ${m.technicien ?? ''} ${m.affectation ?? ''} ${m.date}`
        .toLowerCase().includes(search.toLowerCase())
    ), [sorties, search]
  );

  const handleAdd = async (data: any) => {
    const article = articles.find(a => a.id === data.article_id)!;
    const temp = { id: Date.now(), ...data, article };
    optimisticAddSortie(temp, article);
    setOpenAdd(false);
    try {
      await sortiesApi.create(data, activeSiteId ?? undefined);
      refreshAfterSortie();
    } catch (err: any) { alert('Erreur : ' + err.message); refreshAfterSortie(); }
  };

  const handleEdit = async (data: any) => {
    if (!editItem) return;
    setEditItem(null);
    try {
      await sortiesApi.update(editItem.id, data);
      refreshAfterSortie();
    } catch (err: any) { alert('Erreur : ' + err.message); refreshAfterSortie(); }
  };

  const handleDelete = async (m: Sortie) => {
    if (!confirm('Supprimer cette sortie ?')) return;
    optimisticRemoveSortie(m.id, m.article_id, m.quantite);
    try {
      await sortiesApi.remove(m.id);
      refreshAfterSortie();
    } catch (err: any) { alert('Erreur : ' + err.message); refreshAfterSortie(); }
  };

  if (loading) return <Skeleton />;
  if (error)   return <div className="p-6 text-destructive">Erreur : {error}</div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sorties</h1>
          <p className="text-muted-foreground text-sm">{sorties.length} enregistrements</p>
        </div>
        <Button onClick={() => setOpenAdd(true)}>
          <Plus className="w-4 h-4 mr-2" />Nouvelle sortie
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Rechercher pièce, technicien, affectation..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Date</TableHead>
              <TableHead>Pièce</TableHead>
              <TableHead>Technicien</TableHead>
              <TableHead>Affectation</TableHead>
              <TableHead className="text-right">Qté</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(m => (
              <TableRow key={m.id} className="hover:bg-muted/20">
                <TableCell className="text-sm font-mono">{m.date}</TableCell>
                <TableCell>
                  <div className="font-medium text-sm">{m.article?.designation || '—'}</div>
                  {m.article?.marque && <div className="text-xs text-muted-foreground">{m.article.marque}</div>}
                </TableCell>
                <TableCell className="text-sm">{m.technicien || '—'}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{m.affectation || '—'}</TableCell>
                <TableCell className="text-right">
                  <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full text-sm">-{m.quantite}</span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 justify-end">
                    <Button variant="ghost" size="sm" onClick={() => setEditItem(m)} title="Modifier">
                      <Pencil className="w-3.5 h-3.5 text-blue-500" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(m)} title="Supprimer">
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  {search ? 'Aucun résultat pour cette recherche' : 'Aucune sortie enregistrée'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={openAdd} onOpenChange={setOpenAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-red-100 flex items-center justify-center">
                <ArrowUpFromLine className="w-4 h-4 text-red-600" />
              </div>
              Nouvelle sortie
            </DialogTitle>
          </DialogHeader>
          <SortieForm articles={articles} onSubmit={handleAdd} onClose={() => setOpenAdd(false)} title="Enregistrer la sortie" />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editItem} onOpenChange={o => !o && setEditItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-blue-100 flex items-center justify-center">
                <Pencil className="w-4 h-4 text-blue-600" />
              </div>
              Modifier la sortie
            </DialogTitle>
          </DialogHeader>
          {editItem && (
            <SortieForm articles={articles} initial={editItem} onSubmit={handleEdit} onClose={() => setEditItem(null)} title="Enregistrer les modifications" />
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
