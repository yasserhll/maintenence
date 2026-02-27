import { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { articlesApi } from '../api/articles';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Plus, Search, Trash2, Pencil } from 'lucide-react';
import type { Article } from '../types/stock';

function ArticleForm({ article, onSubmit, onClose }: {
  article?: Article;
  onSubmit: (data: any) => Promise<void>;
  onClose: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSaving(true);
    try {
      await onSubmit({
        designation:   fd.get('designation') as string,
        reference:     fd.get('reference') as string,
        marque:        fd.get('marque') as string,
        unite:         fd.get('unite') as string,
        emplacement:   fd.get('emplacement') as string,
        stock_initial: Number(fd.get('stock_initial')),
        stock_min:     Number(fd.get('stock_min')),
        prix_unitaire: Number(fd.get('prix_unitaire')),
      });
      onClose();
    } finally { setSaving(false); }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {[
        { name: 'designation',   label: 'Pièce (désignation)',  type: 'text',   val: article?.designation ?? '' },
        { name: 'reference',     label: 'REF / Code article',   type: 'text',   val: article?.reference ?? '' },
        { name: 'marque',        label: 'Marque',               type: 'text',   val: article?.marque ?? '' },
        { name: 'unite',         label: 'Unité',                type: 'text',   val: article?.unite ?? 'Pièce' },
        { name: 'emplacement',   label: 'Emplacement',          type: 'text',   val: article?.emplacement ?? '' },
        { name: 'stock_initial', label: 'Stock initial',        type: 'number', val: article?.stock_initial ?? 0 },
        { name: 'stock_min',     label: 'Stock minimum alerte', type: 'number', val: article?.stock_min ?? 0 },
        { name: 'prix_unitaire', label: 'Prix unitaire (MAD)',  type: 'number', val: article?.prix_unitaire ?? 0 },
      ].map(f => (
        <div key={f.name}>
          <Label>{f.label}</Label>
          <Input name={f.name} type={f.type} defaultValue={String(f.val)} step={f.type === 'number' ? '0.01' : undefined} />
        </div>
      ))}
      <Button type="submit" className="w-full" disabled={saving}>
        {saving ? 'Enregistrement...' : article ? 'Modifier' : 'Ajouter'}
      </Button>
    </form>
  );
}

export default function Stock() {
  // ✅ Données depuis le cache global — affichage instantané
  const { articles, loading, error, refreshArticles } = useAppData();
  const [search, setSearch]   = useState('');
  const [openAdd, setOpenAdd] = useState(false);
  const [editArt, setEditArt] = useState<Article | null>(null);

  const filtered    = articles.filter(a =>
    `${a.designation} ${a.reference ?? ''} ${a.marque ?? ''}`.toLowerCase().includes(search.toLowerCase())
  );
  const alertCount  = articles.filter(a => a.stock_min > 0 && a.stock_actuel <= a.stock_min).length;

  if (loading) return <Skeleton />;
  if (error)   return <div className="p-6 text-destructive">Erreur : {error}</div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Stock actuel</h1>
          <p className="text-muted-foreground text-sm">
            {articles.length} références
            {alertCount > 0 && <span className="ml-2 text-destructive font-semibold">⚠ {alertCount} en alerte</span>}
          </p>
        </div>
        <Dialog open={openAdd} onOpenChange={setOpenAdd}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Nouvel article</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Ajouter un article</DialogTitle></DialogHeader>
            <ArticleForm
              onSubmit={async (data) => { await articlesApi.create(data); await refreshArticles(); }}
              onClose={() => setOpenAdd(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Rechercher désignation, REF, marque..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pièce</TableHead>
              <TableHead>Marque</TableHead>
              <TableHead>REF</TableHead>
              <TableHead className="text-right">Stock initial</TableHead>
              <TableHead className="text-right">Stock actuel</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(a => {
              const isLow = a.stock_min > 0 && a.stock_actuel <= a.stock_min;
              return (
                <TableRow key={a.id} className={isLow ? 'bg-red-50' : ''}>
                  <TableCell className="font-medium">{a.designation}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{a.marque || '—'}</TableCell>
                  <TableCell className="font-mono text-xs">{a.reference || '—'}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{a.stock_initial}</TableCell>
                  <TableCell className={`text-right font-bold text-xl ${isLow ? 'text-destructive' : ''}`}>
                    {a.stock_actuel}{isLow && ' ⚠'}
                  </TableCell>
                  <TableCell className="flex gap-1 justify-end">
                    <Button variant="ghost" size="sm" onClick={() => setEditArt(a)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="sm" onClick={async () => {
                      if (!confirm('Supprimer cet article ?')) return;
                      await articlesApi.remove(a.id);
                      await refreshArticles();
                    }}><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editArt} onOpenChange={o => !o && setEditArt(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Modifier l'article</DialogTitle></DialogHeader>
          {editArt && (
            <ArticleForm
              article={editArt}
              onSubmit={async (data) => { await articlesApi.update(editArt.id, data); await refreshArticles(); }}
              onClose={() => setEditArt(null)}
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
