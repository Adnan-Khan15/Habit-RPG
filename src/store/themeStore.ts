import { create } from 'zustand';
import type { ThemeMode } from '../types';

interface ThemeState {
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
}

function getInitialMode(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  return (localStorage.getItem('theme') as ThemeMode) ?? 'dark';
}

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  if (mode === 'light') {
    root.classList.remove('dark');
    root.style.setProperty('--bg-primary', '#f8f9fa');
    root.style.setProperty('--bg-card', '#ffffff');
    root.style.setProperty('--bg-elevated', '#f1f5f9');
    root.style.setProperty('--border', '#e2e8f0');
    root.style.setProperty('--text-primary', '#1a202c');
    root.style.setProperty('--text-muted', '#718096');
  } else {
    root.classList.add('dark');
    if (mode === 'oled') {
      root.style.setProperty('--bg-primary', '#000000');
      root.style.setProperty('--bg-card', '#0a0a0a');
      root.style.setProperty('--bg-elevated', '#111111');
      root.style.setProperty('--border', '#1a1a1a');
      root.style.setProperty('--text-primary', '#e2e8f0');
      root.style.setProperty('--text-muted', '#64748b');
    } else {
      root.style.setProperty('--bg-primary', '#0f0f1a');
      root.style.setProperty('--bg-card', '#1a1a2e');
      root.style.setProperty('--bg-elevated', '#16213e');
      root.style.setProperty('--border', '#1e293b');
      root.style.setProperty('--text-primary', '#f1f5f9');
      root.style.setProperty('--text-muted', '#64748b');
    }
  }
}

export const useThemeStore = create<ThemeState>((set, get) => {
  const initial = getInitialMode();
  applyTheme(initial);
  return {
    mode: initial,
    isDark: initial !== 'light',
    setMode: (mode) => {
      localStorage.setItem('theme', mode);
      applyTheme(mode);
      set({ mode, isDark: mode !== 'light' });
    },
    toggle: () => {
      const current = get().mode;
      const next = current === 'dark' ? 'light' : current === 'light' ? 'oled' : 'dark';
      get().setMode(next);
    },
  };
});
