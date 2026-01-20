import { ASCII_CHARS, CHAR_SETS, type CharSetName } from './characters';
import { type EffectType, DEFAULT_EFFECTS } from './effects';
import {
  PerformanceMonitor,
  QUALITY_PRESETS,
  prefersReducedMotion,
  isPageVisible,
} from './performance';

export interface ASCIIRendererConfig {
  container: HTMLElement;
  charSet?: CharSetName;
  fontSize?: number;
  color?: string;
  backgroundColor?: string;
  effect?: EffectType;
  speed?: number;
  intensity?: number;
}

export class ASCIIRenderer {
  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private charSet: string;
  private fontSize: number;
  private cellWidth: number;
  private cellHeight: number;
  private cols: number;
  private rows: number;
  private color: string;
  private backgroundColor: string;
  private effect: EffectType;
  private speed: number;
  private intensity: number;
  private time: number = 0;
  private animationId: number | null = null;
  private performanceMonitor: PerformanceMonitor;
  private mouseX: number = 0;
  private mouseY: number = 0;
  private isRunning: boolean = false;

  // Transition state
  private isTransitioning: boolean = false;
  private transitionProgress: number = 0;
  private transitionDuration: number = 1000; // 1 second
  private oldEffect: EffectType | null = null;
  private transitionStartTime: number = 0;

  // Matrix rain state
  private matrixColumns: { y: number; speed: number; chars: string[] }[] = [];

  // Explosions with recovery phase
  private explosions: {
    x: number;
    y: number;
    radius: number;
    startTime: number;
    phase: 'expanding' | 'holding' | 'recovering';
    recoveryProgress: number;
  }[] = [];

  // Per-column recovery state for cascade effect
  private columnRecoveryOffsets: number[] = [];

  // Mouse trail for glitch effect
  private mouseTrail: { x: number; y: number; time: number }[] = [];

  triggerExplosion(x: number, y: number): void {
     // Generate random recovery offsets for each column (for staggered cascade)
     this.columnRecoveryOffsets = [];
     for (let i = 0; i < this.cols; i++) {
       // Random delay per column (0 to 0.15) - creates organic wave
       this.columnRecoveryOffsets[i] = Math.random() * 0.15;
     }

     this.explosions.push({
       x,
       y,
       radius: 0,
       startTime: Date.now(),
       phase: 'expanding',
       recoveryProgress: 0
     });
  }

  private updateExplosions(): void {
    const now = Date.now();

    this.explosions = this.explosions.filter(exp => {
      const age = now - exp.startTime;

      // Phase 1: Expanding (0-1500ms)
      if (age < 1500) {
        exp.phase = 'expanding';
        exp.radius = age * 0.002 * Math.max(1, this.speed);
        return true;
      }
      // Phase 2: Holding (1500-2500ms) - pause before recovery
      else if (age < 2500) {
        exp.phase = 'holding';
        exp.radius = 1500 * 0.002 * Math.max(1, this.speed); // Hold at max
        return true;
      }
      // Phase 3: Recovery cascade (2500-5500ms)
      else if (age < 5500) {
        exp.phase = 'recovering';
        exp.recoveryProgress = (age - 2500) / 3000; // 0 to 1 over 3 seconds
        return true;
      }

      return false;
    });
  }

