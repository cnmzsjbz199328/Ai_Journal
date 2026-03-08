/**
 * Integration test: Live RSS fetch from BBC.
 * Verifies the full crawl pipeline produces valid SourceItems.
 */

import { describe, it, expect } from 'vitest';
import { BBCProvider } from '../../src/services/crawler/providers/bbc';
import { createRegistry } from '../../src/services/crawler';

describe('BBCProvider (live fetch)', () => {
    it('fetches at least 1 item from BBC RSS', async () => {
        const provider = new BBCProvider();
        const items = await provider.fetch();

        expect(items.length).toBeGreaterThanOrEqual(1);
    }, 15_000);

    it('returns items with all required fields', async () => {
        const provider = new BBCProvider();
        const items = await provider.fetch();
        const item = items[0];

        expect(item.title).toBeTruthy();
        expect(item.url).toBeTruthy();
        expect(item.source).toBe('BBC News');
        expect(item.category).toBe('general');
        // Timestamp should be ISO 8601
        expect(new Date(item.timestamp).toISOString()).toBe(item.timestamp);
    }, 15_000);
});

describe('SourceRegistry', () => {
    it('creates registry with all providers', () => {
        const registry = createRegistry();
        expect(registry.size).toBe(4);
    });

    it('filters by category', () => {
        const registry = createRegistry();
        const scienceProviders = registry.getByCategory('science');
        expect(scienceProviders.length).toBe(2); // Nature + ScienceDaily
    });

    it('finds provider by name', () => {
        const registry = createRegistry();
        const bbc = registry.getByName('BBC News');
        expect(bbc).toBeDefined();
        expect(bbc?.category).toBe('general');
    });
});
