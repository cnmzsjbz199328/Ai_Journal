/**
 * GET /api/articles?status=published&category=science&limit=10&offset=0
 * Returns a paginated list of articles.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getArticles } from '@/services/storage/article-store';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = req.nextUrl;
        const status = searchParams.get('status') ?? undefined;
        const category = searchParams.get('category') ?? undefined;
        const limit = Math.min(Number(searchParams.get('limit') ?? '10'), 50);
        const offset = Math.max(Number(searchParams.get('offset') ?? '0'), 0);

        const { rows, total } = await getArticles({ status, category, limit, offset });

        return NextResponse.json({
            articles: rows,
            total,
            hasMore: offset + rows.length < total,
        });
    } catch (err) {
        console.error('[GET /api/articles]', err);
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
