import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/auth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Check, Eye, EyeOff, User, MapPin, Shield, KeyRound, LogOut } from 'lucide-react';

export default function Profil() {
  const { user, logout, isSuperAdmin, isAdmin } = useAuth();
  const [showOld, setShowOld]   = useState(false);
  const [showNew, setShowNew]   = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const current  = fd.get('current') as string;
    const next     = fd.get('new') as string;
    const confirm  = fd.get('confirm') as string;

    if (next !== confirm) { setError('Les mots de passe ne correspondent pas.'); return; }
    if (next.length < 8)  { setError('Le nouveau mot de passe doit contenir au moins 8 caractères.'); return; }

    setError(null);
    setSaving(true);
    try {
      await authApi.changePassword(current, next, confirm);
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const roleLabel: Record<string, { label: string; cls: string }> = {
    superadmin: { label: 'Super Administrateur', cls: 'bg-purple-100 text-purple-700 border-purple-200' },
    admin:      { label: 'Administrateur',        cls: 'bg-blue-100   text-blue-700   border-blue-200'   },
    user:       { label: 'Utilisateur',           cls: 'bg-slate-100  text-slate-600  border-slate-200'  },
  };
  const role = roleLabel[user?.role ?? 'user'];

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mon profil</h1>
        <p className="text-muted-foreground text-sm">Gérez votre compte et votre sécurité</p>
      </div>

      {/* Carte identité */}
      <div className="bg-card border rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-base flex items-center gap-2">
          <User className="w-4 h-4 text-muted-foreground" />Informations du compte
        </h2>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-white text-2xl font-bold shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-lg">{user?.name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="bg-muted/30 rounded-lg p-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Rôle</p>
            <span className={`text-sm px-2.5 py-1 rounded-full font-medium border ${role.cls}`}>
              <Shield className="w-3 h-3 inline mr-1" />{role.label}
            </span>
          </div>
          <div className="bg-muted/30 rounded-lg p-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Site assigné</p>
            {user?.site ? (
              <span className="text-sm font-medium flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground" />{user.site.nom}
              </span>
            ) : (
              <span className="text-sm text-muted-foreground italic">Accès à tous les sites</span>
            )}
          </div>
        </div>
      </div>

      {/* Changer mot de passe */}
      <div className="bg-card border rounded-xl p-6">
        <h2 className="font-semibold text-base flex items-center gap-2 mb-4">
          <KeyRound className="w-4 h-4 text-muted-foreground" />Changer le mot de passe
        </h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2.5 text-sm">{error}</div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-3 py-2.5 text-sm flex items-center gap-2">
              <Check className="w-4 h-4" />Mot de passe modifié avec succès !
            </div>
          )}
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Mot de passe actuel</Label>
            <div className="relative mt-1">
              <Input name="current" type={showOld ? 'text' : 'password'} required placeholder="••••••••" className="pr-10" />
              <button type="button" onClick={() => setShowOld(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nouveau mot de passe</Label>
              <div className="relative mt-1">
                <Input name="new" type={showNew ? 'text' : 'password'} required placeholder="Min. 8 caractères" className="pr-10" />
                <button type="button" onClick={() => setShowNew(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Confirmer</Label>
              <div className="relative mt-1">
                <Input name="confirm" type={showConf ? 'text' : 'password'} required placeholder="Répéter" className="pr-10" />
                <button type="button" onClick={() => setShowConf(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showConf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
          <Button type="submit" disabled={saving} className="w-full">
            {saving ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Modification...</span>
              : <span className="flex items-center gap-2"><Check className="w-4 h-4" />Changer le mot de passe</span>}
          </Button>
        </form>
      </div>

      {/* Déconnexion */}
      <div className="bg-card border border-red-100 rounded-xl p-6">
        <h2 className="font-semibold text-base flex items-center gap-2 mb-2">
          <LogOut className="w-4 h-4 text-red-500" />Déconnexion
        </h2>
        <p className="text-sm text-muted-foreground mb-4">Vous serez redirigé vers la page de connexion.</p>
        <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300" onClick={logout}>
          <LogOut className="w-4 h-4 mr-2" />Se déconnecter
        </Button>
      </div>
    </div>
  );
}
