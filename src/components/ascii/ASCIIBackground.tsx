import {
  useEffect,
  useRef,
  useCallback,
  useSyncExternalStore,
  useMemo,
  useState,
} from 'react';
import { ASCIIRenderer, type EffectType } from '@/lib/ascii';
import { ASCIIRendererWebGL, isWebGL2Supported } from '@/lib/ascii/ASCIIRendererWebGL';
import { loadPreferences, COLOR_THEMES } from '@/lib/preferences';

type Renderer = ASCIIRenderer | ASCIIRendererWebGL;

interface ASCIIBackgroundProps {
  effect?: EffectType;
}

const HOME_INTENSITY = 0.8;
const CONTENT_INTENSITY = 0.5;
const REDUCED_MOTION_INTENSITY = 0.25;
const TWEEN_DURATION = 600;

// ============================================================================
// Custom Hooks
// ============================================================================

/**
 * Subscribe to a media query reactively
 */
function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (callback: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener('change', callback);
      return () => mq.removeEventListener('change', callback);
    },
    [query]
  );

  const getSnapshot = useCallback(
    () => window.matchMedia(query).matches,
    [query]
  );

  return useSyncExternalStore(subscribe, getSnapshot);
}

/**
 * Track current page path reactively
 */
function useIsHomePage(): boolean {
  const subscribe = useCallback((callback: () => void) => {
    document.addEventListener('astro:after-swap', callback);
    window.addEventListener('popstate', callback);
    return () => {
      document.removeEventListener('astro:after-swap', callback);
      window.removeEventListener('popstate', callback);
    };
  }, []);

  const getSnapshot = useCallback(() => {
    const path = window.location.pathname;
    return path === '/' || path === '';
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot);
}

/**
 * Event listener hook with automatic cleanup
 */
function useEventListener(
  eventName: string,
  handler: (event: Event) => void,
  target: 'window' | 'document' = 'window'
): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const element = target === 'document' ? document : window;
    const listener = (e: Event) => handlerRef.current(e);

    element.addEventListener(eventName, listener);
    return () => element.removeEventListener(eventName, listener);
  }, [eventName, target]);
}

/**
 * Subscribe to typed custom events
 */
function useCustomEvent<T>(
  eventName: string,
  handler: (detail: T) => void
): void {
  const callback = useCallback(
    (e: Event) => handler((e as CustomEvent<T>).detail),
    [handler]
  );
  useEventListener(eventName, callback);
}

// ============================================================================
// Renderer Hook
// ============================================================================

function useASCIIRenderer(
  containerRef: React.RefObject<HTMLDivElement | null>,
  reducedMotion: boolean,
  isHomePage: boolean,
  initialEffect: EffectType
) {
  const rendererRef = useRef<Renderer | null>(null);
  const useWebGLRef = useRef(isWebGL2Supported());

  const intensity = useMemo(() => {
    if (reducedMotion) return REDUCED_MOTION_INTENSITY;
    return isHomePage ? HOME_INTENSITY : CONTENT_INTENSITY;
  }, [reducedMotion, isHomePage]);

  const init = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    // Cleanup existing
    rendererRef.current?.destroy();
    rendererRef.current = null;

    const prefs = loadPreferences();
    const config = {
      container,
      effect: prefs.effect || initialEffect,
      fontSize: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? 16 : 14,
      speed: reducedMotion ? 0.3 : (prefs.speed || 1),
      intensity,
      color: (COLOR_THEMES[prefs.colorTheme] || COLOR_THEMES.green).primary,
      backgroundColor: getComputedStyle(document.documentElement)
        .getPropertyValue('--bg-primary').trim() || '#0f0f0f',
    };

    try {
      rendererRef.current = useWebGLRef.current
        ? new ASCIIRendererWebGL(config)
        : new ASCIIRenderer(config);

      if (reducedMotion) {
        container.style.opacity = '0.3';
        rendererRef.current.renderStaticFrame();
      } else {
        rendererRef.current.start();
      }
    } catch (err) {
      console.error('Renderer init failed:', err);
      if (useWebGLRef.current) {
        useWebGLRef.current = false;
        try {
          rendererRef.current = new ASCIIRenderer(config);
          if (reducedMotion) {
            rendererRef.current.renderStaticFrame();
          } else {
            rendererRef.current.start();
          }
        } catch (e) {
          console.error('Fallback failed:', e);
        }
      }
    }
  }, [containerRef, initialEffect, reducedMotion, intensity]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      rendererRef.current?.destroy();
      rendererRef.current = null;
    };
  }, []);

  return { rendererRef, init, intensity };
}

