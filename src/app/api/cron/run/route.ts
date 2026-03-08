/**
 * GET /api/cron/run
 * Triggered by Vercel Cron on a configured schedule (e.g., every 12 hours).
 * Runs the full pipeline and purges Next.js cache for the homepage.
 */

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { runCrawl } from '@/services/crawler/crawl-runner';
import { getActiveSources } from '@/services/storage/source-store';
import { runPipeline } from '@/services/ai/pipeline';
import { insertArticle } from '@/services/storage/article-store';
import { postArticleTeaser } from '@/services/publishing/twitter';
import type { SourceItem, UsageRole } from '@/types';

export async function GET(req: NextRequest) {
    // 1. Verify Vercel Cron Secret for security
    const authHeader = req.headers.get('authorization');
    if (
        process.env.CRON_SECRET &&
        authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        console.log('[Cron] Starting scheduled journal generation...');

        // 2. Fetch fresh content from all providers
        const crawlStats = await runCrawl();
        console.log('[Cron] Crawl complete:', crawlStats);

        // 3. Retrieve active, deduplicated sources
        const dbSources = await getActiveSources();
        if (dbSources.length === 0) {
            return NextResponse.json({ success: false, reason: 'No fresh sources available.' });
        }

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

        // 4. Run AI Pipeline
        const result = await runPipeline(sources);

        // 5. Store the generated article
        const articleId = await insertArticle(result);
        console.log(`[Cron] Generated Article ID: ${articleId}`);

        // 6. Automated Publishing & Cache Purge
        revalidatePath('/');
        revalidatePath('/archive');

        // 7. Social Media Promotion
        // Generates a mock URL for the live site based on Vercel env, fallback to localhost
        const appUrl = process.env.NEXT_PUBLIC_SITE_URL ||
            (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
        const articleUrl = `${appUrl}/articles/${articleId}`;

        await postArticleTeaser(articleId, result.article.title, result.theme, articleUrl);

        return NextResponse.json({
            success: true,
            articleId,
            crawlStats,
            published: true
        });

    } catch (error) {
        console.error('[Cron Error]', error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
