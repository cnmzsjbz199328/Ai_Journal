/**
 * Verification: Crawl Runner Orchestrator Test
 */

import { describe, it, expect, vi } from 'vitest';
import { runCrawl } from '../../src/services/crawler/crawl-runner';
import type { RawFeedItem } from '../../src/services/crawler/types';

// Mock the dependencies
const mockItems: RawFeedItem[] = [
    {
        title: 'Test Source 1',
        source: 'Test Provider',
        category: 'science',
        url: 'https://example.com/1',
        timestamp: new Date().toISOString(),
        abstract: 'Abstract 1',
        content: null,
        imageUrl: null,
    },
    {
        title: 'Test Source 2', // Will be marked as dup
        source: 'Test Provider',
        category: 'science',
        url: 'https://example.com/2',
        timestamp: new Date().toISOString(),
        abstract: 'Abstract 2',
        content: null,
        imageUrl: null,
    }
];

vi.mock('@/services/crawler', () => ({
    createRegistry: vi.fn().mockReturnValue({
        getAll: vi.fn().mockReturnValue([
            {
                name: 'MockProvider',
                fetch: vi.fn().mockResolvedValue(mockItems)
            }
        ])
    })
}));

vi.mock('@/services/storage/source-store', () => ({
    getExistingUrls: vi.fn().mockResolvedValue(new Set()), // No URL dups
    getRecentTitleHashes: vi.fn().mockResolvedValue(new Map([['test_source_2_hash', 'old-id']])), // 1 title dup
    insertSources: vi.fn().mockResolvedValue(1), // Inserted 1 item
    markDuplicate: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/utils/dedup', () => ({
    hashTitle: vi.fn().mockImplementation((title: string) => title.toLowerCase().replace(/\s+/g, '_') + '_hash'),
    isDuplicateTitle: vi.fn(),
}));

describe('Crawl Runner', () => {
    it('orchestrates fetch, dedup, and insert correctly', async () => {
        const stats = await runCrawl();

        expect(stats.totalFetched).toBe(2);
        expect(stats.duplicatesSkipped).toBe(1); // Test Source 2 should be skipped
        expect(stats.newInserted).toBe(1); // Test Source 1 should be inserted
        expect(stats.providerErrors).toHaveLength(0);
    });
});
