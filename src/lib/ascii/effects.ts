export type EffectType = 'none' | 'wave' | 'glitch' | 'matrix' | 'pulse' | 'dissolve';

export interface EffectConfig {
  type: EffectType;
  intensity: number;
  speed: number;
}

export const DEFAULT_EFFECTS: Record<EffectType, EffectConfig> = {
  none: { type: 'none', intensity: 0, speed: 0 },
  wave: { type: 'wave', intensity: 0.5, speed: 1 },
  glitch: { type: 'glitch', intensity: 0.3, speed: 2 },
  matrix: { type: 'matrix', intensity: 0.8, speed: 1.5 },
  pulse: { type: 'pulse', intensity: 0.4, speed: 0.5 },
  dissolve: { type: 'dissolve', intensity: 0.6, speed: 1 },
};

/**
 * Apply wave distortion to coordinates
 */
export function applyWaveEffect(
  x: number,
  y: number,
  time: number,
  intensity: number
): { x: number; y: number } {
  const waveX = Math.sin(y * 0.05 + time) * intensity * 10;
  const waveY = Math.cos(x * 0.05 + time) * intensity * 5;
  return { x: x + waveX, y: y + waveY };
}

/**
 * Apply glitch effect - random horizontal displacement
 */
export function applyGlitchEffect(
  x: number,
  y: number,
  time: number,
  intensity: number
): { x: number; y: number; colorShift: number } {
  const glitchLine = Math.random() < 0.02 * intensity;
  const displacement = glitchLine ? (Math.random() - 0.5) * 20 * intensity : 0;
  const colorShift = glitchLine ? (Math.random() - 0.5) * 10 : 0;

  return { x: x + displacement, y, colorShift };
}

/**
 * Calculate pulse brightness modifier
 */
export function calculatePulse(time: number, speed: number, intensity: number): number {
  return 1 + Math.sin(time * speed) * intensity * 0.3;
}

/**
 * Calculate dissolve opacity based on position and progress
 */
export function calculateDissolve(
  x: number,
  y: number,
  progress: number,
  seed: number = 0
): number {
  const noise = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
  const threshold = noise - Math.floor(noise);
  return threshold < progress ? 0 : 1;
}

/**
 * Generate random glitch timing
 */
export function shouldGlitch(intensity: number): boolean {
  return Math.random() < 0.001 * intensity;
}

/**
 * Get effect-specific uniform values for shaders
 */
export function getEffectUniforms(effect: EffectConfig, time: number, mouseX: number, mouseY: number) {
  return {
    u_time: time,
    u_effect: effectTypeToInt(effect.type),
    u_intensity: effect.intensity,
    u_speed: effect.speed,
    u_mouse: [mouseX, mouseY],
  };
}

function effectTypeToInt(type: EffectType): number {
  const map: Record<EffectType, number> = {
    none: 0,
    wave: 1,
    glitch: 2,
    matrix: 3,
    pulse: 4,
    dissolve: 5,
  };
  return map[type];
}
