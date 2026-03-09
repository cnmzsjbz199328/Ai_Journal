
import { runCrawl } from '../../src/services/crawler/crawl-runner';
import { getActiveSources } from '../../src/services/storage/source-store';
import { runPipeline } from '../../src/services/ai/pipeline';
import { insertArticle } from '../../src/services/storage/article-store';
import type { SourceItem, UsageRole } from '../../src/types';

async function main() {
    console.log('[Test] Starting pipeline execution...');

    // Step 1: Crawl all providers
    console.log('[Test] 1. Crawling sources...');
    const crawlStats = await runCrawl();
    console.log('[Test] Crawl complete:', crawlStats);

    // Step 2: Load active sources from DB
    console.log('[Test] 2. Fetching active sources from DB...');
    const dbSources = await getActiveSources();
    if (dbSources.length === 0) {
        console.error('[Test] No active sources found in database. Exiting.');
        return;
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

    // Step 3: Run AI pipeline
    console.log('[Test] 3. Running AI Pipeline (this may take a minute due to multiple API calls)...');
    try {
        const result = await runPipeline(sources);
        console.log('[Test] AI generated theme:', result.theme);

        // Step 4: Save article to DB
        console.log('[Test] 4. Inserting article into database...');
        const articleId = await insertArticle(result);

        console.log(`\n🎉 Success! Article generated and inserted!
Article ID: ${articleId}
Title: ${result.article.title}
Abstract: ${result.article.abstract}
Theme: ${result.theme}
Word Count: ${result.article.wordCount}
        `);
    } catch (err) {
        console.error('[Test] Pipeline failed:', err);
    }

    process.exit(0);
}

main().catch(console.error);
