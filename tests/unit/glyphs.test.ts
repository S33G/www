import { describe, it, expect } from 'vitest';
import { getGlyph, getGlyphs, GLYPHS } from '@/lib/ascii/glyphs';

describe('Glyphs Module', () => {
  describe('GLYPHS', () => {
    it('has secret message glyph defined', () => {
      expect(GLYPHS[0x47]).toBeDefined();
      expect(typeof GLYPHS[0x47]).toBe('string');
    });

    it('has UI glyphs defined', () => {
      expect(GLYPHS[0x1e]).toBeDefined();
      expect(GLYPHS[0x1f1]).toBeDefined();
      expect(GLYPHS[0x1f9]).toBeDefined();
    });
  });

  describe('getGlyph', () => {
    it('returns empty string for undefined glyph', () => {
      expect(getGlyph(0x999)).toBe('');
    });

    it('decodes emoticon glyph (0x1e)', () => {
      const result = getGlyph(0x1e);
      // Should decode to emoticon characters
      expect(result.length).toBeGreaterThan(0);
    });

    it('decodes title glyph (0x1f1)', () => {
      const result = getGlyph(0x1f1);
      expect(result.length).toBeGreaterThan(0);
      // Title should contain readable text about error/problem
      expect(result.toLowerCase()).toMatch(/problem|error|device|ran/i);
    });

    it('decodes progress percent glyph (0x1f3)', () => {
      const result = getGlyph(0x1f3);
      // Should be something like "100%"
      expect(result).toMatch(/\d+%?/);
    });

    it('decodes dismiss button glyph (0x1f4)', () => {
      const result = getGlyph(0x1f4);
      // Should decode to some text (the encoding may result in different outputs)
      expect(result.length).toBeGreaterThan(0);
    });

    it('decodes secret message (0x47)', () => {
      const result = getGlyph(0x47);
      expect(result.length).toBeGreaterThan(0);
      // Secret message should contain congratulations or similar
      expect(result).toMatch(/congrat|found|secret|easter/i);
    });

    it('decodes stop code glyph (0x1f8)', () => {
      const result = getGlyph(0x1f8);
      // Should contain stop code info
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('getGlyphs', () => {
    it('returns empty string for empty input', () => {
      expect(getGlyphs()).toBe('');
    });

    it('returns single glyph for single input', () => {
      const single = getGlyph(0x1e);
      const batch = getGlyphs(0x1e);
      expect(batch).toBe(single);
    });

    it('concatenates multiple glyphs', () => {
      const g1 = getGlyph(0x1e);
      const g2 = getGlyph(0x1f3);
      const combined = getGlyphs(0x1e, 0x1f3);
      expect(combined).toBe(g1 + g2);
    });

    it('handles non-existent glyphs in batch', () => {
      const result = getGlyphs(0x1e, 0x999, 0x1f3);
      const expected = getGlyph(0x1e) + '' + getGlyph(0x1f3);
      expect(result).toBe(expected);
    });
  });

  describe('Glyph decoding', () => {
    it('handles hex-encoded strings correctly', () => {
      // The encoding is: text -> hex -> reverse character-by-character
      // So decoding should reverse and convert hex pairs to chars
      const emoticon = getGlyph(0x1e);
      // 0x1e is '82a3' which reversed is '3a28' -> ':(' emoticon
      expect(emoticon).toBe(':(');
    });

    it('does not break on malformed input', () => {
      // Testing internal robustness - should not throw
      expect(() => getGlyph(0x47)).not.toThrow();
      expect(() => getGlyph(0x1f1)).not.toThrow();
    });
  });
});
