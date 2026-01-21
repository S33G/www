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

export interface ASCIIRendererWebGLConfig {
  container: HTMLElement;
  charSet?: CharSetName;
  fontSize?: number;
  color?: string;
  backgroundColor?: string;
  effect?: EffectType;
  speed?: number;
  intensity?: number;
}

// Vertex shader - positions each character quad
const vertexShaderSource = `#version 300 es
precision highp float;

in vec2 a_position;
in vec2 a_texCoord;
in float a_charIndex;
in float a_alpha;

uniform vec2 u_resolution;
uniform vec2 u_cellSize;
uniform float u_atlasWidth;
uniform float u_charWidth;

out vec2 v_texCoord;
out float v_alpha;

void main() {
  // Calculate character position in atlas
  float charU = a_charIndex * u_charWidth / u_atlasWidth;

  // Map texCoord to the character in atlas
  v_texCoord = vec2(charU + a_texCoord.x * u_charWidth / u_atlasWidth, a_texCoord.y);
  v_alpha = a_alpha;

  // Convert pixel position to clip space
  vec2 clipSpace = (a_position / u_resolution) * 2.0 - 1.0;
  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
}
`;

// Fragment shader - renders characters with color tinting
const fragmentShaderSource = `#version 300 es
precision highp float;

in vec2 v_texCoord;
in float v_alpha;

uniform sampler2D u_atlas;
uniform vec3 u_color;

out vec4 fragColor;

void main() {
  vec4 texColor = texture(u_atlas, v_texCoord);
  // Use the texture alpha, tinted with uniform color
  fragColor = vec4(u_color, texColor.a * v_alpha);
}
`;

export class ASCIIRendererWebGL {
  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram;
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
  private frameInterval: number = 33;
  private currentQuality: QualityLevel = 'medium';
  private lastMetrics: PerformanceMetrics = {
    fps: 0,
    frameTime: 0,
    quality: 'medium',
  };

  // WebGL resources
  private atlasTexture: WebGLTexture | null = null;
  private positionBuffer: WebGLBuffer | null = null;
  private texCoordBuffer: WebGLBuffer | null = null;
  private charIndexBuffer: WebGLBuffer | null = null;
  private alphaBuffer: WebGLBuffer | null = null;
  private vao: WebGLVertexArrayObject | null = null;

  // Uniform locations
  private uniforms: {
    resolution: WebGLUniformLocation | null;
    cellSize: WebGLUniformLocation | null;
    atlasWidth: WebGLUniformLocation | null;
    charWidth: WebGLUniformLocation | null;
    atlas: WebGLUniformLocation | null;
    color: WebGLUniformLocation | null;
  } = {
    resolution: null,
    cellSize: null,
    atlasWidth: null,
    charWidth: null,
    atlas: null,
    color: null,
  };

  // Attribute locations
  private attributes: {
    position: number;
    texCoord: number;
    charIndex: number;
    alpha: number;
  } = {
    position: -1,
    texCoord: -1,
    charIndex: -1,
    alpha: -1,
  };

  // Atlas dimensions
  private atlasWidth: number = 0;
  private atlasCharWidth: number = 0;
  private atlasChars: string = ''; // Combined charset for atlas lookup

  // Intensity tween state
  private targetIntensity: number = 0.6;
  private intensityTweenStart: number = 0.6;
  private intensityTweenProgress: number = 1;
  private intensityTweenDuration: number = 500;
  private intensityTweenStartTime: number = 0;

  // Matrix rain state
  private matrixColumns: { y: number; speed: number; chars: string[] }[] = [];

  // Intro animation
  private introActive: boolean = true;
  private introStartTime: number = 0;
  private introDuration: number = 1000;
  private introColumnDelays: number[] = [];

  // Mouse throttling
  private lastMouseUpdate: number = 0;
  private mouseThrottleInterval: number = 33;

  // Transition state for smooth effect changes
  private isTransitioning: boolean = false;
  private transitionProgress: number = 0;
  private transitionDuration: number = 800;
  private oldEffect: EffectType | null = null;
  private transitionStartTime: number = 0;

