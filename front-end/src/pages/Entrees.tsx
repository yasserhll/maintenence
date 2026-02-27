import { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { entreesApi } from '../api/entrees';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Plus, Trash2, Search } from 'lucide-react';

export default function Entrees() {
  // ✅ Cache global — zéro attente à l'ouverture de la page
  const { articles, entrees, loading, error, refreshAfterEntree } = useAppData();
  const [open, setOpen]     = useState(false);
  const [search, setSearch] = useState('');
  const [selId, setSelId]   = useState('');
  const [saving, setSaving] = useState(false);

  const selectedArticle = articles.find(a => String(a.id) === selId);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSaving(true);
    try {
      await entreesApi.create({
        article_id:  Number(fd.get('article_id')),
        quantite:    Number(fd.get('quantite')),
        date:        fd.get('date') as string,
        ref_bl:      fd.get('ref_bl') as string,
        ref_article: fd.get('ref_article') as string,
        fournisseur: fd.get('fournisseur') as string,
        observation: fd.get('observation') as string,
      });
      // Resynchronise entrees + articles (stock_actuel) + dashboard
      await refreshAfterEntree();
      setOpen(false);
      setSelId('');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette entrée ?')) return;
    await entreesApi.remove(id);
    await refreshAfterEntree();
  };

  const filtered = entrees.filter(m =>
    `${m.article?.designation ?? ''} ${m.ref_bl ?? ''} ${m.ref_article ?? ''} ${m.fournisseur ?? ''} ${m.date}`
      .toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Skeleton />;
  if (error)   return <div className="p-6 text-destructive">Erreur : {error}</div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Entrées</h1>
          <p className="text-muted-foreground text-sm">Fichier des entrées de stock — {entrees.length} enregistrements</p>
        </div>
        <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) setSelId(''); }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Nouvelle entrée</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Enregistrer une entrée</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <Label>Date</Label>
                <Input name="date" type="date" required defaultValue={new Date().toISOString().slice(0,10)} />
              </div>
              <div>
                <Label>Réf BL</Label>
                <Input name="ref_bl" placeholder="Numéro bon de livraison" />
              </div>
              <div>
                <Label>Pièce</Label>
                <Select name="article_id" required onValueChange={setSelId}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner une pièce..." /></SelectTrigger>
                  <SelectContent className="max-h-60 overflow-auto">
                    {articles.map(a => (
                      <SelectItem key={a.id} value={String(a.id)}>
                        {a.designation}{a.marque ? ` — ${a.marque}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Référence article</Label>
                <Input name="ref_article" value={selectedArticle?.reference ?? ''} readOnly className="bg-muted" />
              </div>
              <div>
                <Label>Quantité</Label>
                <Input name="quantite" type="number" required min="1" />
              </div>
              <div>
                <Label>Fournisseur</Label>
                <Input name="fournisseur" placeholder="Nom du fournisseur" />
              </div>
              <div>
                <Label>Observations</Label>
                <Input name="observation" />
              </div>
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Réf BL</TableHead>
              <TableHead>Référence article</TableHead>
              <TableHead>Pièce</TableHead>
              <TableHead>Fournisseur</TableHead>
              <TableHead className="text-right">Quantité</TableHead>
              <TableHead>Observations</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(m => (
              <TableRow key={m.id}>
                <TableCell>{m.date}</TableCell>
                <TableCell className="font-mono text-xs">{m.ref_bl || '—'}</TableCell>
                <TableCell className="font-mono text-xs">{m.ref_article || m.article?.reference || '—'}</TableCell>
                <TableCell className="font-medium">{m.article?.designation || '—'}</TableCell>
                <TableCell>{m.fournisseur || '—'}</TableCell>
                <TableCell className="text-right font-bold text-green-600">+{m.quantite}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{m.observation || '—'}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(m.id)}>
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function Skeleton() {
  return <div className="p-6 space-y-4 animate-pulse"><div className="h-8 w-40 bg-muted rounded" /><div className="h-96 bg-muted rounded-lg" /></div>;
}
