/**
 * Source Store — CRUD operations for the sources table.
 * All database interactions for source items live here.
 */

import { db } from '@/lib/db';
import { sources } from '@/lib/schema';
import { eq, inArray, and, gte, isNull } from 'drizzle-orm';
import { hashTitle } from '@/utils/dedup';
import type { RawFeedItem } from '@/services/crawler/types';

/** Insert new source items, skipping URL conflicts */
export async function insertSources(items: RawFeedItem[]): Promise<number> {
    if (items.length === 0) return 0;

    let insertedCount = 0;
    for (const item of items) {
        try {
            await db.insert(sources).values({
                title: item.title,
                abstract: item.abstract,
                content: item.content,
                sourceName: item.source,
                url: item.url,
                category: item.category,
                imageUrl: item.imageUrl,
                publishedAt: item.timestamp ? new Date(item.timestamp) : null,
                titleHash: hashTitle(item.title),
                hasFullContent: !!item.content,
                wordCount: item.content?.split(/\s+/).length ?? null,
            }).onConflictDoNothing({ target: sources.url });
            insertedCount++;
        } catch {
            // Skip individual insert failures silently
        }
    }
    return insertedCount;
}

/** Get all URLs that already exist in the database */
export async function getExistingUrls(urls: string[]): Promise<Set<string>> {
    if (urls.length === 0) return new Set();

    const rows = await db
        .select({ url: sources.url })
        .from(sources)
        .where(inArray(sources.url, urls));

    return new Set(rows.map((r) => r.url));
}

/** Get recent title hashes for dedup checking */
export async function getRecentTitleHashes(
    days: number,
): Promise<Map<string, string>> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const rows = await db
        .select({ id: sources.id, titleHash: sources.titleHash })
        .from(sources)
        .where(
            and(
                gte(sources.crawledAt, cutoff),
                isNull(sources.duplicateOf),
            ),
        );

    const map = new Map<string, string>();
    for (const row of rows) {
        if (row.titleHash) map.set(row.titleHash, row.id);
    }
    return map;
}

/** Mark a source as a duplicate of another */
export async function markDuplicate(
    id: string,
    duplicateOfId: string,
): Promise<void> {
    await db
        .update(sources)
        .set({ duplicateOf: duplicateOfId })
        .where(eq(sources.id, id));
}

/** Get all active (non-cooling, non-archived) sources */
export async function getActiveSources() {
    return db
        .select()
        .from(sources)
        .where(
            and(
                inArray(sources.status, ['fresh', 'active']),
                isNull(sources.duplicateOf),
            ),
        );
}
