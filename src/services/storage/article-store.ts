/**
 * Article Store — CRUD operations for the articles table.
 */

import { db } from '@/lib/db';
import { articles } from '@/lib/schema';
import { eq, and, desc, count, ilike, or, type SQL } from 'drizzle-orm';
import { AI_CONFIG } from '@/config/constants';
import type { PipelineResult } from '@/services/ai/pipeline';

export interface ArticleListParams {
    status?: string;
    category?: string;
    limit?: number;
    offset?: number;
    search?: string;
}

/** Save a generated article from pipeline result */
export async function insertArticle(result: PipelineResult): Promise<string> {
    const [row] = await db
        .insert(articles)
        .values({
            title: result.article.title,
            abstract: result.article.abstract,
            content: result.article.content,
            theme: result.theme,
            category: result.article.category,
            outline: result.outline,
            sourceIds: result.selectedIds,
            wordCount: result.article.wordCount,
            aiModel: AI_CONFIG.model,
            gatekeeperRationale: result.rationale,
            status: 'draft',
        })
        .returning({ id: articles.id });

    return row.id;
}

/** Paginated article list with optional filters */
export async function getArticles(params: ArticleListParams = {}) {
    const { status, category, limit = 10, offset = 0, search } = params;
    const conditions: SQL[] = [];
    if (status) conditions.push(eq(articles.status, status));
    if (category) conditions.push(eq(articles.category, category));
    if (search) {
        conditions.push(
            or(
                ilike(articles.title, `%${search}%`),
                ilike(articles.theme, `%${search}%`)
            ) as SQL
        );
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const rows = await db
        .select({
            id: articles.id,
            title: articles.title,
            abstract: articles.abstract,
            theme: articles.theme,
            category: articles.category,
            wordCount: articles.wordCount,
            status: articles.status,
            coverImage: articles.coverImage,
            sourceIds: articles.sourceIds,
            createdAt: articles.createdAt,
            publishedAt: articles.publishedAt,
        })
        .from(articles)
        .where(where)
        .orderBy(desc(articles.createdAt))
        .limit(limit)
        .offset(offset);

    const [{ value: total }] = await db
        .select({ value: count() })
        .from(articles)
        .where(where);

    return { rows, total: Number(total) };
}

/** Get a single article by ID */
export async function getArticleById(id: string) {
    const [article] = await db
        .select()
        .from(articles)
        .where(eq(articles.id, id))
        .limit(1);

    return article ?? null;
}

/** Update article status (draft → published) */
export async function updateArticleStatus(
    id: string,
    status: 'draft' | 'published' | 'archived',
): Promise<void> {
    await db
        .update(articles)
        .set({
            status,
            publishedAt: status === 'published' ? new Date() : undefined,
        })
        .where(eq(articles.id, id));
}
