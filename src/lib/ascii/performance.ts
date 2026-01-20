/**
 * Performance monitoring and adaptive quality for ASCII renderer
 */

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  quality: QualityLevel;
}

export type QualityLevel = 'low' | 'medium' | 'high' | 'ultra';

export interface QualitySettings {
  cellSize: number;
  effectsEnabled: boolean;
  maxParticles: number;
  updateInterval: number;
}

export const QUALITY_PRESETS: Record<QualityLevel, QualitySettings> = {
  low: {
    cellSize: 20,
    effectsEnabled: false,
    maxParticles: 25,
    updateInterval: 66, // ~15fps
  },
  medium: {
    cellSize: 16,
    effectsEnabled: true,
    maxParticles: 50,
    updateInterval: 50, // ~20fps
  },
  high: {
    cellSize: 12,
    effectsEnabled: true,
    maxParticles: 100,
    updateInterval: 33, // ~30fps
  },
  ultra: {
    cellSize: 10,
    effectsEnabled: true,
    maxParticles: 200,
    updateInterval: 16, // ~60fps
  },
};

export class PerformanceMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private fps = 60;
  private frameTimeHistory: number[] = [];
  private readonly historySize = 30;
  private currentQuality: QualityLevel = 'medium';
  private qualityLocked: boolean = false;

  /**
   * Call this every frame to update metrics
   */
  tick(): PerformanceMetrics {
    const now = performance.now();
    const frameTime = now - this.lastTime;
    this.lastTime = now;
    this.frameCount++;

    this.frameTimeHistory.push(frameTime);
    if (this.frameTimeHistory.length > this.historySize) {
      this.frameTimeHistory.shift();
    }

    // Calculate rolling average FPS
    const avgFrameTime =
      this.frameTimeHistory.reduce((a, b) => a + b, 0) / this.frameTimeHistory.length;
    this.fps = 1000 / avgFrameTime;

    return {
      fps: Math.round(this.fps),
      frameTime: Math.round(avgFrameTime * 100) / 100,
      quality: this.currentQuality,
    };
  }

  /**
   * Check performance and suggest quality adjustment
   */
  checkAndAdapt(): QualityLevel {
    if (this.qualityLocked || this.frameTimeHistory.length < this.historySize) {
      return this.currentQuality;
    }

    // More aggressive downgrade threshold
    if (this.fps < 30 && this.currentQuality !== 'low') {
      this.currentQuality = this.decreaseQuality(this.currentQuality);
    } else if (this.fps > 58 && this.currentQuality !== 'ultra') {
      // Only upgrade if consistently hitting 58+ fps
      this.currentQuality = this.increaseQuality(this.currentQuality);
    }

    return this.currentQuality;
  }

  /**
   * Lock quality to prevent auto-adjustment
   */
  lockQuality(quality: QualityLevel): void {
    this.currentQuality = quality;
    this.qualityLocked = true;
  }

  /**
   * Unlock quality for auto-adjustment
   */
  unlockQuality(): void {
    this.qualityLocked = false;
  }

  private decreaseQuality(current: QualityLevel): QualityLevel {
    const levels: QualityLevel[] = ['low', 'medium', 'high', 'ultra'];
    const index = levels.indexOf(current);
    return levels[Math.max(0, index - 1)];
  }

  private increaseQuality(current: QualityLevel): QualityLevel {
    const levels: QualityLevel[] = ['low', 'medium', 'high', 'ultra'];
    const index = levels.indexOf(current);
    return levels[Math.min(levels.length - 1, index + 1)];
  }

  getSettings(): QualitySettings {
    return QUALITY_PRESETS[this.currentQuality];
  }

  reset(): void {
    this.frameCount = 0;
    this.frameTimeHistory = [];
    this.currentQuality = 'medium';
    this.qualityLocked = false;
  }
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Check if page is visible
 */
export function isPageVisible(): boolean {
  if (typeof document === 'undefined') return true;
  return !document.hidden;
}

/**
 * Detect if running on mobile device (for performance adjustments)
 * Note: Apple Silicon Macs should NOT be detected as mobile - they're powerful enough
 */
export function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;

  const ua = navigator.userAgent.toLowerCase();

  // Only detect actual mobile devices, not desktop ARM
  const isMobile = /android|iphone|ipad|ipod|mobile|tablet/i.test(ua);

  return isMobile;
}

/**
 * Detect if on battery power (if API available)
 */
export async function isOnBattery(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !('getBattery' in navigator)) {
    return false;
  }

  try {
    // @ts-expect-error Battery API not in all TS definitions
    const battery = await navigator.getBattery();
    return !battery.charging;
  } catch {
    return false;
  }
}

/**
 * Get recommended initial quality based on device
 */
export function getRecommendedQuality(): QualityLevel {
  if (prefersReducedMotion()) return 'low';
  if (isMobileDevice()) return 'low';
  return 'medium';
}
