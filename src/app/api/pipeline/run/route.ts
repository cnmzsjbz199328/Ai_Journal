/**
 * POST /api/pipeline/run
 * Triggers the full end-to-end pipeline: crawl → AI → save article.
 */

import { NextResponse } from 'next/server';
import { runCrawl } from '@/services/crawler/crawl-runner';
import { getActiveSources } from '@/services/storage/source-store';
import { runPipeline } from '@/services/ai/pipeline';
import { insertArticle, updateArticleStatus } from '@/services/storage/article-store';
import { postArticleTeaser } from '@/services/publishing/twitter';
import { revalidatePath } from 'next/cache';
import type { SourceItem, UsageRole } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST() {
    try {
        // Step 1: Crawl all providers
        const crawlStats = await runCrawl();
        console.log('[pipeline/run] Crawl complete:', crawlStats);

        // Step 2: Load active sources from DB
        const dbSources = await getActiveSources();
        if (dbSources.length === 0) {
            return NextResponse.json(
                { success: false, error: 'No active sources in database' },
                { status: 422 },
            );
        }

        // Map DB rows to SourceItem shape
        const sources: SourceItem[] = dbSources.map((s) => ({
            id: s.id,
            title: s.title,
            source: s.sourceName,
            category: s.category,
            url: s.url,
            timestamp: s.crawledAt?.toISOString() ?? new Date().toISOString(),
            abstract: s.abstract,
            content: s.content,
            imageUrl: s.imageUrl,
            curatedSummary: s.curatedSummary,
            usageCount: s.usageCount ?? 0,
            usageWeight: Number(s.usageWeight ?? 1),
            lastUsedAt: s.lastUsedAt?.toISOString() ?? null,
            cooldownUntil: s.cooldownUntil?.toISOString() ?? null,
            usageRoles: ((s.usageRoles as string[]) ?? []) as UsageRole[],
            status: (s.status ?? 'fresh') as SourceItem['status'],
            titleHash: s.titleHash,
            duplicateOf: s.duplicateOf,
        }));

        // Step 3: Run AI pipeline
        const result = await runPipeline(sources);

        // Step 4: Save article to DB
        const articleId = await insertArticle(result);

        // Auto-publish by default for the MVP, or based on env config
        if (process.env.AUTO_PUBLISH !== 'false') {
            await updateArticleStatus(articleId, 'published');
        }

        // Step 5: Publishing Automation
        revalidatePath('/');
        revalidatePath('/articles');

        // Create absolute URL for social media
        const appUrl = process.env.NEXT_PUBLIC_SITE_URL ||
            (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
        const articleUrl = `${appUrl}/articles/${articleId}`;

        // Fire and forget social media post
        await postArticleTeaser(articleId, result.article.title, result.theme, articleUrl);

        return NextResponse.json({
            success: true,
            articleId,
            theme: result.theme,
            wordCount: result.article.wordCount,
            crawlStats,
        });
    } catch (err) {
        console.error('[pipeline/run] Error:', err);
        return NextResponse.json(
            { success: false, error: String(err) },
            { status: 500 },
        );
    }
}
