import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, AlertCircle, Wrench, ArrowRight } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message ?? 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ background: 'hsl(220 25% 8%)' }}
    >
      {/* ── Panneau gauche — branding ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 p-10"
        style={{ background: 'hsl(220 25% 12%)', borderRight: '1px solid hsl(220 18% 20%)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(215 80% 48%)' }}>
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-base leading-tight tracking-wide">GMAO</p>
            <p className="text-xs" style={{ color: 'hsl(210 14% 55%)' }}>Maintenance BG</p>
          </div>
        </div>

        {/* Tagline central */}
        <div className="space-y-4">
          <div className="w-12 h-0.5 rounded-full" style={{ background: 'hsl(215 80% 48%)' }} />
          <h1 className="text-3xl font-bold leading-snug" style={{ color: 'hsl(210 14% 93%)', fontFamily: 'IBM Plex Sans, sans-serif' }}>
            Gestion de<br />
            <span style={{ color: 'hsl(215 80% 55%)' }}>Maintenance</span><br />
            Assistée
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: 'hsl(210 14% 55%)' }}>
            Suivi des stocks, entrées, sorties et inventaires pour chaque site de l'entreprise.
          </p>
        </div>

        {/* Sites */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'hsl(210 14% 40%)' }}>Sites actifs</p>
          {['Benguerir', 'Lotta', 'Yosofia'].map(s => (
            <div key={s} className="flex items-center gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'hsl(160 60% 42%)' }} />
              <span className="text-sm" style={{ color: 'hsl(210 14% 70%)' }}>{s}</span>
            </div>
          ))}
        </div>

        <p className="text-xs" style={{ color: 'hsl(210 14% 30%)' }}>© 2025 Maintenance BG</p>
      </div>

      {/* ── Panneau droit — formulaire ── */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-8">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 justify-center">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(215 80% 48%)' }}>
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg">GMAO</span>
          </div>

          {/* Titre formulaire */}
          <div>
            <h2 className="text-2xl font-bold" style={{ color: 'hsl(210 14% 93%)' }}>
              Connexion
            </h2>
            <p className="text-sm mt-1" style={{ color: 'hsl(210 14% 50%)' }}>
              Entrez vos identifiants pour accéder à votre espace
            </p>
          </div>

          {/* Erreur */}
          {error && (
            <div
              className="flex items-center gap-2.5 rounded-lg px-4 py-3 text-sm"
              style={{ background: 'hsl(0 72% 51% / 0.12)', border: '1px solid hsl(0 72% 51% / 0.3)', color: 'hsl(0 72% 70%)' }}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-widest" style={{ color: 'hsl(210 14% 50%)' }}>
                Adresse email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                autoFocus
                className="w-full h-11 rounded-lg px-4 text-sm outline-none transition-all"
                style={{
                  background: 'hsl(220 22% 16%)',
                  border: '1px solid hsl(220 18% 24%)',
                  color: 'hsl(210 14% 93%)',
                  fontFamily: 'IBM Plex Sans, sans-serif',
                }}
                onFocus={e => e.target.style.borderColor = 'hsl(215 80% 55%)'}
                onBlur={e => e.target.style.borderColor = 'hsl(220 18% 24%)'}
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-widest" style={{ color: 'hsl(210 14% 50%)' }}>
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full h-11 rounded-lg px-4 pr-11 text-sm outline-none transition-all"
                  style={{
                    background: 'hsl(220 22% 16%)',
                    border: '1px solid hsl(220 18% 24%)',
                    color: 'hsl(210 14% 93%)',
                    fontFamily: 'IBM Plex Sans, sans-serif',
                  }}
                  onFocus={e => e.target.style.borderColor = 'hsl(215 80% 55%)'}
                  onBlur={e => e.target.style.borderColor = 'hsl(220 18% 24%)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'hsl(210 14% 45%)' }}
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200"
              style={{
                background: loading ? 'hsl(215 80% 38%)' : 'hsl(215 80% 48%)',
                color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={e => !loading && ((e.target as HTMLElement).style.background = 'hsl(215 80% 55%)')}
              onMouseLeave={e => !loading && ((e.target as HTMLElement).style.background = 'hsl(215 80% 48%)')}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                <>
                  Se connecter
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Hint */}
          <p className="text-center text-xs" style={{ color: 'hsl(210 14% 35%)' }}>
            Accès restreint au personnel autorisé
          </p>
        </div>
      </div>
    </div>
  );
}
