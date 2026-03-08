/**
 * Stage 1.5: Content Curator — independent AI agent.
 * INFORMATION FIREWALL: does NOT receive outline or theme from Stage 1.
 * Produces curated summaries and key facts from raw content only.
 */

import { callAI } from './client';
import { parseAIResponse } from './parser';
import type { RevealedContent } from '@/types';
import type { CuratorOutput, CuratedSource } from '@/types';

const SYSTEM_PROMPT = `You are a research assistant preparing source materials for editorial review.
Be OBJECTIVE — do not editorialize or interpret connection between sources.
Do NOT speculate about how these sources might be related.
Respond with ONLY valid JSON, no explanation outside the JSON.`;

function buildPrompt(sources: RevealedContent[]): string {
    const sourcesText = sources
        .map((s) => `ID: ${s.id}\nTitle: ${s.title}\nContent:\n${s.content}`)
        .join('\n\n---\n\n');

    return `For each source below, provide a curated summary (100-200 words),
3-5 key facts, and a content quality rating (poor/fair/good/rich).

Sources:
${sourcesText}

Respond in JSON:
{
  "sources": [
    {
      "id": "source-id",
      "curatedSummary": "...",
      "keyFacts": ["fact1", "fact2", "fact3"],
      "contentQuality": "good",
      "wordCount": 150
    }
  ]
}`;
}

function buildFallback(sources: RevealedContent[]): CuratorOutput {
    return {
        sources: sources.map((s): CuratedSource => ({
            id: s.id,
            curatedSummary: s.content.slice(0, 300) || s.title,
            keyFacts: [s.title],
            contentQuality: 'fair',
            wordCount: s.content.split(/\s+/).length,
        })),
    };
}

export async function curateSources(
    sources: RevealedContent[],
): Promise<CuratorOutput> {
    if (sources.length === 0) throw new Error('Curator: no sources to curate');

    try {
        const raw = await callAI(buildPrompt(sources), { systemPrompt: SYSTEM_PROMPT });
        const parsed = parseAIResponse<CuratorOutput>(raw, ['sources']);

        // Validate each source has required fields
        for (const src of parsed.sources) {
            if (!src.curatedSummary || src.curatedSummary.length < 20) {
                throw new Error(`Curator: insufficient summary for source ${src.id}`);
            }
        }
        return parsed;
    } catch (err) {
        console.error('Curator failed, using fallback:', err);
        return buildFallback(sources);
    }
}