  constructor(config: ASCIIRendererWebGLConfig) {
    this.container = config.container;
    this.charSet = CHAR_SETS[config.charSet || 'standard'];
    this.fontSize = config.fontSize || 14;
    this.color = config.color || '#00ff00';
    this.backgroundColor = config.backgroundColor || '#0a0a0a';
    this.effect = config.effect || 'wave';
    this.speed = config.speed || 1;
    this.intensity = config.intensity || 0.6;
    this.performanceMonitor = new PerformanceMonitor();

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

    const gl = this.canvas.getContext('webgl2', {
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
    });
    if (!gl) throw new Error('WebGL2 not supported');
    this.gl = gl;

    // Initialize WebGL
    this.program = this.createProgram();
    this.getLocations();
    this.createBuffers();
    this.createAtlasTexture();

    this.cellWidth = this.fontSize * 0.6;
    this.cellHeight = this.fontSize;
    this.cols = 0;
    this.rows = 0;

    this.resize();
    this.setupEventListeners();
  }

  private createShader(type: number, source: string): WebGLShader {
    const shader = this.gl.createShader(type);
    if (!shader) throw new Error('Failed to create shader');

    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const info = this.gl.getShaderInfoLog(shader);
      this.gl.deleteShader(shader);
      throw new Error('Shader compile error: ' + info);
    }

