/**
 * Pipeline Orchestrator — coordinates the full progressive-disclosure pipeline.
 * Enforces information firewall between stages.
 *
 * Flow: Catalog → [Stage 1: Gatekeeper] → Reveal → [Stage 1.5: Curator] → [Stage 2: Generator]
 */

import { selectTopics } from './gatekeeper';
import { revealContent } from './revealer';
import { curateSources } from './curator';
import { generateArticle } from './generator';
import type { SourceItem, CatalogEntry, GeneratorInput, GeneratorOutput } from '@/types';

export interface PipelineResult {
    article: GeneratorOutput;
    selectedIds: string[];
    theme: string;
    outline: string[];
    rationale: string;
    tokenLog: {
        catalogSize: number;
        revealedSources: number;
    };
}

/** Build the Stage 1 catalog view from source items */
function buildCatalog(sources: SourceItem[]): CatalogEntry[] {
    return sources
        .filter((s) => s.status !== 'cooling' && s.status !== 'archived')
        .filter((s) => !s.duplicateOf)
        .sort((a, b) => b.usageWeight - a.usageWeight)
        .map((s) => ({
            id: s.id,
            title: s.title,
            source: s.source,
            category: s.category,
            previousRoles: s.usageRoles,
        }));
}

/**
 * Run the complete AI pipeline.
 * FIREWALL: Curator never receives outline or theme from Stage 1.
 */
export async function runPipeline(
    sources: SourceItem[],
): Promise<PipelineResult> {
    // Stage 1: Gatekeeper — sees only catalog (titles + sources)
    const catalog = buildCatalog(sources);
    if (catalog.length === 0) throw new Error('Pipeline: no eligible sources');

    const { selectedIds, theme, outline, rationale, roleAssignments } =
        await selectTopics(catalog);

    // Content Reveal — load selected source content
    const revealed = revealContent(sources, selectedIds);

    // Stage 1.5: Curator — sees only raw content, NOT the outline (firewall)
    const curated = await curateSources(revealed);

    // Stage 2: Generator — receives outline (Stage 1) + curated (Stage 1.5)
    const generatorInput: GeneratorInput = {
        theme,
        outline,
        sources: curated.sources.map((cs) => {
            const original = revealed.find((r) => r.id === cs.id);
            return {
                id: cs.id,
                title: original?.title ?? cs.id,
                curatedSummary: cs.curatedSummary,
                keyFacts: cs.keyFacts,
                imageUrl: original?.imageUrl ?? null,
            };
        }),
    };

    const article = await generateArticle(generatorInput);

    console.log('Pipeline complete:', {
        theme, selectedIds, role: roleAssignments,
        wordCount: article.wordCount,
    });

    return {
        article,
        selectedIds,
        theme,
        outline,
        rationale,
        tokenLog: { catalogSize: catalog.length, revealedSources: revealed.length },
    };
}
