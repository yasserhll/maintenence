import { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSite, type SiteOption } from '../context/SiteContext';
import {
  LayoutDashboard, Package, ArrowDownToLine, ArrowUpFromLine,
  ClipboardList, Wrench, ChevronLeft, ChevronRight, ChevronDown,
  UserCircle, LogOut, ShieldCheck, MapPin, Check, Building2
} from 'lucide-react';

const mainLinks = [
  { to: '/',           label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/stock',      label: 'Stock Actuel',    icon: Package },
  { to: '/entrees',    label: 'Entrées',          icon: ArrowDownToLine },
  { to: '/sorties',    label: 'Sorties',          icon: ArrowUpFromLine },
  { to: '/inventaire', label: 'Inventaire',       icon: ClipboardList },
];

function NavItem({ to, label, icon: Icon, collapsed }: { to: string; label: string; icon: any; collapsed: boolean }) {
  return (
    <NavLink to={to} end={to === '/'} title={label}
      className={({ isActive }) =>
        `group relative flex items-center rounded-md text-sm font-medium transition-all duration-150
         ${collapsed ? 'justify-center w-10 h-10 mx-auto' : 'gap-3 px-3 py-2.5 w-full'}
         ${isActive
           ? 'bg-sidebar-accent text-sidebar-accent-foreground'
           : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
         }`
      }
    >
      <Icon className="w-[18px] h-[18px] shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
      {collapsed && (
        <span className="pointer-events-none absolute left-full ml-3 z-50 bg-popover text-popover-foreground border text-xs font-medium px-2.5 py-1.5 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-150 whitespace-nowrap">
          {label}
        </span>
      )}
    </NavLink>
  );
}

// Sélecteur de site intégré dans la sidebar
function SiteSwitcher({ collapsed }: { collapsed: boolean }) {
  const { sites, activeSite, setActiveSite } = useSite();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Fermer si clic hors
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!activeSite) return null;

  const siteColors = [
    'hsl(215 80% 55%)',
    'hsl(160 60% 45%)',
    'hsl(38 92% 55%)',
    'hsl(280 70% 60%)',
    'hsl(0 72% 55%)',
  ];
  const getColor = (id: number) => siteColors[(id - 1) % siteColors.length];

  return (
    <div ref={ref} className="relative mx-2 mt-2">
      <button
        onClick={() => setOpen(v => !v)}
        title={collapsed ? activeSite.nom : undefined}
        className={`
          w-full flex items-center rounded-lg transition-colors
          bg-sidebar-accent/40 hover:bg-sidebar-accent/70 border border-sidebar-border/50
          ${collapsed ? 'justify-center p-2' : 'gap-2.5 px-2.5 py-2'}
        `}
      >
        {/* Dot coloré */}
        <div
          className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-white text-[10px] font-bold"
          style={{ background: getColor(activeSite.id) }}
        >
          {activeSite.nom.charAt(0).toUpperCase()}
        </div>

        {!collapsed && (
          <>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-semibold text-sidebar-foreground truncate">{activeSite.nom}</p>
              <p className="text-[10px] text-sidebar-foreground/50">Site actif</p>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-sidebar-foreground/50 transition-transform duration-200 shrink-0 ${open ? 'rotate-180' : ''}`} />
          </>
        )}

        {/* Tooltip quand collapsed */}
        {collapsed && (
          <span className="pointer-events-none absolute left-full ml-3 z-50 bg-popover text-popover-foreground border text-xs font-medium px-2.5 py-1.5 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap">
            {activeSite.nom}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className={`
            absolute z-50 py-1 rounded-xl shadow-2xl border overflow-hidden
            ${collapsed
              ? 'left-full ml-3 top-0 w-52'
              : 'left-0 right-0 mt-1.5 w-full'
            }
          `}
          style={{ background: 'hsl(220 25% 10%)', borderColor: 'hsl(220 18% 22%)' }}
        >
          <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'hsl(210 14% 40%)' }}>
            Changer de site
          </p>
          {sites.map(site => (
            <button
              key={site.id}
              onClick={() => { setActiveSite(site); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors hover:bg-sidebar-accent/60"
              style={{ color: activeSite.id === site.id ? getColor(site.id) : 'hsl(210 14% 75%)' }}
            >
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-white text-[10px] font-bold"
                style={{ background: getColor(site.id) }}
              >
                {site.nom.charAt(0).toUpperCase()}
              </div>
              <span className="flex-1 text-left font-medium truncate">{site.nom}</span>
              {activeSite.id === site.id && <Check className="w-3.5 h-3.5 shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout, isAdmin, isSuperAdmin } = useAuth();
  const { activeSite } = useSite();

  // Nom affiché sous GMAO
  const siteLabel = isSuperAdmin
    ? (activeSite?.nom ?? 'Tous les sites')
    : (user?.site?.nom ?? 'Mon site');

  return (
    <div className="flex min-h-screen bg-background">

      {/* ══ SIDEBAR ══ */}
      <aside className={`
        fixed top-0 left-0 h-screen z-40
        bg-sidebar text-sidebar-foreground flex flex-col
        border-r border-sidebar-border
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-[64px]' : 'w-64'}
      `}>

        {/* ── Header ── */}
        <div className={`flex items-center border-b border-sidebar-border min-h-[60px] px-3 ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center shrink-0">
            <Wrench className="w-4 h-4 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-sidebar-primary-foreground leading-tight truncate">GMAO</p>
                <p className="text-[11px] text-sidebar-foreground/50 truncate">{siteLabel}</p>
              </div>
              <button onClick={() => setCollapsed(true)}
                className="w-6 h-6 flex items-center justify-center rounded text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors shrink-0"
                title="Réduire">
                <ChevronLeft className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Bouton expand quand réduit */}
        {collapsed && (
          <button onClick={() => setCollapsed(false)}
            className="flex items-center justify-center w-10 h-7 mx-auto mt-2 rounded text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
            title="Ouvrir">
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* ── Site switcher (superadmin uniquement) ── */}
        {isSuperAdmin && <SiteSwitcher collapsed={collapsed} />}

        {/* ── Site badge utilisateur normal ── */}
        {!isSuperAdmin && !collapsed && user?.site && (
          <div className="mx-3 mt-2 flex items-center gap-2 bg-sidebar-accent/30 rounded-lg px-3 py-2">
            <MapPin className="w-3.5 h-3.5 text-sidebar-foreground/50 shrink-0" />
            <span className="text-xs font-medium text-sidebar-foreground/70 truncate">{user.site.nom}</span>
          </div>
        )}

        {/* ── Nav principale ── */}
        <nav className={`flex-1 overflow-y-auto overflow-x-hidden mt-3 ${collapsed ? 'flex flex-col items-center gap-1 px-0' : 'px-2 space-y-0.5'}`}>
          {mainLinks.map(link => (
            <NavItem key={link.to} {...link} collapsed={collapsed} />
          ))}
        </nav>

        {/* ── Section bas ── */}
        <div className={`border-t border-sidebar-border py-2 ${collapsed ? 'flex flex-col items-center gap-1' : 'px-2 space-y-0.5'}`}>
          {isAdmin && <NavItem to="/admin" label="Administration" icon={ShieldCheck} collapsed={collapsed} />}
          <NavItem to="/profil" label={user?.name ?? 'Mon profil'} icon={UserCircle} collapsed={collapsed} />

          {!collapsed && (
            <button onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs text-sidebar-foreground/40 hover:text-red-400 hover:bg-red-500/10 transition-colors">
              <LogOut className="w-4 h-4 shrink-0" />Se déconnecter
            </button>
          )}
          {collapsed && (
            <button onClick={logout} title="Se déconnecter"
              className="group relative flex items-center justify-center w-10 h-10 rounded-md text-sidebar-foreground/40 hover:text-red-400 hover:bg-red-500/10 transition-colors">
              <LogOut className="w-[18px] h-[18px]" />
              <span className="pointer-events-none absolute left-full ml-3 z-50 bg-popover text-popover-foreground border text-xs font-medium px-2.5 py-1.5 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Se déconnecter
              </span>
            </button>
          )}
        </div>

        {!collapsed && (
          <div className="px-4 pb-3 text-[10px] text-sidebar-foreground/25 truncate">© 2025 Maintenance BG</div>
        )}
      </aside>

      {/* ══ MAIN ══ */}
      <main
        className="flex-1 overflow-auto transition-all duration-300 ease-in-out min-h-screen"
        style={{ marginLeft: collapsed ? '64px' : '256px' }}
      >
        <Outlet />
      </main>
    </div>
  );
}
