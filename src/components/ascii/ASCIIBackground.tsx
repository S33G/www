import { useEffect, useRef } from 'react';
import { ASCIIRenderer, type EffectType } from '@/lib/ascii';
import { loadPreferences, COLOR_THEMES } from '@/lib/preferences';

interface ASCIIBackgroundProps {
  effect?: EffectType;
}

// Intensity settings for different page types
const HOME_INTENSITY = 0.8;
const CONTENT_INTENSITY = 0.5;
const REDUCED_MOTION_INTENSITY = 0.25;
const TWEEN_DURATION = 600; // ms

function isHomePage(): boolean {
  return typeof window !== 'undefined' && 
    (window.location.pathname === '/' || window.location.pathname === '');
}

function getPageIntensity(reducedMotion: boolean): number {
  if (reducedMotion) return REDUCED_MOTION_INTENSITY;
  return isHomePage() ? HOME_INTENSITY : CONTENT_INTENSITY;
}

export default function ASCIIBackground({ effect: initialEffect = 'wave' }: ASCIIBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<ASCIIRenderer | null>(null);
  const reducedMotionRef = useRef(false);
  const isMountedRef = useRef(true);

  // Store initialEffect in ref for stable access in effect
  const initialEffectRef = useRef(initialEffect);
  initialEffectRef.current = initialEffect;

  useEffect(() => {
    isMountedRef.current = true;

    // React 19: Define handlers inside useEffect - no useCallback needed
    const initASCII = () => {
      const container = containerRef.current;
      if (!container || !isMountedRef.current) return;

      const prefs = loadPreferences();
      const effect = prefs.effect || initialEffectRef.current;
      const colorTheme = COLOR_THEMES[prefs.colorTheme] || COLOR_THEMES.green;

      reducedMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const intensity = getPageIntensity(reducedMotionRef.current);

      try {
        rendererRef.current = new ASCIIRenderer({
          container,
          effect,
          fontSize: isMobile ? 16 : 14,
          speed: reducedMotionRef.current ? 0.3 : (prefs.speed || 1),
          intensity,
          color: colorTheme.primary,
          backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim() || '#0f0f0f',
        });

        if (reducedMotionRef.current) {
          container.style.opacity = '0.3';
          rendererRef.current.renderStaticFrame();
        } else {
          rendererRef.current.start();
        }
      } catch (error) {
        console.error('Failed to initialize ASCII renderer:', error);
      }
    };

    const handleSettingsChange = (e: Event) => {
      const detail = (e as CustomEvent).detail as {
        effect: EffectType;
        speed: number;
        intensity: number;
        color: string;
      };
      if (rendererRef.current) {
        rendererRef.current.setEffect(detail.effect);
        rendererRef.current.setSpeed(detail.speed);
        rendererRef.current.setIntensity(detail.intensity);
        rendererRef.current.setColor(detail.color);
      }
    };

    const handleEffectChange = (e: Event) => {
      const detail = (e as CustomEvent).detail as EffectType;
      if (rendererRef.current) {
        rendererRef.current.setEffect(detail);
      }
    };

    const handleExplosion = (e: Event) => {
      const detail = (e as CustomEvent).detail as { x: number; y: number };
      if (rendererRef.current) {
        rendererRef.current.triggerExplosion(detail.x, detail.y);
      }
    };

    const handlePageTransition = () => {
      if (!rendererRef.current || reducedMotionRef.current || !isMountedRef.current) return;
      rendererRef.current.setIntensityAnimated(getPageIntensity(reducedMotionRef.current), TWEEN_DURATION);
    };

    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches;
      const container = containerRef.current;
      
      if (rendererRef.current && isMountedRef.current) {
        if (reducedMotionRef.current) {
          rendererRef.current.setSpeed(0.3);
          rendererRef.current.setIntensityAnimated(REDUCED_MOTION_INTENSITY, TWEEN_DURATION);
          if (container) container.style.opacity = '0.3';
        } else {
          rendererRef.current.setSpeed(1);
          rendererRef.current.setIntensityAnimated(getPageIntensity(false), TWEEN_DURATION);
          if (container) container.style.opacity = '';
        }
      }
    };

    const handleAfterSwap = () => {
      if (!isMountedRef.current) return;
      if (rendererRef.current && !reducedMotionRef.current) {
        handlePageTransition();
      } else {
        initASCII();
      }
    };

    const handleBeforeSwap = () => {
      if (rendererRef.current) {
        rendererRef.current.destroy();
        rendererRef.current = null;
      }
    };

    // Initialize
    initASCII();

    // Add event listeners
    window.addEventListener('ascii-settings-change', handleSettingsChange);
    window.addEventListener('ascii-effect-change', handleEffectChange);
    window.addEventListener('ascii-trigger-explosion', handleExplosion);
    document.addEventListener('astro:after-swap', handleAfterSwap);
    document.addEventListener('astro:before-swap', handleBeforeSwap);
    
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionQuery.addEventListener('change', handleReducedMotionChange);

    // Cleanup
    return () => {
      isMountedRef.current = false;
      
      if (rendererRef.current) {
        rendererRef.current.destroy();
        rendererRef.current = null;
      }
      
      window.removeEventListener('ascii-settings-change', handleSettingsChange);
      window.removeEventListener('ascii-effect-change', handleEffectChange);
      window.removeEventListener('ascii-trigger-explosion', handleExplosion);
      document.removeEventListener('astro:after-swap', handleAfterSwap);
      document.removeEventListener('astro:before-swap', handleBeforeSwap);
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="ascii-background"
      className="ascii-background"
      role="img"
      aria-label="Animated ASCII art background"
      aria-hidden={true}
      data-effect={initialEffect}
    />
  );
}
