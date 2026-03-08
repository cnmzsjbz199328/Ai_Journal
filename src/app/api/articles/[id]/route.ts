/**
 * GET  /api/articles/[id] — fetch single article
 * PATCH /api/articles/[id] — update article status
 */

import { NextRequest, NextResponse } from 'next/server';
import { getArticleById, updateArticleStatus } from '@/services/storage/article-store';

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(
    _req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const { id } = params;
    try {
        const article = await getArticleById(id);
        if (!article) {
            return NextResponse.json({ error: 'Article not found' }, { status: 404 });
        }
        return NextResponse.json({ article });
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const { id } = params;
    try {
        const body = await req.json() as { status?: string };
        const validStatuses = ['draft', 'published', 'archived'] as const;
        type ValidStatus = typeof validStatuses[number];

        if (!body.status || !validStatuses.includes(body.status as ValidStatus)) {
            return NextResponse.json(
                { error: `status must be one of: ${validStatuses.join(', ')}` },
                { status: 400 },
            );
        }

        await updateArticleStatus(id, body.status as ValidStatus);
        return NextResponse.json({ success: true, id, status: body.status });
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