  private applyExplosionEffect(xGrid: number, yGrid: number, alpha: number): { x: number, y: number, alpha: number } {
      let x = xGrid * this.cellWidth;
      let y = yGrid * this.cellHeight;
      let finalAlpha = alpha;

      // Normalized coordinates
      const nx = xGrid / this.cols;
      const ny = yGrid / this.rows;

      for (const exp of this.explosions) {
         // Aspect ratio correction for distance
         const aspect = this.cols / this.rows;
         const dx = (nx - exp.x) * aspect;
         const dy = (ny - exp.y);
         const dist = Math.sqrt(dx*dx + dy*dy);

         const radius = exp.radius;
         const bandWidth = 0.2;

         if (exp.phase === 'expanding' || exp.phase === 'holding') {
           // Shockwave band
           if (dist < radius && dist > radius - bandWidth) {
               const force = 1 - (radius - dist) / bandWidth;
               const push = force * 50 * this.intensity;

               x += dx * push;
               y += dy * push;

               // Flash bright in the band
               finalAlpha = Math.min(1, finalAlpha + force * 0.5);
           }
           // Clear inner area
           else if (dist <= radius - bandWidth) {
               finalAlpha = 0;
           }
         }
         else if (exp.phase === 'recovering') {
           // Get column offset for staggered effect
           const colOffset = this.columnRecoveryOffsets[xGrid] || 0;

           // Calculate cascade wave position (top to bottom)
           const wavePosition = exp.recoveryProgress * 1.3 - colOffset;

           // Add subtle horizontal wave
           const horizontalWave = Math.sin(xGrid * 0.3 + exp.recoveryProgress * 10) * 0.02;
           const adjustedWave = wavePosition + horizontalWave;

           // Distance from recovery wave (0 = at wave, negative = above, positive = below)
           const distFromWave = ny - adjustedWave;

           if (distFromWave > 0.15) {
             // Below wave - still hidden
             finalAlpha = 0;
           }
           else if (distFromWave > 0) {
             // Just below wave - fading in
             const fadeIn = 1 - (distFromWave / 0.15);
             finalAlpha = alpha * fadeIn * fadeIn; // Ease in
           }
           else if (distFromWave > -0.08) {
             // At the wave front - BRIGHT leading edge
             const brightness = 1 + (1 + distFromWave / 0.08) * 0.6;
             finalAlpha = Math.min(1, alpha * brightness);

             // Add slight upward push for "surfacing" effect
             y -= (1 + distFromWave / 0.08) * 3;
           }
           // else: above wave - normal (already recovered)
         }
      }

      return { x, y, alpha: finalAlpha };
  }

  constructor(config: ASCIIRendererConfig) {
    this.container = config.container;
    this.charSet = CHAR_SETS[config.charSet || 'standard'];
    this.fontSize = config.fontSize || 14;
    this.color = config.color || '#00ff00';
    this.backgroundColor = config.backgroundColor || '#0a0a0a';
    this.effect = config.effect || 'wave';
    this.speed = config.speed || 1;
    this.intensity = config.intensity || 0.6;
    this.performanceMonitor = new PerformanceMonitor();

    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.zIndex = '-1';
    this.container.appendChild(this.canvas);

    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2D context');
    this.ctx = ctx;

    // Calculate dimensions
    this.cellWidth = this.fontSize * 0.6;
    this.cellHeight = this.fontSize;
    this.cols = 0;
    this.rows = 0;

    this.resize();
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    window.addEventListener('resize', this.handleResize);
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  private handleResize = (): void => {
    this.resize();
  };

  private handleMouseMove = (e: MouseEvent): void => {
    const rect = this.canvas.getBoundingClientRect();
    this.mouseX = (e.clientX - rect.left) / rect.width;
    this.mouseY = (e.clientY - rect.top) / rect.height;
  };

  private handleVisibilityChange = (): void => {
    if (isPageVisible() && this.isRunning) {
      this.start();
    } else {
      this.pause();
    }
  };

  private resize(): void {
    const rect = this.container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);

    this.cols = Math.floor(rect.width / this.cellWidth);
    this.rows = Math.floor(rect.height / this.cellHeight);

    // Reinitialize matrix columns
    this.initMatrixColumns();
  }

  private initMatrixColumns(): void {
    this.matrixColumns = [];
    for (let i = 0; i < this.cols; i++) {
      this.matrixColumns.push({
        y: Math.random() * this.rows * -1,
        speed: Math.random() * 0.5 + 0.3,
        chars: this.generateRandomChars(Math.floor(Math.random() * 15) + 5),
      });
    }
  }

  private generateRandomChars(length: number): string[] {
    const chars: string[] = [];
    const matrixChars = CHAR_SETS.matrix;
    for (let i = 0; i < length; i++) {
      chars.push(matrixChars[Math.floor(Math.random() * matrixChars.length)]);
    }
    return chars;
  }

  start(): void {
    if (prefersReducedMotion()) {
      this.renderStatic();
      return;
    }

    this.isRunning = true;
    this.animate();
  }

