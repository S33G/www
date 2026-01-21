/**
 * Simplified preferences system for ASCII blog
 */

const STORAGE_KEY = 'ascii-blog-preferences';

export type Theme = 'dark' | 'light' | 'system';
export type EffectType = 'none' | 'wave' | 'matrix' | 'pulse' | 'glitch';
export type ColorTheme = 'green' | 'blue' | 'purple' | 'amber' | 'rose' | 'slate';

export interface Preferences {
  theme: Theme;
  effect: EffectType;
  speed: number; // 0.25 - 3
  colorTheme: ColorTheme;
  intensity: number; // 0.1 - 1
  autoCycle: boolean;
  showFps: boolean;
}

export const DEFAULT_PREFERENCES: Preferences = {
  theme: 'dark',
  effect: 'wave',
  speed: 1,
  colorTheme: 'green',
  intensity: 0.6,
  autoCycle: true,
  showFps: false,
};

// Color themes with primary (UI) and background (ASCII effect) colors
export const COLOR_THEMES: Record<ColorTheme, {
  name: string;
  primary: string;
  primaryLight: string;
  bgTint: string;
  bgGlow: string;
}> = {
  green: {
    name: 'Emerald',
    primary: '#10b981',
    primaryLight: '#34d399',
    bgTint: 'rgba(16, 185, 129, 0.15)',
    bgGlow: 'rgba(16, 185, 129, 0.4)',
  },
  blue: {
    name: 'Ocean',
    primary: '#3b82f6',
    primaryLight: '#60a5fa',
    bgTint: 'rgba(59, 130, 246, 0.15)',
    bgGlow: 'rgba(59, 130, 246, 0.4)',
  },
  purple: {
    name: 'Violet',
    primary: '#8b5cf6',
    primaryLight: '#a78bfa',
    bgTint: 'rgba(139, 92, 246, 0.15)',
    bgGlow: 'rgba(139, 92, 246, 0.4)',
  },
  amber: {
    name: 'Amber',
    primary: '#f59e0b',
    primaryLight: '#fbbf24',
    bgTint: 'rgba(245, 158, 11, 0.15)',
    bgGlow: 'rgba(245, 158, 11, 0.4)',
  },
  rose: {
    name: 'Rose',
    primary: '#f43f5e',
    primaryLight: '#fb7185',
    bgTint: 'rgba(244, 63, 94, 0.15)',
    bgGlow: 'rgba(244, 63, 94, 0.4)',
  },
  slate: {
    name: 'Slate',
    primary: '#64748b',
    primaryLight: '#94a3b8',
    bgTint: 'rgba(100, 116, 139, 0.15)',
    bgGlow: 'rgba(100, 116, 139, 0.4)',
  },
};

export const EFFECT_INFO: Record<EffectType, { name: string; description: string }> = {
  none: { name: 'None', description: 'Clean background' },
  wave: { name: 'Wave', description: 'Gentle ripples' },
  matrix: { name: 'Rain', description: 'Falling characters' },
  pulse: { name: 'Pulse', description: 'Radiating circles' },
  glitch: { name: 'Glitch', description: 'Digital noise' },
};

/**
 * Load preferences from localStorage
 */
export function loadPreferences(): Preferences {
  if (typeof window === 'undefined') return { ...DEFAULT_PREFERENCES };

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_PREFERENCES, ...parsed };
    }
  } catch (e) {
    console.warn('Failed to load preferences:', e);
  }

  return { ...DEFAULT_PREFERENCES };
}

/**
 * Save preferences to localStorage
 */
export function savePreferences(prefs: Partial<Preferences>): Preferences {
  if (typeof window === 'undefined') return { ...DEFAULT_PREFERENCES, ...prefs };

  const current = loadPreferences();
  const updated = { ...current, ...prefs };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save preferences:', e);
  }

  window.dispatchEvent(new CustomEvent('preferences-change', { detail: updated }));

  return updated;
}

/**
 * Apply color theme to CSS custom properties
 */
export function applyColorTheme(colorTheme: ColorTheme): void {
  if (typeof document === 'undefined') return;

  const colors = COLOR_THEMES[colorTheme];
  const root = document.documentElement;

  // Primary colors for UI elements
  root.style.setProperty('--color-primary', colors.primary);
  root.style.setProperty('--color-primary-light', colors.primaryLight);

  // Background tints for ASCII effects
  root.style.setProperty('--ascii-tint', colors.bgTint);
  root.style.setProperty('--ascii-glow', colors.bgGlow);
  root.style.setProperty('--ascii-color', colors.primary);
}

/**
 * Apply theme to document
 */
export function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return;

  const resolved = theme === 'system'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme;

  document.documentElement.setAttribute('data-theme', resolved);
}

/**
 * Get resolved theme
 */
export function getResolvedTheme(theme: Theme): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark';

  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  return theme;
}

/**
 * Initialize preferences on page load
 */
export function initPreferences(): Preferences {
  const prefs = loadPreferences();
  applyTheme(prefs.theme);
  applyColorTheme(prefs.colorTheme);

  if (typeof window !== 'undefined') {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      const current = loadPreferences();
      if (current.theme === 'system') {
        applyTheme('system');
      }
    });
  }

  return prefs;
}

/**
 * Script to inject in <head> to prevent flash
 */
export const preferencesScript = `
(function() {
  try {
    const stored = localStorage.getItem('${STORAGE_KEY}');
    if (stored) {
      const prefs = JSON.parse(stored);
      if (prefs.theme === 'dark' || prefs.theme === 'light') {
        document.documentElement.setAttribute('data-theme', prefs.theme);
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
      }
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  } catch (e) {}
})();
`;
