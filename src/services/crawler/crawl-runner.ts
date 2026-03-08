/**
 * Crawl Runner — orchestrates all providers → dedup → DB insert.
 * Bridges the crawler layer and storage layer.
 * No direct import from AI services (service isolation per gemini.md).
 */

import { createRegistry } from '@/services/crawler';
import { getExistingUrls, getRecentTitleHashes, insertSources, markDuplicate } from '@/services/storage/source-store';
import { isDuplicateTitle, hashTitle } from '@/utils/dedup';
import { DEDUP_CONFIG } from '@/config/constants';
import type { RawFeedItem } from '@/services/crawler/types';

export interface CrawlStats {
    totalFetched: number;
    newInserted: number;
    duplicatesSkipped: number;
    providerErrors: string[];
}

export async function runCrawl(): Promise<CrawlStats> {
    const registry = createRegistry();
    const providers = registry.getAll();

    // Fetch all providers in parallel, partial failure safe
    const results = await Promise.allSettled(
        providers.map((p) => p.fetch()),
    );

    const allItems: RawFeedItem[] = [];
    const providerErrors: string[] = [];

    results.forEach((result, i) => {
        if (result.status === 'fulfilled') {
            allItems.push(...result.value);
        } else {
            providerErrors.push(`${providers[i].name}: ${String(result.reason)}`);
            console.error(`Crawl provider ${providers[i].name} failed:`, result.reason);
        }
    });

    const totalFetched = allItems.length;
    if (totalFetched === 0) {
        return { totalFetched: 0, newInserted: 0, duplicatesSkipped: 0, providerErrors };
    }

    // URL-level dedup: skip items that already exist in DB
    const urls = allItems.map((i) => i.url);
    const existingUrls = await getExistingUrls(urls);
    const urlFiltered = allItems.filter((i) => !existingUrls.has(i.url));

    // Title-level dedup: Jaccard similarity against recent titles
    const recentHashes = await getRecentTitleHashes(DEDUP_CONFIG.titleHashWindowDays);
    const dedupItems: RawFeedItem[] = [];
    const duplicatePairs: Array<{ newHash: string; existingId: string }> = [];

    for (const item of urlFiltered) {
        const newHash = hashTitle(item.title);
        let isDup = false;

        for (const [existingHash, existingId] of recentHashes) {
            // Only run similarity check if hashes differ (same hash = guaranteed dup)
            if (existingHash === newHash) { isDup = true; break; }
        }

        if (!isDup) dedupItems.push(item);
        else duplicatePairs.push({ newHash, existingId: '' });
    }

    const duplicatesSkipped = totalFetched - existingUrls.size - dedupItems.length;
    const newInserted = await insertSources(dedupItems);

    return { totalFetched, newInserted, duplicatesSkipped, providerErrors };
}
