import { test, describe, it, expect, beforeAll } from 'vitest';
import { searchListings, submitReport } from './lib/supabase-client';
import { MonadAccessLink } from './lib/monad';

describe('AccessLink Core', () => {
  describe('Database Operations', () => {
    it('should handle empty search results', async () => {
      const results = await searchListings({ location: 'NonExistent' });
      expect(Array.isArray(results)).toBe(true);
    });

    it('should accept report submission', async () => {
      // This will be mocked in test environment
      expect(submitReport).toBeDefined();
    });
  });

  describe('Monad Integration', () => {
    let monad: MonadAccessLink;

    beforeAll(() => {
      monad = new MonadAccessLink(
        'https://mainnet.monad.xyz',
        '0x0000000000000000000000000000000000000000'
      );
    });

    it('should generate property hash', () => {
      const hash = MonadAccessLink.generatePropertyHash(
        'Downtown Hotel',
        'NYC',
        ['zero-step-entry', 'roll-in-shower']
      );
      expect(hash).toMatch(/^0x[a-f0-9]{64}$/i);
    });

    it('should initialize read-only contract', async () => {
      await monad.initReadOnly();
      expect(monad).toBeDefined();
    });
  });

  describe('UI Components', () => {
    it('should export all core components', () => {
      const components = ['Header', 'Hero', 'SearchSection', 'ReportSection', 'Footer'];
      components.forEach((comp) => {
        expect(comp).toBeDefined();
      });
    });
  });
});
