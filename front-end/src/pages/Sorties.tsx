import { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { sortiesApi } from '../api/sorties';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Plus, Trash2, Search } from 'lucide-react';

export default function Sorties() {
  // ✅ Cache global — zéro attente à l'ouverture de la page
  const { articles, sorties, loading, error, refreshAfterSortie } = useAppData();
  const [open, setOpen]     = useState(false);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSaving(true);
    try {
      await sortiesApi.create({
        article_id:  Number(fd.get('article_id')),
        quantite:    Number(fd.get('quantite')),
        date:        fd.get('date') as string,
        technicien:  fd.get('technicien') as string,
        affectation: fd.get('affectation') as string,
      });
      // Resynchronise sorties + articles (stock_actuel) + dashboard
      await refreshAfterSortie();
      setOpen(false);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette sortie ?')) return;
    await sortiesApi.remove(id);
    await refreshAfterSortie();
  };

  const filtered = sorties.filter(m =>
    `${m.article?.designation ?? ''} ${m.technicien ?? ''} ${m.affectation ?? ''} ${m.date}`
      .toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Skeleton />;
  if (error)   return <div className="p-6 text-destructive">Erreur : {error}</div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sorties</h1>
          <p className="text-muted-foreground text-sm">Fichier des sorties de stock — {sorties.length} enregistrements</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Nouvelle sortie</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Enregistrer une sortie</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <Label>Date</Label>
                <Input name="date" type="date" required defaultValue={new Date().toISOString().slice(0,10)} />
              </div>
              <div>
                <Label>Pièce</Label>
                <Select name="article_id" required>
                  <SelectTrigger><SelectValue placeholder="Sélectionner une pièce..." /></SelectTrigger>
                  <SelectContent className="max-h-60 overflow-auto">
                    {articles.map(a => (
                      <SelectItem key={a.id} value={String(a.id)}>
                        {a.designation}{a.marque ? ` — ${a.marque}` : ''}
                        {' '}<span className={a.stock_actuel <= 0 ? 'text-destructive' : 'text-muted-foreground'}>(stock: {a.stock_actuel})</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Technicien</Label>
                <Input name="technicien" placeholder="Nom du technicien" />
              </div>
              <div>
                <Label>Quantité</Label>
                <Input name="quantite" type="number" required min="1" />
              </div>
              <div>
                <Label>Affectation (machine / chantier)</Label>
                <Input name="affectation" placeholder="Ex: CHARGEUSES E 48" />
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
        <Input placeholder="Rechercher pièce, technicien, affectation..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Pièce</TableHead>
              <TableHead>Technicien</TableHead>
              <TableHead className="text-right">Quantité</TableHead>
              <TableHead>Affectation</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(m => (
              <TableRow key={m.id}>
                <TableCell>{m.date}</TableCell>
                <TableCell>
                  <div className="font-medium">{m.article?.designation || '—'}</div>
                  {m.article?.marque && <div className="text-xs text-muted-foreground">{m.article.marque}</div>}
                </TableCell>
                <TableCell>{m.technicien || '—'}</TableCell>
                <TableCell className="text-right font-bold text-red-600">-{m.quantite}</TableCell>
                <TableCell className="text-sm">{m.affectation || '—'}</TableCell>
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
