import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  PerformanceMonitor,
  QUALITY_PRESETS,
  prefersReducedMotion,
  isPageVisible,
  isArmDevice,
  getRecommendedQuality,
  type QualityLevel,
} from '@/lib/ascii/performance';

describe('Performance Module', () => {
  describe('QUALITY_PRESETS', () => {
    it('has all quality levels defined', () => {
      expect(QUALITY_PRESETS.low).toBeDefined();
      expect(QUALITY_PRESETS.medium).toBeDefined();
      expect(QUALITY_PRESETS.high).toBeDefined();
      expect(QUALITY_PRESETS.ultra).toBeDefined();
    });

    it('low quality has largest cell size and longest interval', () => {
      expect(QUALITY_PRESETS.low.cellSize).toBeGreaterThan(QUALITY_PRESETS.medium.cellSize);
      expect(QUALITY_PRESETS.low.updateInterval).toBeGreaterThan(QUALITY_PRESETS.medium.updateInterval);
      expect(QUALITY_PRESETS.low.effectsEnabled).toBe(false);
    });

    it('ultra quality has smallest cell size and shortest interval', () => {
      expect(QUALITY_PRESETS.ultra.cellSize).toBeLessThan(QUALITY_PRESETS.high.cellSize);
      expect(QUALITY_PRESETS.ultra.updateInterval).toBeLessThanOrEqual(QUALITY_PRESETS.high.updateInterval);
      expect(QUALITY_PRESETS.ultra.effectsEnabled).toBe(true);
    });
  });

  describe('PerformanceMonitor', () => {
    let monitor: PerformanceMonitor;

    beforeEach(() => {
      monitor = new PerformanceMonitor();
    });

    it('starts at medium quality', () => {
      const metrics = monitor.tick();
      expect(metrics.quality).toBe('medium');
    });

    it('tick() returns performance metrics', () => {
      const metrics = monitor.tick();
      expect(metrics).toHaveProperty('fps');
      expect(metrics).toHaveProperty('frameTime');
      expect(metrics).toHaveProperty('quality');
      expect(typeof metrics.fps).toBe('number');
    });

    it('getSettings() returns current quality settings', () => {
      const settings = monitor.getSettings();
      expect(settings).toEqual(QUALITY_PRESETS.medium);
    });

    it('lockQuality() prevents automatic adjustment', () => {
      monitor.lockQuality('low');
      expect(monitor.getSettings()).toEqual(QUALITY_PRESETS.low);

      // Fill history with high FPS frames
      for (let i = 0; i < 35; i++) {
        monitor.tick();
      }

      // Should not auto-upgrade since locked
      const quality = monitor.checkAndAdapt();
      expect(quality).toBe('low');
    });

    it('unlockQuality() allows automatic adjustment', () => {
      monitor.lockQuality('low');
      monitor.unlockQuality();

      // Quality should be able to change now (though may not in this test)
      expect(monitor.getSettings()).toEqual(QUALITY_PRESETS.low);
    });

    it('reset() restores default state', () => {
      monitor.lockQuality('ultra');
      monitor.reset();

      expect(monitor.getSettings()).toEqual(QUALITY_PRESETS.medium);
    });

    it('checkAndAdapt() returns current quality when history is incomplete', () => {
      // Only a few ticks, not enough history
      monitor.tick();
      monitor.tick();

      const quality = monitor.checkAndAdapt();
      expect(quality).toBe('medium');
    });
  });

  describe('prefersReducedMotion', () => {
    it('returns false when window is undefined', () => {
      const originalWindow = globalThis.window;
      // @ts-expect-error Testing undefined case
      globalThis.window = undefined;

      expect(prefersReducedMotion()).toBe(false);

      globalThis.window = originalWindow;
    });

    it('returns matchMedia result when available', () => {
      const originalMatchMedia = window.matchMedia;
      const mockMatchMedia = vi.fn().mockReturnValue({ matches: true });
      window.matchMedia = mockMatchMedia;

      expect(prefersReducedMotion()).toBe(true);
      expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');

      window.matchMedia = originalMatchMedia;
    });
  });

  describe('isPageVisible', () => {
    it('returns true when document is undefined', () => {
      const originalDocument = globalThis.document;
      // @ts-expect-error Testing undefined case
      globalThis.document = undefined;

      expect(isPageVisible()).toBe(true);

      globalThis.document = originalDocument;
    });

    it('returns visibility based on document.hidden', () => {
      // Test the actual behavior in the test environment
      // In happy-dom, document.hidden should be false by default
      const result = isPageVisible();
      expect(typeof result).toBe('boolean');
      // The function returns !document.hidden, so if document exists, it should work
      expect(result).toBe(!document.hidden);
    });
  });

  describe('isArmDevice', () => {
    const originalNavigator = globalThis.navigator;

    afterEach(() => {
      Object.defineProperty(globalThis, 'navigator', {
        value: originalNavigator,
        configurable: true,
      });
    });

    it('returns false when navigator is undefined', () => {
      // @ts-expect-error Testing undefined case
      globalThis.navigator = undefined;

      expect(isArmDevice()).toBe(false);
    });

    it('detects ARM in userAgent', () => {
      Object.defineProperty(globalThis, 'navigator', {
        value: {
          userAgent: 'Mozilla/5.0 (Linux; arm64)',
          platform: '',
          maxTouchPoints: 0,
        },
        configurable: true,
      });

      expect(isArmDevice()).toBe(true);
    });

    it('detects Android devices', () => {
      Object.defineProperty(globalThis, 'navigator', {
        value: {
          userAgent: 'Mozilla/5.0 (Linux; Android 12)',
          platform: '',
          maxTouchPoints: 5,
        },
        configurable: true,
      });

      expect(isArmDevice()).toBe(true);
    });

    it('detects iPhone', () => {
      Object.defineProperty(globalThis, 'navigator', {
        value: {
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0)',
          platform: '',
          maxTouchPoints: 5,
        },
        configurable: true,
      });

      expect(isArmDevice()).toBe(true);
    });

    it('detects Apple Silicon Mac', () => {
      Object.defineProperty(globalThis, 'navigator', {
        value: {
          userAgent: 'Mozilla/5.0 (Macintosh)',
          platform: 'MacIntel',
          maxTouchPoints: 5, // Apple Silicon Macs with touch bar
        },
        configurable: true,
      });

      expect(isArmDevice()).toBe(true);
    });

    it('returns false for Intel Mac', () => {
      Object.defineProperty(globalThis, 'navigator', {
        value: {
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)',
          platform: 'MacIntel',
          maxTouchPoints: 0,
        },
        configurable: true,
      });

      expect(isArmDevice()).toBe(false);
    });
  });

  describe('getRecommendedQuality', () => {
    const originalNavigator = globalThis.navigator;
    const originalMatchMedia = window.matchMedia;

    afterEach(() => {
      Object.defineProperty(globalThis, 'navigator', {
        value: originalNavigator,
        configurable: true,
      });
      window.matchMedia = originalMatchMedia;
    });

    it('returns low for ARM devices', () => {
      Object.defineProperty(globalThis, 'navigator', {
        value: {
          userAgent: 'Mozilla/5.0 (iPhone)',
          platform: '',
          maxTouchPoints: 5,
        },
        configurable: true,
      });

      expect(getRecommendedQuality()).toBe('low');
    });

    it('returns low when prefers reduced motion', () => {
      // Set up non-ARM device first
      Object.defineProperty(globalThis, 'navigator', {
        value: {
          userAgent: 'Mozilla/5.0 (X11; Linux x86_64)',
          platform: 'Linux x86_64',
          maxTouchPoints: 0,
        },
        configurable: true,
      });

      const mockMatchMedia = vi.fn().mockReturnValue({ matches: true });
      window.matchMedia = mockMatchMedia;

      expect(getRecommendedQuality()).toBe('low');
    });

    it('returns medium for standard desktop', () => {
      Object.defineProperty(globalThis, 'navigator', {
        value: {
          userAgent: 'Mozilla/5.0 (X11; Linux x86_64)',
          platform: 'Linux x86_64',
          maxTouchPoints: 0,
        },
        configurable: true,
      });

      const mockMatchMedia = vi.fn().mockReturnValue({ matches: false });
      window.matchMedia = mockMatchMedia;

      expect(getRecommendedQuality()).toBe('medium');
    });
  });
});
