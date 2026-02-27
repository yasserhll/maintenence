import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ArrowDownToLine, ArrowUpFromLine, ClipboardList, Wrench } from 'lucide-react';

const links = [
  { to: '/',           label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/stock',      label: 'Stock Actuel',    icon: Package },
  { to: '/entrees',    label: 'Entrées',          icon: ArrowDownToLine },
  { to: '/sorties',    label: 'Sorties',          icon: ArrowUpFromLine },
  { to: '/inventaire', label: 'Inventaire',       icon: ClipboardList },
];

export default function AppSidebar() {
  return (
    <aside className="w-64 min-h-screen bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border">
      <div className="p-5 flex items-center gap-3 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-lg bg-sidebar-primary flex items-center justify-center">
          <Wrench className="w-5 h-5 text-sidebar-primary-foreground" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-sidebar-primary-foreground tracking-wide">GMAO</h1>
          <p className="text-xs text-sidebar-foreground/60">Site Benguerir</p>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
              }`
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-sidebar-border text-xs text-sidebar-foreground/40">
        © 2025 Maintenance BG
      </div>
    </aside>
  );
}
