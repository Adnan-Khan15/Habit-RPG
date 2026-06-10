import { NavLink } from 'react-router-dom';

const tabs = [
  { to: '/dashboard/tasks', label: 'Tasks', icon: '📋' },
  { to: '/dashboard/character', label: 'Char', icon: '👤' },
  { to: '/dashboard/store', label: 'Store', icon: '🏪' },
  { to: '/dashboard/social', label: 'Social', icon: '👥' },
  { to: '/dashboard/profile', label: 'Profile', icon: '👤' },
  { to: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
];

export function MobileTabBar() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-bg-card border-t border-border">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `flex flex-col items-center py-2 px-3 text-xs transition-colors ${
                isActive ? 'text-accent-gold' : 'text-text-muted'
              }`
            }
          >
            <span className="text-lg">{tab.icon}</span>
            <span className="mt-0.5">{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
