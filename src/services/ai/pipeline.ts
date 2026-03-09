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
    roleAssignments: Record<string, string>;
    tokenLog: {
        catalogSize: number;
        revealedSources: number;
    };
    newlyCuratedSources: { id: string; curatedSummary: string; keyFacts: string[] }[];
}

/** Build the Stage 1 catalog view from source items */
function buildCatalog(sources: SourceItem[]): CatalogEntry[] {
    return sources
        .filter((s) => s.status !== 'archived')
        .filter((s) => !s.duplicateOf)
        .sort((a, b) => {
            const diff = b.usageWeight - a.usageWeight;
            if (Math.abs(diff) > 0.001) return diff;
            return Math.random() - 0.5; // Add jitter to break perfect ties and prevent AI position bias
        })
        .map((s) => ({
            id: s.id,
            title: s.title,
            source: s.source,
            category: s.category,
            previousRoles: s.usageRoles,
        }))
        .slice(0, 15);
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

    // Save newly generated curations back to the database for future bypass
    if (curated.isNewlyCuratedIds.size > 0) {
        const newlyCuratedItems = curated.sources.filter(s => curated.isNewlyCuratedIds.has(s.id));
        // We import updateSourceCurations here to avoid circular deps, or just pass it in.
        // Actually, it's safer to do this in the Orchestrator (route.ts) to keep pipeline.ts pure.
        // Let's attach isNewlyCuratedIds to the pipeline result instead.
    }

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
        roleAssignments: roleAssignments as any,
        tokenLog: { catalogSize: catalog.length, revealedSources: revealed.length },
        newlyCuratedSources: curated.sources.filter(s => curated.isNewlyCuratedIds.has(s.id)),
    };
}
