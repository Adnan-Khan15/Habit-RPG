import { NavLink } from 'react-router-dom';
import { useCharacterStore } from '../../store/characterStore';
import { useAuthStore } from '../../store/authStore';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';

const navItems = [
  { to: '/dashboard/tasks', label: 'Tasks', icon: '📋' },
  { to: '/dashboard/character', label: 'Character', icon: '👤' },
  { to: '/dashboard/store', label: 'Store', icon: '🏪' },
  { to: '/dashboard/social', label: 'Social', icon: '👥' },
  { to: '/dashboard/profile', label: 'Profile', icon: '👤' },
  { to: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
  { to: '/dashboard/about', label: 'About', icon: '📖' },
];

export function Sidebar() {
  const profile = useCharacterStore((s) => s.profile);
  const signOut = useAuthStore((s) => s.signOut);

  return (
    <aside className="hidden md:flex flex-col w-64 bg-bg-card border-r border-border h-screen sticky top-0">
      <div className="p-4 border-b border-border">
        {profile && (
          <div className="flex items-center gap-3">
            <Avatar src={profile.avatar_url} name={profile.display_name || profile.username} size="sm" />
            <div>
              <h1 className="text-xl font-display text-accent-gold">Habit RPG</h1>
              <p className="text-xs text-text-muted">
                Lv.{profile.level} {profile.display_name ?? profile.username}
              </p>
            </div>
          </div>
        )}
        {!profile && (
          <h1 className="text-xl font-display text-accent-gold">Habit RPG</h1>
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
