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
    cellSize: 16,
    effectsEnabled: false,
    maxParticles: 50,
    updateInterval: 50,
  },
  medium: {
    cellSize: 12,
    effectsEnabled: true,
    maxParticles: 100,
    updateInterval: 33,
  },
  high: {
    cellSize: 10,
    effectsEnabled: true,
    maxParticles: 200,
    updateInterval: 16,
  },
  ultra: {
    cellSize: 8,
    effectsEnabled: true,
    maxParticles: 500,
    updateInterval: 16,
  },
};

export class PerformanceMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private fps = 60;
  private frameTimeHistory: number[] = [];
  private readonly historySize = 30;
  private currentQuality: QualityLevel = 'high';

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
    if (this.frameTimeHistory.length < this.historySize) {
      return this.currentQuality;
    }

    if (this.fps < 25 && this.currentQuality !== 'low') {
      this.currentQuality = this.decreaseQuality(this.currentQuality);
    } else if (this.fps > 55 && this.currentQuality !== 'ultra') {
      this.currentQuality = this.increaseQuality(this.currentQuality);
    }

    return this.currentQuality;
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
    this.currentQuality = 'high';
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
