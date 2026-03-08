/**
 * GET /api/sources?status=fresh&limit=20&offset=0
 * Returns a paginated list of source items.
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sources } from '@/lib/schema';
import { eq, desc, isNull, and, count, type SQL } from 'drizzle-orm';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = req.nextUrl;
        const status = searchParams.get('status') ?? undefined;
        const limit = Math.min(Number(searchParams.get('limit') ?? '20'), 100);
        const offset = Math.max(Number(searchParams.get('offset') ?? '0'), 0);

        const conditions: SQL[] = [isNull(sources.duplicateOf)];
        if (status) conditions.push(eq(sources.status, status));

        const where = and(...conditions);

        const rows = await db
            .select({
                id: sources.id,
                title: sources.title,
                sourceName: sources.sourceName,
                category: sources.category,
                url: sources.url,
                status: sources.status,
                usageCount: sources.usageCount,
                usageWeight: sources.usageWeight,
                imageUrl: sources.imageUrl,
                crawledAt: sources.crawledAt,
            })
            .from(sources)
            .where(where)
            .orderBy(desc(sources.crawledAt))
            .limit(limit)
            .offset(offset);

        const [{ value: total }] = await db
            .select({ value: count() })
            .from(sources)
            .where(where);

        return NextResponse.json({
            sources: rows,
            total: Number(total),
            hasMore: offset + rows.length < Number(total),
        });
    } catch (err) {
        console.error('[GET /api/sources]', err);
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
