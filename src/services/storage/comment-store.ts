/**
 * Comment Store — CRUD for the comments table.
 */

import { db } from '@/lib/db';
import { comments } from '@/lib/schema';
import { eq, and, desc } from 'drizzle-orm';
import { createHash } from 'crypto';

/** Hash an IP address for privacy */
export function hashIp(ip: string): string {
    return createHash('sha256').update(ip).digest('hex').slice(0, 16);
}

/** Create a new guest comment */
export async function insertComment(
    articleId: string,
    authorName: string,
    content: string,
    ipHash: string,
): Promise<string> {
    const [row] = await db
        .insert(comments)
        .values({ articleId, authorName: authorName || 'Guest', content, ipHash })
        .returning({ id: comments.id });

    return row.id;
}

/** Get visible comments for an article, newest first */
export async function getCommentsByArticle(articleId: string) {
    return db
        .select({
            id: comments.id,
            authorName: comments.authorName,
            content: comments.content,
            createdAt: comments.createdAt,
        })
        .from(comments)
        .where(
            and(
                eq(comments.articleId, articleId),
                eq(comments.isHidden, false),
            ),
        )
        .orderBy(desc(comments.createdAt));
}

/** Admin: hide a comment by ID */
export async function hideComment(id: string): Promise<void> {
    await db
        .update(comments)
        .set({ isHidden: true })
        .where(eq(comments.id, id));
}
