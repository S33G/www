const THEME_KEY = 'theme';

export type Theme = 'dark' | 'light' | 'system';

/**
 * Get the current theme preference
 */
export function getTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';

  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'dark' || stored === 'light') {
    return stored;
  }

  return 'system';
}

/**
 * Get the resolved theme (accounting for system preference)
 */
export function getResolvedTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark';

  const theme = getTheme();

  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  return theme;
}

/**
 * Set the theme
 */
export function setTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;

  if (theme === 'system') {
    localStorage.removeItem(THEME_KEY);
  } else {
    localStorage.setItem(THEME_KEY, theme);
  }

  applyTheme(theme);
}

/**
 * Apply the theme to the document
 */
export function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return;

  const resolved = theme === 'system'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme;

  document.documentElement.setAttribute('data-theme', resolved);
}

/**
 * Toggle between dark and light themes
 */
export function toggleTheme(): void {
  const current = getResolvedTheme();
  setTheme(current === 'dark' ? 'light' : 'dark');
}

/**
 * Initialize theme on page load
 */
export function initTheme(): void {
  if (typeof window === 'undefined') return;

  const theme = getTheme();
  applyTheme(theme);

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (getTheme() === 'system') {
      applyTheme('system');
    }
  });
}

/**
 * Script to inject in <head> to prevent flash
 */
export const themeScript = `
(function() {
  const theme = localStorage.getItem('theme');
  if (theme === 'dark' || theme === 'light') {
    document.documentElement.setAttribute('data-theme', theme);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
`;
