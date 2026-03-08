/**
 * GET  /api/articles/[id]/comments — list visible comments
 * POST /api/articles/[id]/comments — create guest comment
 */

import { NextRequest, NextResponse } from 'next/server';
import {
    getCommentsByArticle,
    insertComment,
    hashIp,
} from '@/services/storage/comment-store';
import { getArticleById } from '@/services/storage/article-store';

export const dynamic = 'force-dynamic';

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
        const commentsList = await getCommentsByArticle(id);
        return NextResponse.json({ comments: commentsList });
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}

export async function POST(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const { id } = params;
    try {
        // Verify article exists
        const article = await getArticleById(id);
        if (!article) {
            return NextResponse.json({ error: 'Article not found' }, { status: 404 });
        }

        const body = await req.json() as { authorName?: string; content?: string };
        if (!body.content || body.content.trim().length < 2) {
            return NextResponse.json({ error: 'Comment content is required' }, { status: 400 });
        }
        if (body.content.length > 2000) {
            return NextResponse.json({ error: 'Comment exceeds 2000 characters' }, { status: 400 });
        }

        const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown';
        const ipHash = hashIp(ip);
        const commentId = await insertComment(
            id,
            body.authorName?.trim() ?? 'Guest',
            body.content.trim(),
            ipHash,
        );

        return NextResponse.json({ success: true, commentId }, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
