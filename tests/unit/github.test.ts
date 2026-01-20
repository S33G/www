import { describe, it, expect, vi } from 'vitest';
import { fetchRepo, getFallbackProjects } from '@/lib/github';

describe('GitHub Integration', () => {
  describe('getFallbackProjects', () => {
    it('creates fallback projects from config', () => {
      const repos = [
        { owner: 'test', name: 'repo1', description: 'Test repo 1' },
        { owner: 'test', name: 'repo2' },
      ];

      const projects = getFallbackProjects(repos);

      expect(projects).toHaveLength(2);
      expect(projects[0].name).toBe('repo1');
      expect(projects[0].url).toBe('https://github.com/test/repo1');
      expect(projects[0].description).toBe('Test repo 1');
      expect(projects[1].description).toBeNull();
    });

    it('sets default values for missing data', () => {
      const repos = [{ owner: 'test', name: 'repo' }];
      const projects = getFallbackProjects(repos);

      expect(projects[0].stars).toBe(0);
      expect(projects[0].language).toBeNull();
      expect(projects[0].topics).toEqual([]);
    });
  });

  describe('fetchRepo', () => {
    it('returns null on fetch error', async () => {
      // Mock fetch to fail
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const result = await fetchRepo('test', 'repo');
      expect(result).toBeNull();
    });

    it('returns null on non-ok response', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      });

      const result = await fetchRepo('test', 'repo');
      expect(result).toBeNull();
    });
  });
});
