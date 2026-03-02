import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminApi } from '../api/auth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import {
  Plus, Trash2, Pencil, Check, Users, MapPin,
  ShieldCheck, User as UserIcon, Building2, X
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Site  { id: number; nom: string; slug: string; description: string | null; actif: boolean; users_count?: number; }
interface UserR { id: number; name: string; email: string; role: string; site_id: number | null; site: { id: number; nom: string } | null; }

// ── Composants helpers ────────────────────────────────────────────────────────
function RoleBadge({ role }: { role: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    superadmin: { label: 'Super Admin', cls: 'bg-purple-100 text-purple-700 border border-purple-200' },
    admin:      { label: 'Admin',       cls: 'bg-blue-100   text-blue-700   border border-blue-200'   },
    user:       { label: 'Utilisateur', cls: 'bg-slate-100  text-slate-600  border border-slate-200'  },
  };
  const s = map[role] ?? map.user;
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.cls}`}>{s.label}</span>;
}

// ── Formulaire Site ────────────────────────────────────────────────────────────
function SiteForm({ initial, onSubmit, onClose }: { initial?: Site; onSubmit: (d: any) => Promise<void>; onClose: () => void }) {
  const [saving, setSaving] = useState(false);
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSaving(true);
    try {
      await onSubmit({ nom: fd.get('nom'), description: fd.get('description') || null });
      onClose();
    } catch (err: any) { alert(err.message); }
    finally { setSaving(false); }
  };
  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nom du site / emplacement *</Label>
        <Input name="nom" required defaultValue={initial?.nom ?? ''} placeholder="Ex: Benguerir, Lotta, Khouribga..." className="mt-1" autoFocus />
      </div>
      <div>
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Description</Label>
        <Input name="description" defaultValue={initial?.description ?? ''} placeholder="Description optionnelle" className="mt-1" />
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Annuler</Button>
        <Button type="submit" className="flex-1" disabled={saving}>
          {saving ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>...</span>
            : <span className="flex items-center gap-2"><Check className="w-4 h-4"/>{initial ? 'Modifier' : 'Créer le site'}</span>}
        </Button>
      </div>
    </form>
  );
}

// ── Formulaire Utilisateur ─────────────────────────────────────────────────────
function UserForm({ initial, sites, onSubmit, onClose }: { initial?: UserR; sites: Site[]; onSubmit: (d: any) => Promise<void>; onClose: () => void }) {
  const [saving, setSaving] = useState(false);
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data: any = { name: fd.get('name'), email: fd.get('email'), role: fd.get('role'), site_id: Number(fd.get('site_id')) };
    const pwd = fd.get('password') as string;
    if (pwd) data.password = pwd;
    setSaving(true);
    try { await onSubmit(data); onClose(); }
    catch (err: any) { alert(err.message); }
    finally { setSaving(false); }
  };
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nom complet *</Label>
          <Input name="name" required defaultValue={initial?.name ?? ''} className="mt-1" autoFocus />
        </div>
        <div>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email *</Label>
          <Input name="email" type="email" required defaultValue={initial?.email ?? ''} className="mt-1" />
        </div>
      </div>
      <div>
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Mot de passe {initial ? '(laisser vide = inchangé)' : '*'}
        </Label>
        <Input name="password" type="password" required={!initial} placeholder={initial ? '••••••••' : 'Min. 8 caractères'} className="mt-1" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Rôle *</Label>
          <select name="role" defaultValue={initial?.role ?? 'user'} required
            className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="user">Utilisateur</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Site *</Label>
          <select name="site_id" defaultValue={initial?.site_id ?? ''} required
            className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="">— Sélectionner —</option>
            {sites.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
          </select>
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Annuler</Button>
        <Button type="submit" className="flex-1" disabled={saving}>
          {saving ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>...</span>
            : <span className="flex items-center gap-2"><Check className="w-4 h-4"/>{initial ? 'Enregistrer' : 'Créer le compte'}</span>}
        </Button>
      </div>
    </form>
  );
}

// ── Page principale Admin ──────────────────────────────────────────────────────
type Tab = 'sites' | 'users';

export default function Admin() {
  const { user: me } = useAuth();
  const [tab, setTab]     = useState<Tab>('users');
  const [sites, setSites] = useState<Site[]>([]);
  const [users, setUsers] = useState<UserR[]>([]);
  const [loading, setLoading] = useState(true);
  const [openSite, setOpenSite] = useState(false);
  const [openUser, setOpenUser] = useState(false);
  const [editSite, setEditSite] = useState<Site | null>(null);
  const [editUser, setEditUser] = useState<UserR | null>(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [s, u] = await Promise.all([adminApi.listSites(), adminApi.listUsers()]);
      setSites(s); setUsers(u);
    } catch (err: any) { alert(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadAll(); }, []);

  // Sites
  const handleCreateSite  = (d: any) => adminApi.createSite(d).then(loadAll);
  const handleUpdateSite  = (d: any) => adminApi.updateSite(editSite!.id, d).then(loadAll);
  const handleDeleteSite  = async (s: Site) => {
    if (!confirm(`Supprimer le site "${s.nom}" ? Cette action est irréversible.`)) return;
    try { await adminApi.deleteSite(s.id); await loadAll(); } catch (e: any) { alert(e.message); }
  };

  // Users
  const handleCreateUser  = (d: any) => adminApi.createUser(d).then(loadAll);
  const handleUpdateUser  = (d: any) => adminApi.updateUser(editUser!.id, d).then(loadAll);
  const handleDeleteUser  = async (u: UserR) => {
    if (!confirm(`Supprimer le compte de "${u.name}" ?`)) return;
    try { await adminApi.deleteUser(u.id); await loadAll(); } catch (e: any) { alert(e.message); }
  };

  const tabs: { id: Tab; label: string; icon: any; count: number }[] = [
    { id: 'users', label: 'Comptes utilisateurs', icon: Users,    count: users.length },
    { id: 'sites', label: 'Sites / Emplacements', icon: Building2, count: sites.length },
  ];

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Administration</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Gestion des comptes et des sites</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/40 rounded-xl p-1 w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}>
            <t.icon className="w-4 h-4" />
            {t.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.id ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="h-48 flex items-center justify-center text-muted-foreground animate-pulse">Chargement...</div>
      ) : tab === 'users' ? (
        /* ── USERS TAB ── */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{users.length} compte{users.length > 1 ? 's' : ''} enregistré{users.length > 1 ? 's' : ''}</p>
            <Button onClick={() => { setEditUser(null); setOpenUser(true); }} size="sm">
              <Plus className="w-4 h-4 mr-1.5" />Nouveau compte
            </Button>
          </div>
          <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(u => (
                  <TableRow key={u.id} className={`hover:bg-muted/10 ${u.id === me?.id ? 'bg-blue-50/50' : ''}`}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-semibold text-sm shrink-0">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-sm">{u.name}</span>
                        {u.id === me?.id && <span className="text-xs text-blue-500 font-medium">(vous)</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                    <TableCell><RoleBadge role={u.role} /></TableCell>
                    <TableCell>
                      {u.site ? (
                        <span className="flex items-center gap-1.5 text-sm">
                          <MapPin className="w-3.5 h-3.5 text-muted-foreground" />{u.site.nom}
                        </span>
                      ) : <span className="text-xs text-muted-foreground italic">Tous les sites</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="sm" onClick={() => { setEditUser(u); setOpenUser(true); }} title="Modifier">
                          <Pencil className="w-3.5 h-3.5 text-blue-500" />
                        </Button>
                        {u.role !== 'superadmin' && u.id !== me?.id && (
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(u)} title="Supprimer">
                            <Trash2 className="w-3.5 h-3.5 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Aucun utilisateur</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        /* ── SITES TAB ── */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{sites.length} site{sites.length > 1 ? 's' : ''} configuré{sites.length > 1 ? 's' : ''}</p>
            <Button onClick={() => { setEditSite(null); setOpenSite(true); }} size="sm">
              <Plus className="w-4 h-4 mr-1.5" />Nouveau site
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sites.map(s => (
              <div key={s.id} className="bg-card border rounded-xl p-5 hover:shadow-md transition-shadow group">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-slate-600" />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" onClick={() => { setEditSite(s); setOpenSite(true); }} title="Modifier">
                      <Pencil className="w-3.5 h-3.5 text-blue-500" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteSite(s)} title="Supprimer">
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="font-semibold text-base">{s.nom}</h3>
                  {s.description && <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>}
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="w-3.5 h-3.5" />
                  {s.users_count ?? 0} utilisateur{(s.users_count ?? 0) > 1 ? 's' : ''}
                </div>
                <div className={`mt-3 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${s.actif ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${s.actif ? 'bg-green-500' : 'bg-red-400'}`} />
                  {s.actif ? 'Actif' : 'Inactif'}
                </div>
              </div>
            ))}
            {sites.length === 0 && (
              <div className="col-span-3 text-center py-12 text-muted-foreground">
                Aucun site configuré. Créez-en un pour commencer.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dialogs Sites */}
      <Dialog open={openSite} onOpenChange={o => !o && setOpenSite(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-slate-600" />
              </div>
              {editSite ? 'Modifier le site' : 'Nouveau site'}
            </DialogTitle>
          </DialogHeader>
          <SiteForm initial={editSite ?? undefined} onSubmit={editSite ? handleUpdateSite : handleCreateSite} onClose={() => setOpenSite(false)} />
        </DialogContent>
      </Dialog>

      {/* Dialog Users */}
      <Dialog open={openUser} onOpenChange={o => !o && setOpenUser(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-blue-100 flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-blue-600" />
              </div>
              {editUser ? 'Modifier le compte' : 'Nouveau compte'}
            </DialogTitle>
          </DialogHeader>
          <UserForm initial={editUser ?? undefined} sites={sites} onSubmit={editUser ? handleUpdateUser : handleCreateUser} onClose={() => setOpenUser(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
