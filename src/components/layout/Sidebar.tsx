import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/Button';

const navItems = [
  { to: '/dashboard/tasks', label: 'Tasks', icon: '📋' },
  { to: '/dashboard/character', label: 'Character', icon: '👤' },
  { to: '/dashboard/store', label: 'Store', icon: '🏪' },
  { to: '/dashboard/social', label: 'Social', icon: '👥' },
  { to: '/dashboard/profile', label: 'Profile', icon: '⚙️' },
];

export function Sidebar() {
  const profile = useAuthStore((s) => s.profile);
  const signOut = useAuthStore((s) => s.signOut);

  return (
    <aside className="hidden md:flex flex-col w-64 bg-bg-card border-r border-border h-screen sticky top-0">
      <div className="p-4 border-b border-border">
        <h1 className="text-xl font-display text-accent-gold">Habit RPG</h1>
        {profile && (
          <p className="text-xs text-text-muted mt-1">
            Lv.{profile.level} {profile.display_name}
          </p>
        )}
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-accent-purple/20 text-accent-purple'
                  : 'text-text-muted hover:text-text-primary hover:bg-white/5'
              }`
            }
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <Button variant="ghost" size="sm" className="w-full" onClick={signOut}>
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
