/**
 * Source Store — CRUD operations for the sources table.
 * All database interactions for source items live here.
 */

import { db } from '@/lib/db';
import { sources } from '@/lib/schema';
import { eq, inArray, and, gte, isNull, or, lt } from 'drizzle-orm';
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

/** Get all active (non-cooling, non-archived) sources, plus cooled-down ones */
export async function getActiveSources() {
    const now = new Date();
    return db
        .select()
        .from(sources)
        .where(
            and(
                isNull(sources.duplicateOf),
                or(
                    inArray(sources.status, ['fresh', 'active']),
                    and(
                        eq(sources.status, 'cooling'),
                        lt(sources.cooldownUntil, now)
                    )
                )
            ),
        );
}

/** Mark selected sources as used, triggering weight decay and cooldown */
export async function markSourcesAsUsed(
    sourceIds: string[],
    roleAssignments: Record<string, string>,
): Promise<void> {
    if (sourceIds.length === 0) return;

    const existingRows = await db
        .select({ id: sources.id, usageCount: sources.usageCount, usageWeight: sources.usageWeight, usageRoles: sources.usageRoles })
        .from(sources)
        .where(inArray(sources.id, sourceIds));

    for (const row of existingRows) {
        const newCount = (row.usageCount ?? 0) + 1;
        // Decay weight geometrically
        const newWeight = (Number(row.usageWeight) * 0.5).toFixed(4);

        // Append usage role
        const role = roleAssignments[row.id] || 'context';
        const currentRoles = (row.usageRoles as string[]) ?? [];
        const newRoles = [...currentRoles, role];

        // Retire after 3 uses, else put on 24h cooldown
        const nextStatus = newCount >= 3 ? 'archived' : 'cooling';
        const cooldown = new Date();
        cooldown.setHours(cooldown.getHours() + 24);

        await db
            .update(sources)
            .set({
                usageCount: newCount,
                usageWeight: newWeight as any,
                usageRoles: newRoles,
                status: nextStatus as any,
                lastUsedAt: new Date(),
                cooldownUntil: cooldown,
            })
            .where(eq(sources.id, row.id));
    }
}

/** Get specific sources by their IDs */
export async function getSourcesByIds(ids: string[]) {
    if (!ids || ids.length === 0) return [];

    return db
        .select({
            id: sources.id,
            title: sources.title,
            sourceName: sources.sourceName,
            url: sources.url,
            imageUrl: sources.imageUrl,
        })
        .from(sources)
        .where(inArray(sources.id, ids));
}

/** 
 * Save curated summaries and key facts back to the sources table
 * so they can be reused without burning AI tokens on future runs.
 */
export async function updateSourceCurations(
    curatedItems: { id: string; curatedSummary: string; keyFacts: string[] }[],
): Promise<void> {
    if (curatedItems.length === 0) return;

    for (const item of curatedItems) {
        await db
            .update(sources)
            .set({
                curatedSummary: item.curatedSummary,
                keyFacts: item.keyFacts,
            })
            .where(eq(sources.id, item.id));
    }
}
