import { useState, useEffect, useCallback, useRef } from 'react';
import {
  loadPreferences,
  savePreferences,
  applyTheme,
  applyColorTheme,
  COLOR_THEMES,
  EFFECT_INFO,
  DEFAULT_PREFERENCES,
  type Preferences,
  type Theme,
  type EffectType,
  type ColorTheme,
} from '@/lib/preferences';

export default function SettingsPanel() {
  // Initialize with defaults to avoid hydration mismatch
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [isOpen, setIsOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const prefsRef = useRef(prefs);
  prefsRef.current = prefs;

  const cycleIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const dispatchEffectChange = useCallback((p: Preferences) => {
    window.dispatchEvent(new CustomEvent('ascii-settings-change', {
      detail: {
        effect: p.effect,
        speed: p.speed,
        intensity: p.intensity,
        color: COLOR_THEMES[p.colorTheme].primary,
      }
    }));
  }, []);

  const stopAutoCycle = useCallback(() => {
    if (cycleIntervalRef.current) {
      clearTimeout(cycleIntervalRef.current);
      cycleIntervalRef.current = null;
    }
  }, []);

  const startAutoCycle = useCallback(() => {
    stopAutoCycle();

    const scheduleNextCycle = () => {
      const randomDelay = Math.random() * 16000 + 4000;
      cycleIntervalRef.current = setTimeout(() => {
        const effects: EffectType[] = ['wave', 'matrix', 'pulse', 'glitch'];
        const currentPrefs = prefsRef.current;
        const currentIdx = effects.indexOf(currentPrefs.effect);
        const nextIdx = (currentIdx + 1) % effects.length;
        updatePreferenceRef.current('effect', effects[nextIdx]);
        scheduleNextCycle();
      }, randomDelay);
    };

    scheduleNextCycle();
  }, [stopAutoCycle]);

  const updatePreference = useCallback(<K extends keyof Preferences>(
    key: K,
    value: Preferences[K]
  ) => {
    const updated = savePreferences({ [key]: value });
    setPrefs(updated);

    if (key === 'theme') {
      applyTheme(value as Theme);
    } else if (key === 'colorTheme') {
      applyColorTheme(value as ColorTheme);
      dispatchEffectChange(updated);
    } else if (key === 'autoCycle') {
      if (value) {
        startAutoCycle();
      } else {
        stopAutoCycle();
      }
    } else {
      dispatchEffectChange(updated);
    }
  }, [dispatchEffectChange, startAutoCycle, stopAutoCycle]);

  const updatePreferenceRef = useRef(updatePreference);
  updatePreferenceRef.current = updatePreference;

  useEffect(() => {
    // Load preferences from localStorage after hydration
    const storedPrefs = loadPreferences();
    setPrefs(storedPrefs);
    setIsHydrated(true);

    applyTheme(storedPrefs.theme);
    applyColorTheme(storedPrefs.colorTheme);
    dispatchEffectChange(storedPrefs);

    if (storedPrefs.autoCycle) {
      startAutoCycle();
    }

    return () => {
      stopAutoCycle();
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const themes: { value: Theme; label: string }[] = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'Auto' },
  ];

  const effects: { value: EffectType }[] = [
    { value: 'none' },
    { value: 'wave' },
    { value: 'matrix' },
    { value: 'pulse' },
    { value: 'glitch' },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="settings-toggle"
        aria-label="Toggle settings"
        aria-expanded={isOpen}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>

      <div className={`settings-panel ${isOpen ? 'open' : ''}`}>
        <div className="settings-header">
          <h3>Settings</h3>
          <button onClick={() => setIsOpen(false)} className="close-btn" aria-label="Close settings">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="settings-content">
          {/* Theme */}
          <div className="setting-section">
            <label className="setting-label">Appearance</label>
            <div className="segment-control">
              {themes.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => updatePreference('theme', value)}
                  className={`segment-btn ${prefs.theme === value ? 'active' : ''}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Color Theme */}
          <div className="setting-section">
            <label className="setting-label">Accent Color</label>
            <div className="color-pills">
              {(Object.keys(COLOR_THEMES) as ColorTheme[]).map((theme) => (
                <button
                  key={theme}
                  onClick={() => updatePreference('colorTheme', theme)}
                  className={`color-pill ${prefs.colorTheme === theme ? 'active' : ''}`}
                  style={{ '--pill-color': COLOR_THEMES[theme].primary } as React.CSSProperties}
                  title={COLOR_THEMES[theme].name}
                  aria-label={COLOR_THEMES[theme].name}
                >
                  <span className="color-dot" />
                </button>
              ))}
            </div>
          </div>

          {/* Effect */}
          <div className="setting-section">
            <label className="setting-label">Background Effect</label>
            <div className="effect-list">
              {effects.map(({ value }) => (
                <button
                  key={value}
                  onClick={() => updatePreference('effect', value)}
                  className={`effect-item ${prefs.effect === value ? 'active' : ''}`}
                >
                  <span className="effect-name">{EFFECT_INFO[value].name}</span>
                  <span className="effect-desc">{EFFECT_INFO[value].description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Speed & Intensity */}
          <div className="setting-section">
            <div className="slider-group">
              <label className="setting-label">
                Speed
                <span className="value-badge">{prefs.speed.toFixed(1)}×</span>
              </label>
              <input
                type="range"
                min="0.25"
                max="3"
                step="0.25"
                value={prefs.speed}
                onChange={(e) => updatePreference('speed', parseFloat(e.target.value))}
                className="slider"
              />
            </div>
          </div>

          <div className="setting-section">
            <div className="slider-group">
              <label className="setting-label">
                Intensity
                <span className="value-badge">{Math.round(prefs.intensity * 100)}%</span>
              </label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={prefs.intensity}
                onChange={(e) => updatePreference('intensity', parseFloat(e.target.value))}
                className="slider"
              />
            </div>
          </div>

          {/* Auto Cycle */}
          <div className="setting-section">
            <label className="toggle-label">
              <span className="toggle-text">Auto-cycle effects</span>
              <div className={`toggle ${prefs.autoCycle ? 'active' : ''}`} onClick={() => updatePreference('autoCycle', !prefs.autoCycle)}>
                <div className="toggle-thumb" />
              </div>
            </label>
          </div>
        </div>
      </div>

      {isOpen && <div className="settings-backdrop" onClick={() => setIsOpen(false)} />}

      <style>{`
        .settings-toggle {
          position: fixed;
          bottom: 1.5rem;
          right: 1.5rem;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          z-index: 100;
          box-shadow: var(--shadow-md);
        }

        .settings-toggle:hover {
          background: var(--bg-elevated);
          color: var(--color-primary);
          border-color: var(--color-primary);
          transform: rotate(30deg);
        }

        .settings-panel {
          position: fixed;
          bottom: 5.5rem;
          right: 1.5rem;
          width: 320px;
          max-height: calc(100vh - 8rem);
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius, 12px);
          box-shadow: var(--shadow-lg);
          z-index: 101;
          opacity: 0;
          visibility: hidden;
          transform: translateY(10px);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }

        .settings-panel.open {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid var(--border-color);
        }

        .settings-header h3 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .close-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
        }

        .close-btn:hover {
          background: var(--bg-elevated);
          color: var(--text-primary);
        }

        .settings-content {
          padding: 1rem 1.25rem;
          overflow-y: auto;
          max-height: calc(100vh - 14rem);
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .setting-section {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          opacity: 0;
          animation: slideInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .settings-panel:not(.open) .setting-section {
          animation: none;
          opacity: 0;
        }

        .setting-section:nth-child(1) {
          animation-delay: 0.05s;
        }

        .setting-section:nth-child(2) {
          animation-delay: 0.1s;
        }

        .setting-section:nth-child(3) {
          animation-delay: 0.15s;
        }

        .setting-section:nth-child(4) {
          animation-delay: 0.2s;
        }

        .setting-section:nth-child(5) {
          animation-delay: 0.25s;
        }

        .setting-section:nth-child(6) {
          animation-delay: 0.3s;
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .setting-label {
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.03em;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .value-badge {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          color: var(--color-primary);
          background: var(--ascii-tint);
          padding: 2px 6px;
          border-radius: 4px;
        }

        .segment-control {
          display: flex;
          background: var(--bg-primary);
          border-radius: 8px;
          padding: 3px;
          gap: 2px;
        }

        .segment-btn {
          flex: 1;
          padding: 0.5rem;
          background: transparent;
          border: none;
          border-radius: 6px;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 0.8rem;
          font-weight: 500;
          transition: all 0.15s;
        }

        .segment-btn:hover {
          color: var(--text-primary);
        }

        .segment-btn.active {
          background: var(--bg-card);
          color: var(--text-primary);
          box-shadow: var(--shadow-sm);
        }

        .color-pills {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .color-pill {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 2px solid transparent;
          background: var(--bg-primary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
        }

        .color-pill:hover {
          transform: scale(1.1);
        }

        .color-pill.active {
          border-color: var(--pill-color);
          background: var(--bg-elevated);
        }

        .color-dot {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--pill-color);
        }

        .effect-list {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }

        .effect-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.625rem 0.75rem;
          background: var(--bg-primary);
          border: 1px solid transparent;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s;
        }

        .effect-item:hover {
          background: var(--bg-elevated);
        }

        .effect-item.active {
          border-color: var(--color-primary);
          background: var(--ascii-tint);
        }

        .effect-name {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-primary);
        }

        .effect-item.active .effect-name {
          color: var(--color-primary);
        }

        .effect-desc {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .slider-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .slider {
          width: 100%;
          height: 4px;
          background: var(--bg-primary);
          border-radius: 2px;
          outline: none;
          -webkit-appearance: none;
          appearance: none;
        }

        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          background: var(--color-primary);
          border-radius: 50%;
          cursor: pointer;
          transition: transform 0.15s;
        }

        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.15);
        }

        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: var(--color-primary);
          border-radius: 50%;
          cursor: pointer;
          border: none;
        }

        .toggle-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
        }

        .toggle-text {
          font-size: 0.85rem;
          color: var(--text-primary);
        }

        .toggle {
          width: 44px;
          height: 24px;
          background: var(--bg-primary);
          border-radius: 12px;
          padding: 2px;
          transition: background 0.2s;
          cursor: pointer;
        }

        .toggle.active {
          background: var(--color-primary);
        }

        .toggle-thumb {
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          transition: transform 0.2s;
          box-shadow: var(--shadow-sm);
        }

        .toggle.active .toggle-thumb {
          transform: translateX(20px);
        }

        .settings-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          z-index: 99;
          backdrop-filter: blur(2px);
        }

        @media (max-width: 480px) {
          .settings-panel {
            right: 0.75rem;
            left: 0.75rem;
            bottom: 5rem;
            width: auto;
          }

          .settings-toggle {
            bottom: 1rem;
            right: 1rem;
            width: 44px;
            height: 44px;
          }
        }
      `}</style>
    </>
  );
}