// ============================================================================
// Component
// ============================================================================

export default function ASCIIBackground({ effect: initialEffect = 'wave' }: ASCIIBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const isHomePage = useIsHomePage();
  const [showFps, setShowFps] = useState(false);
  const [fps, setFps] = useState<number | null>(null);

  const { rendererRef, init, intensity } = useASCIIRenderer(
    containerRef,
    reducedMotion,
    isHomePage,
    initialEffect
  );

  // Initialize on mount
  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    const prefs = loadPreferences();
    setShowFps(Boolean(prefs.showFps));
  }, []);

  // React to reduced motion changes
  useEffect(() => {
    const r = rendererRef.current;
    const c = containerRef.current;
    if (!r) return;

    if (reducedMotion) {
      r.setSpeed(0.3);
      r.setIntensityAnimated(REDUCED_MOTION_INTENSITY, TWEEN_DURATION);
      if (c) c.style.opacity = '0.3';
    } else {
      r.setSpeed(1);
      r.setIntensityAnimated(intensity, TWEEN_DURATION);
      if (c) c.style.opacity = '';
    }
  }, [reducedMotion, intensity, rendererRef]);

  // React to page changes
  useEffect(() => {
    const r = rendererRef.current;
    if (r && !reducedMotion) {
      r.setIntensityAnimated(intensity, TWEEN_DURATION);
    }
  }, [isHomePage, intensity, reducedMotion, rendererRef]);

  // Event handlers
  const onSettings = useCallback((d: {
    effect: EffectType;
    speed: number;
    intensity: number;
    color: string;
    showFps?: boolean;
  }) => {
    const r = rendererRef.current;
    if (typeof d.showFps === 'boolean') {
      setShowFps(d.showFps);
    }
    if (!r) return;
    r.setEffect(d.effect);
    r.setSpeed(d.speed);
    r.setIntensity(d.intensity);
    r.setColor(d.color);
  }, [rendererRef]);

  const onEffect = useCallback((e: EffectType) => {
    rendererRef.current?.setEffect(e);
  }, [rendererRef]);

  const onExplosion = useCallback((d: { x: number; y: number }) => {
    rendererRef.current?.triggerExplosion(d.x, d.y);
  }, [rendererRef]);

  const onBeforeSwap = useCallback(() => {
    rendererRef.current?.destroy();
    rendererRef.current = null;
  }, [rendererRef]);

  const onAfterSwap = useCallback(() => {
    if (!rendererRef.current && !reducedMotion) init();
  }, [rendererRef, reducedMotion, init]);

  // Subscribe to events
  useCustomEvent('ascii-settings-change', onSettings);
  useCustomEvent('ascii-effect-change', onEffect);
  useCustomEvent('ascii-trigger-explosion', onExplosion);
  useEventListener('astro:before-swap', onBeforeSwap, 'document');
  useEventListener('astro:after-swap', onAfterSwap, 'document');

  useEffect(() => {
    if (!showFps) {
      setFps(null);
      return;
    }

    const interval = window.setInterval(() => {
      const r = rendererRef.current;
      if (!r) return;
      const metrics = r.getPerformanceMetrics?.();
      if (metrics) {
        setFps(metrics.fps);
      }
    }, 500);

    return () => window.clearInterval(interval);
  }, [showFps, rendererRef]);

  return (
    <div
      ref={containerRef}
      id="ascii-background"
      className="ascii-background"
      role="img"
      aria-label="Animated ASCII art background"
      aria-hidden={true}
      data-effect={initialEffect}
    >
      {showFps && (
        <div className="ascii-fps" aria-hidden="true">
          {fps ? `${fps} fps` : '...'}
        </div>
      )}
    </div>
  );
}
