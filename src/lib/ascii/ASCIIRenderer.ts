import { CHAR_SETS, type CharSetName } from './characters';
import { type EffectType } from './effects';
import {
  PerformanceMonitor,
  QUALITY_PRESETS,
  isPageVisible,
  getRecommendedQuality,
  type QualityLevel,
  type PerformanceMetrics,
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
  private lastFrameTime: number = 0;
  private frameInterval: number = 33; // Default ~30fps
  private currentQuality: QualityLevel = 'medium';
  private lastMetrics: PerformanceMetrics = {
    fps: 0,
    frameTime: 0,
    quality: 'medium',
  };

  // Intensity tween state
  private targetIntensity: number = 0.6;
  private intensityTweenStart: number = 0.6;
  private intensityTweenProgress: number = 1;
  private intensityTweenDuration: number = 500; // ms
  private intensityTweenStartTime: number = 0;

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

  // Mouse throttling (30fps max)
  private lastMouseUpdate: number = 0;
  private mouseThrottleInterval: number = 33; // ~30fps

  // Character atlas for faster rendering (drawImage vs fillText)
  private charAtlas: OffscreenCanvas | null = null;
  private charAtlasCtx: OffscreenCanvasRenderingContext2D | null = null;
  private atlasCharWidth: number = 0;
  private atlasCharHeight: number = 0;
  private currentAtlasColor: string = '';
  private matrixAtlas: OffscreenCanvas | null = null;
  private matrixAtlasCtx: OffscreenCanvasRenderingContext2D | null = null;

  // Intro animation state
  private introActive: boolean = true;
  private introStartTime: number = 0;
  private introDuration: number = 1000; // Total intro duration in ms
  private introColumnDelays: number[] = []; // Random delay per column for staggered effect

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

      // Apply intro animation alpha
      if (this.introActive) {
        finalAlpha *= this.getIntroAlpha(xGrid, yGrid);
      }

      return { x, y, alpha: finalAlpha };
  }

  /**
   * Calculate intro alpha for a cell based on position and time.
   * Creates a cinematic cascade effect from top-to-bottom with per-column delays.
   */
  private getIntroAlpha(x: number, y: number): number {
    if (!this.introActive) return 1;

    const now = performance.now();
    const elapsed = now - this.introStartTime;
    
    // Global progress (0 to 1 over intro duration)
    const globalProgress = Math.min(elapsed / this.introDuration, 1);
    
    // End intro when complete
    if (globalProgress >= 1) {
      this.introActive = false;
      return 1;
    }

    // Get column delay (0 to ~0.7 range from initIntroDelays)
    const columnDelay = this.introColumnDelays[x] || 0;
    
    // Calculate when this column starts appearing (staggered by columnDelay)
    // Columns with higher delay start later
    const columnStartProgress = columnDelay * 0.5; // First 50% of time is for stagger
    
    // Column-specific progress (0 = hasn't started, 1 = fully revealed)
    const columnProgress = Math.max(0, (globalProgress - columnStartProgress) / (1 - columnStartProgress));
    
    if (columnProgress <= 0) return 0;
    
    // Normalized y position (0 at top, 1 at bottom)
    const ny = y / this.rows;
    
    // The "reveal wave" position for this column (0 to 1.2 to ensure full coverage)
    const wavePosition = columnProgress * 1.3;
    
    // How far is this cell from the wave front?
    const distFromWave = ny - wavePosition;
    
    if (distFromWave > 0.2) {
      // Below the wave - not yet revealed
      return 0;
    } else if (distFromWave > 0) {
      // Just below wave - fading in with easing
      const fadeProgress = 1 - (distFromWave / 0.2);
      // Cubic ease out for smooth appearance
      return fadeProgress * fadeProgress * (3 - 2 * fadeProgress);
    } else if (distFromWave > -0.1) {
      // At wave front - slight brightness boost for "typing" effect
      return 1;
    } else {
      // Above wave - fully revealed
      return 1;
    }
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

    // Set initial quality based on device
    this.currentQuality = getRecommendedQuality();
    this.frameInterval = QUALITY_PRESETS[this.currentQuality].updateInterval;

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
    // Throttle mouse updates to 30fps max
    const now = performance.now();
    if (now - this.lastMouseUpdate < this.mouseThrottleInterval) return;
    this.lastMouseUpdate = now;

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

    // Initialize intro column delays for staggered cascade
    this.initIntroDelays();

    // Reinitialize matrix columns
    this.initMatrixColumns();
  }

  private initIntroDelays(): void {
    this.introColumnDelays = [];
    for (let i = 0; i < this.cols; i++) {
      // Create wave pattern from center outward with randomness
      const centerX = this.cols / 2;
      const distFromCenter = Math.abs(i - centerX) / centerX;
      // Base delay based on distance from center + random variation
      this.introColumnDelays[i] = distFromCenter * 0.4 + Math.random() * 0.3;
    }
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

  /**
   * Build character atlas for faster rendering with drawImage instead of fillText
   */
  private buildCharAtlas(color: string, fontSize: number): void {
    // Skip if atlas is already built for this color and size
    if (this.charAtlas && this.currentAtlasColor === color &&
        this.atlasCharHeight === fontSize) {
      return;
    }

    this.currentAtlasColor = color;
    this.atlasCharWidth = Math.ceil(fontSize * 0.6);
    this.atlasCharHeight = fontSize;

    // Build main character set atlas
    const charCount = this.charSet.length;
    const atlasWidth = charCount * this.atlasCharWidth;

    this.charAtlas = new OffscreenCanvas(atlasWidth, this.atlasCharHeight);
    this.charAtlasCtx = this.charAtlas.getContext('2d');

    if (this.charAtlasCtx) {
      this.charAtlasCtx.font = `${fontSize}px monospace`;
      this.charAtlasCtx.textBaseline = 'top';
      this.charAtlasCtx.fillStyle = color;

      for (let i = 0; i < charCount; i++) {
        this.charAtlasCtx.fillText(
          this.charSet[i],
          i * this.atlasCharWidth,
          0
        );
      }
    }

    // Build matrix character set atlas
    const matrixChars = CHAR_SETS.matrix;
    const matrixAtlasWidth = matrixChars.length * this.atlasCharWidth;

    this.matrixAtlas = new OffscreenCanvas(matrixAtlasWidth, this.atlasCharHeight);
    this.matrixAtlasCtx = this.matrixAtlas.getContext('2d');

    if (this.matrixAtlasCtx) {
      this.matrixAtlasCtx.font = `${fontSize}px monospace`;
      this.matrixAtlasCtx.textBaseline = 'top';
      this.matrixAtlasCtx.fillStyle = color;

      for (let i = 0; i < matrixChars.length; i++) {
        this.matrixAtlasCtx.fillText(
          matrixChars[i],
          i * this.atlasCharWidth,
          0
        );
      }
    }
  }

  /**
   * Draw a character from the atlas (faster than fillText)
   */
  private drawCharFromAtlas(
    char: string,
    x: number,
    y: number,
    alpha: number,
    useMatrixAtlas: boolean = false
  ): void {
    const atlas = useMatrixAtlas ? this.matrixAtlas : this.charAtlas;
    const charSetToUse = useMatrixAtlas ? CHAR_SETS.matrix : this.charSet;

    if (!atlas || alpha <= 0.01) return;

    const charIndex = charSetToUse.indexOf(char);
    if (charIndex === -1) {
      // Fallback to fillText for unknown characters
      this.ctx.globalAlpha = alpha;
      this.ctx.fillText(char, x, y);
      return;
    }

    const srcX = charIndex * this.atlasCharWidth;

    this.ctx.globalAlpha = alpha;
    this.ctx.drawImage(
      atlas,
      srcX, 0, this.atlasCharWidth, this.atlasCharHeight,
      x, y, this.atlasCharWidth, this.atlasCharHeight
    );
  }

  start(): void {
    this.isRunning = true;
    this.introActive = true;
    this.introStartTime = performance.now();
    this.animate();
  }

  /**
   * Skip the intro animation
   */
  skipIntro(): void {
    this.introActive = false;
  }

  /**
   * Render a single static frame (for reduced motion or fallback)
   */
  renderStaticFrame(): void {
    this.renderStatic();
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

    this.animationId = requestAnimationFrame(this.animate);

    // Frame throttling - skip frames if too fast
    const now = performance.now();
    const elapsed = now - this.lastFrameTime;

    if (elapsed < this.frameInterval) {
      return;
    }
    this.lastFrameTime = now - (elapsed % this.frameInterval);

    this.lastMetrics = this.performanceMonitor.tick();
    const quality = this.performanceMonitor.checkAndAdapt();

    // Update frame interval if quality changed
    if (quality !== this.currentQuality) {
      this.currentQuality = quality;
      this.frameInterval = QUALITY_PRESETS[quality].updateInterval;
    }

    this.time += 0.016 * this.speed;

    this.updateExplosions();
    this.updateMouseTrail();
    this.updateIntensityTween();
    this.render();
  };

  getPerformanceMetrics(): PerformanceMetrics {
    return this.lastMetrics;
  }

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

    // Use larger font at low quality for fewer cells
    const effectiveFontSize = this.currentQuality === 'low'
      ? Math.max(this.fontSize, 18)
      : this.fontSize;

    // Build character atlas if needed (uses drawImage instead of fillText for speed)
    this.buildCharAtlas(this.color, effectiveFontSize);

    this.ctx.font = `${effectiveFontSize}px monospace`;
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
    for (let i = 0; i < this.matrixColumns.length; i++) {
      const col = this.matrixColumns[i];
      const trailLength = col.chars.length;
      const headIndex = trailLength - 1; // Last char is the falling head

      for (let j = 0; j < trailLength; j++) {
        const y = Math.floor(col.y) + j;
        if (y < 0 || y >= this.rows) continue;

        // Brightness: head (last char, j = headIndex) is brightest, tail (j = 0) is dimmest
        const brightness = j / trailLength;
        const isHead = j === headIndex;

        let baseAlpha;
        if (isHead) {
          baseAlpha = 0.95 * this.intensity;
        } else {
          baseAlpha = brightness * 0.6 * this.intensity;
        }

        // Mouse glow effect - characters near mouse glow brighter
        const nx = i / this.cols;
        const ny = y / this.rows;
        const mouseDist = Math.sqrt((nx - this.mouseX) ** 2 + (ny - this.mouseY) ** 2);
        const mouseRadius = 0.15;
        if (mouseDist < mouseRadius) {
          const glowStrength = (1 - mouseDist / mouseRadius) * 0.4;
          baseAlpha = Math.min(1, baseAlpha + glowStrength * this.intensity);
        }

        const { x: drawX, y: drawY, alpha: finalAlpha } = this.applyExplosionEffect(i, y, baseAlpha);

        if (finalAlpha <= 0.01) continue;

        // Random char change - more frequent near head
        const changeChance = isHead ? 0.08 : 0.02;
        if (Math.random() < changeChance) {
          col.chars[j] = CHAR_SETS.matrix[Math.floor(Math.random() * CHAR_SETS.matrix.length)];
        }

        // Head of column (falling tip) is white, rest use atlas
        if (isHead) {
          this.ctx.fillStyle = `rgba(255, 255, 255, ${finalAlpha})`;
          this.ctx.fillText(col.chars[j], drawX, drawY);
        } else {
          this.drawCharFromAtlas(col.chars[j], drawX, drawY, finalAlpha, true);
        }
      }

      col.y += col.speed * this.speed;
      if (col.y > this.rows + trailLength) {
        col.y = -trailLength;
        col.speed = Math.random() * 0.5 + 0.3;
      }
    }
    this.ctx.globalAlpha = 1;
  }

  private renderWave(): void {
    // Skip cells at low quality for better performance
    const skip = this.currentQuality === 'low' ? 2 : 1;

    for (let y = 0; y < this.rows; y += skip) {
      for (let x = 0; x < this.cols; x += skip) {
        // Distance from mouse
        const dx = x / this.cols - this.mouseX;
        const dy = y / this.rows - this.mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Wave effect - simplified at low quality
        const wave = Math.sin(x * 0.1 + this.time) * Math.cos(y * 0.1 + this.time);
        const ripple = this.currentQuality === 'low'
          ? 0 // Skip expensive ripple at low quality
          : Math.sin(dist * 10 - this.time * 2) * Math.exp(-dist * 3);
        const value = (wave + ripple + 1) / 2;

        // Map to character
        const charIndex = Math.floor(value * (this.charSet.length - 1));
        const char = this.charSet[Math.min(charIndex, this.charSet.length - 1)];

        // Color based on value with intensity
        const alpha = (0.2 + value * 0.5) * this.intensity;

        const { x: drawX, y: drawY, alpha: finalAlpha } = this.applyExplosionEffect(x, y, alpha);
        if (finalAlpha <= 0.01) continue;

        // Use atlas for faster rendering
        this.drawCharFromAtlas(char, drawX, drawY, finalAlpha);
      }
    }
    this.ctx.globalAlpha = 1;
  }

  private renderPulse(): void {
    const pulse = (Math.sin(this.time * 2) + 1) / 2;
    const skip = this.currentQuality === 'low' ? 2 : 1;

    // Pre-calculate center values
    const cx = this.cols / 2;
    const cy = this.rows / 2;
    const maxDist = Math.sqrt(cx ** 2 + cy ** 2);

    // Mouse position in grid coordinates
    const mx = this.mouseX * this.cols;
    const my = this.mouseY * this.rows;

    for (let y = 0; y < this.rows; y += skip) {
      for (let x = 0; x < this.cols; x += skip) {
        // Center pulse
        const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
        const normDist = dist / maxDist;
        const ring = Math.sin(normDist * 10 - this.time * 3);
        let value = (ring + 1) / 2 * (1 - normDist * 0.5) * (0.5 + pulse * 0.5);

        // Mouse pulse - secondary rings emanate from cursor
        const mouseDist = Math.sqrt((x - mx) ** 2 + (y - my) ** 2);
        const mouseNormDist = mouseDist / (maxDist * 0.5);
        if (mouseNormDist < 1) {
          const mouseRing = Math.sin(mouseNormDist * 8 - this.time * 4);
          const mouseValue = (mouseRing + 1) / 2 * (1 - mouseNormDist) * 0.5;
          value = Math.max(value, mouseValue);
        }

        const charIndex = Math.floor(value * (this.charSet.length - 1));
        const char = this.charSet[Math.min(charIndex, this.charSet.length - 1)];

        const alpha = value * 0.7 * this.intensity;

        const { x: drawX, y: drawY, alpha: finalAlpha } = this.applyExplosionEffect(x, y, alpha);
        if (finalAlpha <= 0.01) continue;

        // Use atlas for faster rendering
        this.drawCharFromAtlas(char, drawX, drawY, finalAlpha);
      }
    }
    this.ctx.globalAlpha = 1;
  }

  private updateMouseTrail(): void {
    const now = Date.now();
    // Add current mouse position to trail
    if (this.mouseTrail.length === 0 ||
        Math.abs(this.mouseTrail[this.mouseTrail.length - 1].x - this.mouseX) > 0.01 ||
        Math.abs(this.mouseTrail[this.mouseTrail.length - 1].y - this.mouseY) > 0.01) {
      this.mouseTrail.push({ x: this.mouseX, y: this.mouseY, time: now });
    }
    // Keep trail to max 15 points and remove old ones (older than 1s)
    this.mouseTrail = this.mouseTrail.filter(p => now - p.time < 1000).slice(-15);
  }

  private renderGlitch(): void {
    const rgb = this.hexToRgb(this.color);
    const skip = this.currentQuality === 'low' ? 2 : 1;
    const isLowQuality = this.currentQuality === 'low';

    // Glitch state - persists across frames for coherence
    const glitchTime = this.time * 0.5;

    // Scanline interference - a band that slowly moves down the screen
    const scanlineY = ((glitchTime * 0.3) % 1.4) - 0.2;
    const scanlineWidth = 0.08;

    // Rare "burst" glitch - disable at low quality
    const burstChance = !isLowQuality && Math.sin(glitchTime * 0.7) > 0.97;
    const burstIntensity = burstChance ? (Math.sin(glitchTime * 50) + 1) * 0.5 : 0;

    // Pre-calculate mouse trail info for low quality (skip trail at low quality)
    const now = isLowQuality ? 0 : Date.now();

    for (let y = 0; y < this.rows; y += skip) {
      const ny = y / this.rows;

      // Check if this row is in the scanline band
      const inScanline = Math.abs(ny - scanlineY) < scanlineWidth;
      const scanlineStrength = inScanline ? 1 - Math.abs(ny - scanlineY) / scanlineWidth : 0;

      // Horizontal offset for scanline rows - simplified at low quality
      const rowOffset = inScanline && !isLowQuality
        ? Math.sin(y * 0.5 + this.time * 10) * scanlineStrength * 3
        : 0;

      for (let x = 0; x < this.cols; x += skip) {
        const nx = x / this.cols;

        // Simplified pattern at low quality
        const noise1 = Math.sin(x * 0.15 + this.time * 0.5) * Math.cos(y * 0.12 + this.time * 0.3);
        const baseValue = isLowQuality
          ? (noise1 + 1) / 2
          : (noise1 + Math.sin((x + y) * 0.08 + this.time * 0.2) + 2) / 4;

        const charIndex = Math.floor(baseValue * (this.charSet.length - 1));
        const char = this.charSet[Math.max(0, Math.min(charIndex, this.charSet.length - 1))];

        let alpha = (0.15 + baseValue * 0.25) * this.intensity;

        if (inScanline) {
          alpha += scanlineStrength * 0.4 * this.intensity;
        }

        if (burstIntensity > 0 && Math.random() < burstIntensity * 0.3) {
          alpha = Math.min(1, alpha + burstIntensity * 0.5);
        }

        const { x: baseX, y: baseY, alpha: finalAlpha } = this.applyExplosionEffect(x, y, alpha);

        if (finalAlpha <= 0.01) continue;

        let r = rgb.r, g = rgb.g, b = rgb.b;
        if (inScanline && !isLowQuality) {
          const aberration = scanlineStrength * 20;
          r = Math.min(255, rgb.r + aberration);
          b = Math.max(0, rgb.b - aberration);
        }

        // Mouse proximity - simplified at low quality
        let isInverted = false;
        let trailBoost = 0;

        if (!isLowQuality) {
          const mouseDist = Math.sqrt((nx - this.mouseX) ** 2 + (ny - this.mouseY) ** 2);
          const mouseRadius = 0.08;

          if (mouseDist < mouseRadius) {
            isInverted = true;
            trailBoost = (1 - mouseDist / mouseRadius) * 0.6;
          }

          // Check mouse trail
          for (const point of this.mouseTrail) {
            const trailDist = Math.sqrt((nx - point.x) ** 2 + (ny - point.y) ** 2);
            const age = (now - point.time) / 1500;
            const trailRadius = mouseRadius * (1 - age * 0.5);
            if (trailDist < trailRadius) {
              const strength = (1 - trailDist / trailRadius) * (1 - age);
              if (strength > 0.3) isInverted = true;
              trailBoost = Math.max(trailBoost, strength * 0.4);
            }
          }
        }

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
    this.targetIntensity = this.intensity;
  }

  /**
   * Animate intensity change over duration
   */
  setIntensityAnimated(intensity: number, duration: number = 500): void {
    const target = Math.max(0.1, Math.min(1, intensity));
    if (target === this.intensity) return;

    this.intensityTweenStart = this.intensity;
    this.targetIntensity = target;
    this.intensityTweenDuration = duration;
    this.intensityTweenProgress = 0;
    this.intensityTweenStartTime = performance.now();
  }

  /**
   * Update intensity tween (call in animation loop)
   */
  private updateIntensityTween(): void {
    if (this.intensityTweenProgress >= 1) return;

    const elapsed = performance.now() - this.intensityTweenStartTime;
    this.intensityTweenProgress = Math.min(1, elapsed / this.intensityTweenDuration);

    // Ease out cubic
    const eased = 1 - Math.pow(1 - this.intensityTweenProgress, 3);
    this.intensity = this.intensityTweenStart + (this.targetIntensity - this.intensityTweenStart) * eased;
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