  pause(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  stop(): void {
    this.isRunning = false;
    this.pause();
  }

  private animate = (): void => {
    if (!this.isRunning) return;

    this.performanceMonitor.tick();
    const quality = this.performanceMonitor.checkAndAdapt();
    const settings = QUALITY_PRESETS[quality];

    this.time += 0.016 * this.speed * settings.updateInterval / 16;

    this.updateExplosions();
    this.updateMouseTrail();
    this.render();

    this.animationId = requestAnimationFrame(this.animate);
  };

  private render(): void {
    // Update transition progress
    if (this.isTransitioning) {
      const elapsed = Date.now() - this.transitionStartTime;
      this.transitionProgress = Math.min(elapsed / this.transitionDuration, 1);

      if (this.transitionProgress >= 1) {
        this.isTransitioning = false;
        this.oldEffect = null;
      }
    }

    // Clear canvas
    this.ctx.fillStyle = this.backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.font = `${this.fontSize}px monospace`;
    this.ctx.textBaseline = 'top';

    if (this.isTransitioning && this.oldEffect) {
      // Render crossfade between old and new effects
      this.renderCrossfade();
    } else {
      // Render current effect normally
      this.renderEffect(this.effect, 1);
    }
  }

  private renderCrossfade(): void {
    if (!this.oldEffect) return;

    // Ease-in-out transition
    const eased = this.easeInOutCubic(this.transitionProgress);

    // Render old effect with decreasing opacity
    this.renderEffect(this.oldEffect, 1 - eased);

    // Render new effect with increasing opacity
    this.renderEffect(this.effect, eased);
  }

  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  private renderEffect(effect: EffectType, opacity: number): void {
    const originalGlobalAlpha = this.ctx.globalAlpha;
    this.ctx.globalAlpha = opacity;

    switch (effect) {
      case 'matrix':
        this.renderMatrix();
        break;
      case 'wave':
        this.renderWave();
        break;
      case 'pulse':
        this.renderPulse();
        break;
      case 'glitch':
        this.renderGlitch();
        break;
      default:
        this.renderWave();
    }

    this.ctx.globalAlpha = originalGlobalAlpha;
  }

  private renderStatic(): void {
    this.ctx.fillStyle = this.backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.font = `${this.fontSize}px monospace`;
    this.ctx.textBaseline = 'top';
    this.ctx.fillStyle = this.color;

    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const char = this.charSet[Math.floor(Math.random() * this.charSet.length)];
        this.ctx.fillText(char, x * this.cellWidth, y * this.cellHeight);
      }
    }
  }

  private renderMatrix(): void {
    // Parse current color to RGB
    const rgb = this.hexToRgb(this.color);

    for (let i = 0; i < this.matrixColumns.length; i++) {
      const col = this.matrixColumns[i];

      for (let j = 0; j < col.chars.length; j++) {
        const y = Math.floor(col.y) + j;
        if (y < 0 || y >= this.rows) continue;

        // Brightness fade
        const brightness = 1 - j / col.chars.length;

        let baseAlpha;
        if (j === 0) {
           baseAlpha = 0.9 * this.intensity;
        } else {
           baseAlpha = brightness * 0.6 * this.intensity;
        }

        const { x: drawX, y: drawY, alpha: finalAlpha } = this.applyExplosionEffect(i, y, baseAlpha);

        if (finalAlpha <= 0.01) continue;

        // Head of column is white
        if (j === 0) {
          this.ctx.fillStyle = `rgba(255, 255, 255, ${finalAlpha})`;
        } else {
          this.ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${finalAlpha})`;
        }

        // Random char change
        if (Math.random() < 0.02) {
          col.chars[j] = CHAR_SETS.matrix[Math.floor(Math.random() * CHAR_SETS.matrix.length)];
        }

        this.ctx.fillText(col.chars[j], drawX, drawY);
      }

      col.y += col.speed * this.speed;
      if (col.y > this.rows + col.chars.length) {
        col.y = -col.chars.length;
        col.speed = Math.random() * 0.5 + 0.3;
      }
    }
  }

  private renderWave(): void {
    const rgb = this.hexToRgb(this.color);

    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        // Distance from mouse
        const dx = x / this.cols - this.mouseX;
        const dy = y / this.rows - this.mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Wave effect
        const wave = Math.sin(x * 0.1 + this.time) * Math.cos(y * 0.1 + this.time);
        const ripple = Math.sin(dist * 10 - this.time * 2) * Math.exp(-dist * 3);
        const value = (wave + ripple + 1) / 2;

        // Map to character
        const charIndex = Math.floor(value * (this.charSet.length - 1));
        const char = this.charSet[Math.min(charIndex, this.charSet.length - 1)];

        // Color based on value with intensity
        const alpha = (0.2 + value * 0.5) * this.intensity;

        const { x: drawX, y: drawY, alpha: finalAlpha } = this.applyExplosionEffect(x, y, alpha);
        if (finalAlpha <= 0.01) continue;

        this.ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${finalAlpha})`;
        this.ctx.fillText(char, drawX, drawY);
      }
    }
  }

  private renderPulse(): void {
    const rgb = this.hexToRgb(this.color);
    const pulse = (Math.sin(this.time * 2) + 1) / 2;

    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const cx = this.cols / 2;
        const cy = this.rows / 2;
        const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
        const maxDist = Math.sqrt(cx ** 2 + cy ** 2);
        const normDist = dist / maxDist;

        const ring = Math.sin(normDist * 10 - this.time * 3);
        const value = (ring + 1) / 2 * (1 - normDist * 0.5) * (0.5 + pulse * 0.5);

        const charIndex = Math.floor(value * (this.charSet.length - 1));
        const char = this.charSet[Math.min(charIndex, this.charSet.length - 1)];

        const alpha = value * 0.7 * this.intensity;

        const { x: drawX, y: drawY, alpha: finalAlpha } = this.applyExplosionEffect(x, y, alpha);
        if (finalAlpha <= 0.01) continue;

        this.ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${finalAlpha})`;
        this.ctx.fillText(char, drawX, drawY);
      }
    }
  }

  private updateMouseTrail(): void {
    const now = Date.now();
    // Add current mouse position to trail
    if (this.mouseTrail.length === 0 ||
        Math.abs(this.mouseTrail[this.mouseTrail.length - 1].x - this.mouseX) > 0.01 ||
        Math.abs(this.mouseTrail[this.mouseTrail.length - 1].y - this.mouseY) > 0.01) {
      this.mouseTrail.push({ x: this.mouseX, y: this.mouseY, time: now });
    }
    // Keep trail to max 30 points and remove old ones (older than 1.5s)
    this.mouseTrail = this.mouseTrail.filter(p => now - p.time < 1500).slice(-30);
  }

  private renderGlitch(): void {
    const rgb = this.hexToRgb(this.color);

    // Base layer: calm wave pattern (like renderWave but subtler)
    // Occasional glitch "events" that are localized and dramatic

    // Glitch state - persists across frames for coherence
    const glitchTime = this.time * 0.5; // Slower time for glitch calc

    // Scanline interference - a band that slowly moves down the screen
    const scanlineY = ((glitchTime * 0.3) % 1.4) - 0.2; // -0.2 to 1.2, wraps
    const scanlineWidth = 0.08;

    // Rare "burst" glitch - dramatic but infrequent
    const burstChance = Math.sin(glitchTime * 0.7) > 0.97;
    const burstIntensity = burstChance ? (Math.sin(glitchTime * 50) + 1) * 0.5 : 0;

    for (let y = 0; y < this.rows; y++) {
      const ny = y / this.rows;

      // Check if this row is in the scanline band
      const inScanline = Math.abs(ny - scanlineY) < scanlineWidth;
      const scanlineStrength = inScanline ? 1 - Math.abs(ny - scanlineY) / scanlineWidth : 0;

      // Horizontal offset for scanline rows (screen tear effect)
      const rowOffset = inScanline ? Math.sin(y * 0.5 + this.time * 10) * scanlineStrength * 3 : 0;

      for (let x = 0; x < this.cols; x++) {
        const nx = x / this.cols;

        // Base pattern: gentle noise field that shifts slowly
        const noise1 = Math.sin(x * 0.15 + this.time * 0.5) * Math.cos(y * 0.12 + this.time * 0.3);
        const noise2 = Math.sin((x + y) * 0.08 + this.time * 0.2);
        const baseValue = (noise1 + noise2 + 2) / 4; // 0-1 range

        // Character selection - mostly consistent, occasional swaps
        const charNoise = Math.sin(x * 0.3 + y * 0.2 + this.time * 0.1);
        const charIndex = Math.floor((baseValue + charNoise * 0.2) * (this.charSet.length - 1));
        const char = this.charSet[Math.max(0, Math.min(charIndex, this.charSet.length - 1))];

        // Alpha: base layer is subtle
        let alpha = (0.15 + baseValue * 0.25) * this.intensity;

        // Scanline brightens characters
        if (inScanline) {
          alpha += scanlineStrength * 0.4 * this.intensity;
        }

        // Burst effect: random bright spots
        if (burstIntensity > 0 && Math.random() < burstIntensity * 0.3) {
          alpha = Math.min(1, alpha + burstIntensity * 0.5);
        }

        const { x: baseX, y: baseY, alpha: finalAlpha } = this.applyExplosionEffect(x, y, alpha);

        if (finalAlpha <= 0.01) continue;

        // Color: slight chromatic aberration in scanline
        let r = rgb.r, g = rgb.g, b = rgb.b;
        if (inScanline) {
          // Subtle RGB split
          const aberration = scanlineStrength * 20;
          r = Math.min(255, rgb.r + aberration);
          b = Math.max(0, rgb.b - aberration);
        }

        // Mouse proximity check for inversion effect
        const mouseDist = Math.sqrt((nx - this.mouseX) ** 2 + (ny - this.mouseY) ** 2);
        const mouseRadius = 0.08;
        let isInverted = false;
        let trailBoost = 0;

        // Check if near current mouse position
        if (mouseDist < mouseRadius) {
          isInverted = true;
          trailBoost = (1 - mouseDist / mouseRadius) * 0.6;
        }

        // Check mouse trail for lingering inversion
        const now = Date.now();
        for (const point of this.mouseTrail) {
          const trailDist = Math.sqrt((nx - point.x) ** 2 + (ny - point.y) ** 2);
          const age = (now - point.time) / 1500; // 0 to 1 over 1.5s
          const trailRadius = mouseRadius * (1 - age * 0.5); // Shrinks over time
          if (trailDist < trailRadius) {
            const strength = (1 - trailDist / trailRadius) * (1 - age);
            if (strength > 0.3) isInverted = true;
            trailBoost = Math.max(trailBoost, strength * 0.4);
          }
        }

        // Apply inversion
        if (isInverted) {
          r = 255 - r;
          g = 255 - g;
          b = 255 - b;
        }

        const displayAlpha = Math.min(1, finalAlpha + trailBoost);
        this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${displayAlpha})`;

        const drawX = baseX + rowOffset * this.cellWidth;
        const drawY = baseY;
        this.ctx.fillText(char, drawX, drawY);
      }
    }
  }

  setEffect(effect: EffectType): void {
    if (effect !== this.effect) {
      // Start transition if effect is actually changing
      this.oldEffect = this.effect;
      this.effect = effect;
      this.isTransitioning = true;
      this.transitionProgress = 0;
      this.transitionStartTime = Date.now();

      // Reinitialize effect-specific state if needed
      if (effect === 'matrix') {
        this.initMatrixColumns();
      }
    }
  }

  setColor(color: string): void {
    this.color = color;
  }

  setSpeed(speed: number): void {
    this.speed = Math.max(0.25, Math.min(3, speed));
  }

  setIntensity(intensity: number): void {
    this.intensity = Math.max(0.1, Math.min(1, intensity));
  }

  setFontSize(size: number): void {
    this.fontSize = Math.max(10, Math.min(20, size));
    this.cellWidth = this.fontSize * 0.6;
    this.cellHeight = this.fontSize;
    this.resize();
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    // Default to emerald green
    const defaultColor = { r: 16, g: 185, b: 129 };

    if (!hex || hex.length < 4) return defaultColor;

    // Remove # if present
    const cleanHex = hex.replace('#', '');

    // Handle shorthand hex
    const fullHex = cleanHex.length === 3
      ? cleanHex.split('').map(c => c + c).join('')
      : cleanHex;

    const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);

    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : defaultColor;
  }

  destroy(): void {
    this.stop();
    window.removeEventListener('resize', this.handleResize);
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    this.canvas.remove();
  }
}
