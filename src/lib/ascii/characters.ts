// ASCII character set from dark to light
export const ASCII_CHARS = ' .:-=+*#%@';
export const ASCII_CHARS_DETAILED = ' .\'`^",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$';

// Character density maps for different effects
export const CHAR_SETS = {
  minimal: ' .:#',
  standard: ' .:-=+*#%@',
  detailed: ' .\'`^",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$',
  blocks: ' ░▒▓█',
  matrix: 'ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ012345789Z',
} as const;

export type CharSetName = keyof typeof CHAR_SETS;

/**
 * Get ASCII character based on brightness (0-255)
 */
export function brightnessToChar(brightness: number, charSet: string = ASCII_CHARS): string {
  const index = Math.floor((brightness / 255) * (charSet.length - 1));
  return charSet[Math.min(index, charSet.length - 1)];
}

/**
 * Convert RGB to perceived brightness using luminance formula
 */
export function rgbToBrightness(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/**
 * Generate ASCII art from a 2D brightness array
 */
export function generateASCII(
  data: number[][],
  charSet: string = ASCII_CHARS
): string {
  return data
    .map((row) => row.map((val) => brightnessToChar(val, charSet)).join(''))
    .join('\n');
}

/**
 * Create a simple wave pattern
 */
export function generateWavePattern(
  width: number,
  height: number,
  time: number = 0,
  frequency: number = 0.1,
  amplitude: number = 0.5
): number[][] {
  const result: number[][] = [];

  for (let y = 0; y < height; y++) {
    const row: number[] = [];
    for (let x = 0; x < width; x++) {
      const wave = Math.sin(x * frequency + time) * Math.cos(y * frequency + time);
      const normalized = (wave * amplitude + 1) / 2;
      row.push(Math.floor(normalized * 255));
    }
    result.push(row);
  }

  return result;
}

/**
 * Create matrix rain column data
 */
export interface MatrixColumn {
  x: number;
  y: number;
  speed: number;
  chars: string[];
  length: number;
}

export function createMatrixColumn(x: number, height: number, charSet: string): MatrixColumn {
  const length = Math.floor(Math.random() * 15) + 5;
  const chars: string[] = [];

  for (let i = 0; i < length; i++) {
    chars.push(charSet[Math.floor(Math.random() * charSet.length)]);
  }

  return {
    x,
    y: -length,
    speed: Math.random() * 0.5 + 0.5,
    chars,
    length,
  };
}
