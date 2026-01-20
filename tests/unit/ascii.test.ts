import { describe, it, expect } from 'vitest';
import {
  brightnessToChar,
  rgbToBrightness,
  generateASCII,
  ASCII_CHARS,
} from '@/lib/ascii/characters';

describe('ASCII Characters', () => {
  describe('brightnessToChar', () => {
    it('returns first character for brightness 0', () => {
      expect(brightnessToChar(0)).toBe(' ');
    });

    it('returns last character for brightness 255', () => {
      expect(brightnessToChar(255)).toBe('@');
    });

    it('returns middle characters for mid brightness', () => {
      const char = brightnessToChar(128);
      expect(ASCII_CHARS).toContain(char);
    });

    it('uses custom character set', () => {
      const customSet = '.-+#';
      expect(brightnessToChar(255, customSet)).toBe('#');
      expect(brightnessToChar(0, customSet)).toBe('.');
    });
  });

  describe('rgbToBrightness', () => {
    it('returns 0 for black', () => {
      expect(rgbToBrightness(0, 0, 0)).toBe(0);
    });

    it('returns 255 for white', () => {
      expect(rgbToBrightness(255, 255, 255)).toBeCloseTo(255, 0);
    });

    it('uses luminance formula correctly', () => {
      // Pure red
      const red = rgbToBrightness(255, 0, 0);
      expect(red).toBeCloseTo(255 * 0.299, 1);

      // Pure green
      const green = rgbToBrightness(0, 255, 0);
      expect(green).toBeCloseTo(255 * 0.587, 1);

      // Pure blue
      const blue = rgbToBrightness(0, 0, 255);
      expect(blue).toBeCloseTo(255 * 0.114, 1);
    });
  });

  describe('generateASCII', () => {
    it('generates ASCII from 2D array', () => {
      const data = [
        [0, 128, 255],
        [255, 128, 0],
      ];
      const result = generateASCII(data);
      expect(result.split('\n')).toHaveLength(2);
    });

    it('handles empty array', () => {
      expect(generateASCII([])).toBe('');
    });
  });
});