    return shader;
  }

  private createProgram(): WebGLProgram {
    const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);

    const program = this.gl.createProgram();
    if (!program) throw new Error('Failed to create program');

    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      const info = this.gl.getProgramInfoLog(program);
      throw new Error('Program link error: ' + info);
    }

    return program;
  }

  private getLocations(): void {
    this.uniforms.resolution = this.gl.getUniformLocation(this.program, 'u_resolution');
    this.uniforms.cellSize = this.gl.getUniformLocation(this.program, 'u_cellSize');
    this.uniforms.atlasWidth = this.gl.getUniformLocation(this.program, 'u_atlasWidth');
    this.uniforms.charWidth = this.gl.getUniformLocation(this.program, 'u_charWidth');
    this.uniforms.atlas = this.gl.getUniformLocation(this.program, 'u_atlas');
    this.uniforms.color = this.gl.getUniformLocation(this.program, 'u_color');

    this.attributes.position = this.gl.getAttribLocation(this.program, 'a_position');
    this.attributes.texCoord = this.gl.getAttribLocation(this.program, 'a_texCoord');
    this.attributes.charIndex = this.gl.getAttribLocation(this.program, 'a_charIndex');
    this.attributes.alpha = this.gl.getAttribLocation(this.program, 'a_alpha');
  }

  private createBuffers(): void {
    this.vao = this.gl.createVertexArray();
    this.gl.bindVertexArray(this.vao);

    this.positionBuffer = this.gl.createBuffer();
    this.texCoordBuffer = this.gl.createBuffer();
    this.charIndexBuffer = this.gl.createBuffer();
    this.alphaBuffer = this.gl.createBuffer();

    this.gl.bindVertexArray(null);
  }

  private createAtlasTexture(): void {
    // Combine standard charset with matrix charset for complete atlas
    const matrixChars = CHAR_SETS.matrix;
    const combinedChars = this.charSet + matrixChars.split('').filter(c => !this.charSet.includes(c)).join('');
    this.atlasChars = combinedChars;

    const charCount = combinedChars.length;
    this.atlasCharWidth = Math.ceil(this.fontSize * 0.6);
    this.atlasWidth = charCount * this.atlasCharWidth;

    const atlasCanvas = document.createElement('canvas');
    atlasCanvas.width = this.atlasWidth;
    atlasCanvas.height = this.fontSize;

    const ctx = atlasCanvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2D context for atlas');

    ctx.font = `${this.fontSize}px monospace`;
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'white'; // Render in white, tint in shader

    for (let i = 0; i < charCount; i++) {
      ctx.fillText(combinedChars[i], i * this.atlasCharWidth, 0);
    }

    // Create WebGL texture
    this.atlasTexture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.atlasTexture);
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.RGBA,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      atlasCanvas
    );
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
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
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

    this.cols = Math.floor(rect.width / this.cellWidth);
    this.rows = Math.floor(rect.height / this.cellHeight);

    this.initIntroDelays();
    this.initMatrixColumns();
  }

  private initIntroDelays(): void {
    this.introColumnDelays = [];
    for (let i = 0; i < this.cols; i++) {
      const centerX = this.cols / 2;
      const distFromCenter = Math.abs(i - centerX) / centerX;
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

  private getIntroAlpha(x: number, y: number): number {
    if (!this.introActive) return 1;

    const now = performance.now();
    const elapsed = now - this.introStartTime;
    const globalProgress = Math.min(elapsed / this.introDuration, 1);

    if (globalProgress >= 1) {
      this.introActive = false;
      return 1;
    }

    const columnDelay = this.introColumnDelays[x] || 0;
    const columnStartProgress = columnDelay * 0.5;
    const columnProgress = Math.max(0, (globalProgress - columnStartProgress) / (1 - columnStartProgress));

    if (columnProgress <= 0) return 0;

    const ny = y / this.rows;
    const wavePosition = columnProgress * 1.3;
    const distFromWave = ny - wavePosition;

    if (distFromWave > 0.2) {
      return 0;
    } else if (distFromWave > 0) {
      const fadeProgress = 1 - (distFromWave / 0.2);
      return fadeProgress * fadeProgress * (3 - 2 * fadeProgress);
    } else {
      return 1;
    }
  }

  start(): void {
    this.isRunning = true;
    this.introActive = true;
    this.introStartTime = performance.now();
    this.animate();
  }

  skipIntro(): void {
    this.introActive = false;
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

    const now = performance.now();
    const elapsed = now - this.lastFrameTime;

    if (elapsed < this.frameInterval) {
      return;
    }
    this.lastFrameTime = now - (elapsed % this.frameInterval);

    this.lastMetrics = this.performanceMonitor.tick();
    const quality = this.performanceMonitor.checkAndAdapt();

    if (quality !== this.currentQuality) {
      this.currentQuality = quality;
      this.frameInterval = QUALITY_PRESETS[quality].updateInterval;
    }

    this.time += 0.016 * this.speed;
    this.updateIntensityTween();
    this.render();
  };

  getPerformanceMetrics(): PerformanceMetrics {
    return this.lastMetrics;
  }

  private render(): void {
    const gl = this.gl;
    const rgb = this.hexToRgb(this.color);
    const bgRgb = this.hexToRgb(this.backgroundColor);

    // Update transition progress
    if (this.isTransitioning) {
      const elapsed = Date.now() - this.transitionStartTime;
      this.transitionProgress = Math.min(elapsed / this.transitionDuration, 1);

      if (this.transitionProgress >= 1) {
        this.isTransitioning = false;
        this.oldEffect = null;
      }
    }

    // Clear with background color
    gl.clearColor(bgRgb.r / 255, bgRgb.g / 255, bgRgb.b / 255, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Enable blending
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    gl.useProgram(this.program);

    // Set uniforms
    gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
    gl.uniform2f(this.uniforms.cellSize, this.cellWidth, this.cellHeight);
    gl.uniform1f(this.uniforms.atlasWidth, this.atlasWidth);
    gl.uniform1f(this.uniforms.charWidth, this.atlasCharWidth);
    gl.uniform3f(this.uniforms.color, rgb.r / 255, rgb.g / 255, rgb.b / 255);

    // Bind atlas texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.atlasTexture);
    gl.uniform1i(this.uniforms.atlas, 0);

    if (this.isTransitioning && this.oldEffect) {
      // Crossfade: render old effect fading out, then new effect fading in
      const eased = this.easeInOutCubic(this.transitionProgress);
      this.renderEffect(this.oldEffect, 1 - eased);
      this.renderEffect(this.effect, eased);
    } else {
      // Render current effect normally
      this.renderEffect(this.effect, 1);
    }
  }

  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  private renderEffect(effect: EffectType, opacity: number): void {
    switch (effect) {
      case 'wave':
        this.renderWave(opacity);
        break;
      case 'pulse':
        this.renderPulse(opacity);
        break;
      case 'matrix':
        this.renderMatrix(opacity);
        break;
      case 'glitch':
        this.renderGlitch(opacity);
        break;
      default:
        this.renderWave(opacity);
    }
  }

  private renderWave(opacity: number = 1): void {
    const positions: number[] = [];
    const texCoords: number[] = [];
    const charIndices: number[] = [];
    const alphas: number[] = [];

    const skip = this.currentQuality === 'low' ? 2 : 1;
    const dpr = window.devicePixelRatio || 1;

    for (let y = 0; y < this.rows; y += skip) {
      for (let x = 0; x < this.cols; x += skip) {
        const dx = x / this.cols - this.mouseX;
        const dy = y / this.rows - this.mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const wave = Math.sin(x * 0.1 + this.time) * Math.cos(y * 0.1 + this.time);
        const ripple = this.currentQuality === 'low'
          ? 0
          : Math.sin(dist * 10 - this.time * 2) * Math.exp(-dist * 3);
        const value = (wave + ripple + 1) / 2;

        const charIndex = Math.floor(value * (this.charSet.length - 1));
        let alpha = (0.2 + value * 0.5) * this.intensity * opacity;

        // Apply intro animation
        alpha *= this.getIntroAlpha(x, y);

        if (alpha <= 0.01) continue;

        // Add quad vertices (2 triangles = 6 vertices)
        const px = x * this.cellWidth * dpr;
        const py = y * this.cellHeight * dpr;
        const pw = this.cellWidth * dpr;
        const ph = this.cellHeight * dpr;

        // Triangle 1
        positions.push(px, py, px + pw, py, px, py + ph);
        // Triangle 2
        positions.push(px + pw, py, px + pw, py + ph, px, py + ph);

        // Texture coordinates (same for both triangles)
        texCoords.push(0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1);

        // Char index and alpha (same for all 6 vertices)
        for (let i = 0; i < 6; i++) {
          charIndices.push(charIndex);
          alphas.push(alpha);
        }
      }
    }

    this.uploadAndDraw(positions, texCoords, charIndices, alphas);
  }

  private renderPulse(opacity: number = 1): void {
    const positions: number[] = [];
    const texCoords: number[] = [];
    const charIndices: number[] = [];
    const alphas: number[] = [];

    const skip = this.currentQuality === 'low' ? 2 : 1;
    const dpr = window.devicePixelRatio || 1;
    const pulse = (Math.sin(this.time * 2) + 1) / 2;
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
        let alpha = value * 0.7 * this.intensity * opacity;
        alpha *= this.getIntroAlpha(x, y);

        if (alpha <= 0.01) continue;

        const px = x * this.cellWidth * dpr;
        const py = y * this.cellHeight * dpr;
        const pw = this.cellWidth * dpr;
        const ph = this.cellHeight * dpr;

        positions.push(px, py, px + pw, py, px, py + ph);
        positions.push(px + pw, py, px + pw, py + ph, px, py + ph);
        texCoords.push(0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1);

        for (let i = 0; i < 6; i++) {
          charIndices.push(charIndex);
          alphas.push(alpha);
        }
      }
    }

    this.uploadAndDraw(positions, texCoords, charIndices, alphas);
  }

  private renderMatrix(opacity: number = 1): void {
    const positions: number[] = [];
    const texCoords: number[] = [];
    const charIndices: number[] = [];
    const alphas: number[] = [];
    const dpr = window.devicePixelRatio || 1;

    for (let i = 0; i < this.matrixColumns.length; i++) {
      const col = this.matrixColumns[i];
      const trailLength = col.chars.length;
      const headIndex = trailLength - 1; // Last char is the falling head

      for (let j = 0; j < trailLength; j++) {
        const y = Math.floor(col.y) + j;
        if (y < 0 || y >= this.rows) continue;

        // Brightness: head (last char) is brightest, tail (first char) is dimmest
        const brightness = j / trailLength;
        const isHead = j === headIndex;

        let alpha = isHead ? 0.95 * this.intensity : brightness * 0.6 * this.intensity;

        // Mouse glow effect
        const nx = i / this.cols;
        const ny = y / this.rows;
        const mouseDist = Math.sqrt((nx - this.mouseX) ** 2 + (ny - this.mouseY) ** 2);
        const mouseRadius = 0.15;
        if (mouseDist < mouseRadius) {
          const glowStrength = (1 - mouseDist / mouseRadius) * 0.4;
          alpha = Math.min(1, alpha + glowStrength * this.intensity);
        }

        alpha *= this.getIntroAlpha(i, y) * opacity;

        if (alpha <= 0.01) continue;

        // Random char change - more frequent near head
        const changeChance = isHead ? 0.08 : 0.02;
        if (Math.random() < changeChance) {
          col.chars[j] = CHAR_SETS.matrix[Math.floor(Math.random() * CHAR_SETS.matrix.length)];
        }

        const charIndex = this.atlasChars.indexOf(col.chars[j]);
        if (charIndex === -1) continue;

        const px = i * this.cellWidth * dpr;
        const py = y * this.cellHeight * dpr;
        const pw = this.cellWidth * dpr;
        const ph = this.cellHeight * dpr;

        positions.push(px, py, px + pw, py, px, py + ph);
        positions.push(px + pw, py, px + pw, py + ph, px, py + ph);
        texCoords.push(0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1);

        for (let k = 0; k < 6; k++) {
          charIndices.push(charIndex);
          alphas.push(alpha);
        }
      }

      col.y += col.speed * this.speed;
      if (col.y > this.rows + trailLength) {
        col.y = -trailLength;
        col.speed = Math.random() * 0.5 + 0.3;
      }
    }

    this.uploadAndDraw(positions, texCoords, charIndices, alphas);
  }

  private renderGlitch(opacity: number = 1): void {
    // Glitch uses the same basic structure as wave
    // Simplified version for WebGL - full glitch effect complexity
    // would require additional shader passes
    const positions: number[] = [];
    const texCoords: number[] = [];
    const charIndices: number[] = [];
    const alphas: number[] = [];

    const skip = this.currentQuality === 'low' ? 2 : 1;
    const dpr = window.devicePixelRatio || 1;
    const glitchTime = this.time * 0.5;
    const scanlineY = ((glitchTime * 0.3) % 1.4) - 0.2;
    const scanlineWidth = 0.08;

    for (let y = 0; y < this.rows; y += skip) {
      const ny = y / this.rows;
      const inScanline = Math.abs(ny - scanlineY) < scanlineWidth;
      const scanlineStrength = inScanline ? 1 - Math.abs(ny - scanlineY) / scanlineWidth : 0;

      for (let x = 0; x < this.cols; x += skip) {
        const nx = x / this.cols;
        const noise = Math.sin(x * 0.15 + this.time * 0.5) * Math.cos(y * 0.12 + this.time * 0.3);
        const value = (noise + 1) / 2;

        const charIndex = Math.floor(value * (this.charSet.length - 1));
        let alpha = (0.15 + value * 0.25) * this.intensity;

        if (inScanline) {
          alpha += scanlineStrength * 0.4 * this.intensity;
        }

        // Mouse proximity glow effect
        const mouseDist = Math.sqrt((nx - this.mouseX) ** 2 + (ny - this.mouseY) ** 2);
        const mouseRadius = 0.12;
        if (mouseDist < mouseRadius) {
          const glowStrength = (1 - mouseDist / mouseRadius) * 0.5;
          alpha = Math.min(1, alpha + glowStrength * this.intensity);
        }

        alpha *= this.getIntroAlpha(x, y) * opacity;

        if (alpha <= 0.01) continue;

        const px = x * this.cellWidth * dpr;
        const py = y * this.cellHeight * dpr;
        const pw = this.cellWidth * dpr;
        const ph = this.cellHeight * dpr;

        positions.push(px, py, px + pw, py, px, py + ph);
        positions.push(px + pw, py, px + pw, py + ph, px, py + ph);
        texCoords.push(0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1);

        for (let i = 0; i < 6; i++) {
          charIndices.push(charIndex);
          alphas.push(Math.min(1, alpha));
        }
      }
    }

    this.uploadAndDraw(positions, texCoords, charIndices, alphas);
  }

  private uploadAndDraw(
    positions: number[],
    texCoords: number[],
    charIndices: number[],
    alphas: number[]
  ): void {
    const gl = this.gl;

    if (positions.length === 0) return;

    gl.bindVertexArray(this.vao);

    // Upload position data
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(this.attributes.position);
    gl.vertexAttribPointer(this.attributes.position, 2, gl.FLOAT, false, 0, 0);

    // Upload texCoord data
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(this.attributes.texCoord);
    gl.vertexAttribPointer(this.attributes.texCoord, 2, gl.FLOAT, false, 0, 0);

    // Upload charIndex data
    gl.bindBuffer(gl.ARRAY_BUFFER, this.charIndexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(charIndices), gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(this.attributes.charIndex);
    gl.vertexAttribPointer(this.attributes.charIndex, 1, gl.FLOAT, false, 0, 0);

    // Upload alpha data
    gl.bindBuffer(gl.ARRAY_BUFFER, this.alphaBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(alphas), gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(this.attributes.alpha);
    gl.vertexAttribPointer(this.attributes.alpha, 1, gl.FLOAT, false, 0, 0);

    // Draw
    gl.drawArrays(gl.TRIANGLES, 0, positions.length / 2);

    gl.bindVertexArray(null);
  }

  private updateIntensityTween(): void {
    if (this.intensityTweenProgress >= 1) return;

    const elapsed = performance.now() - this.intensityTweenStartTime;
    this.intensityTweenProgress = Math.min(1, elapsed / this.intensityTweenDuration);

    const eased = 1 - Math.pow(1 - this.intensityTweenProgress, 3);
    this.intensity = this.intensityTweenStart + (this.targetIntensity - this.intensityTweenStart) * eased;
  }

  setEffect(effect: EffectType): void {
    if (effect !== this.effect) {
      // Start smooth transition
      this.oldEffect = this.effect;
      this.effect = effect;
      this.isTransitioning = true;
      this.transitionProgress = 0;
      this.transitionStartTime = Date.now();

      // Reinitialize effect-specific state
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

  setIntensityAnimated(intensity: number, duration: number = 500): void {
    const target = Math.max(0.1, Math.min(1, intensity));
    if (target === this.intensity) return;

    this.intensityTweenStart = this.intensity;
    this.targetIntensity = target;
    this.intensityTweenDuration = duration;
    this.intensityTweenProgress = 0;
    this.intensityTweenStartTime = performance.now();
  }

  setFontSize(size: number): void {
    this.fontSize = Math.max(10, Math.min(20, size));
    this.cellWidth = this.fontSize * 0.6;
    this.cellHeight = this.fontSize;
    this.createAtlasTexture();
    this.resize();
  }

  triggerExplosion(_x: number, _y: number): void {
    console.log('Explosion effect not implemented in WebGL version.', { x: _x, y: _y });
    // Explosions not implemented in WebGL version yet
    // Would require additional shader logic
  }

  renderStaticFrame(): void {
    this.render();
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const defaultColor = { r: 16, g: 185, b: 129 };

    if (!hex || hex.length < 4) return defaultColor;

    const cleanHex = hex.replace('#', '');
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

    // Clean up WebGL resources
    this.gl.deleteTexture(this.atlasTexture);
    this.gl.deleteBuffer(this.positionBuffer);
    this.gl.deleteBuffer(this.texCoordBuffer);
    this.gl.deleteBuffer(this.charIndexBuffer);
    this.gl.deleteBuffer(this.alphaBuffer);
    this.gl.deleteVertexArray(this.vao);
    this.gl.deleteProgram(this.program);

    this.canvas.remove();
  }
}

/**
 * Check if WebGL2 is supported
 */
export function isWebGL2Supported(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!canvas.getContext('webgl2');
  } catch {
    return false;
  }
}
