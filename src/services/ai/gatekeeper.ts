/**
 * Stage 1: Content Gatekeeper — topic selection AI.
 * Receives only catalog (titles + sources), produces theme + outline.
 * Never sees article content — that is the progressive disclosure contract.
 */

import { callAI } from './client';
import { parseAIResponse } from './parser';
import type { CatalogEntry } from '@/types';
import type { GatekeeperOutput } from '@/types';
import { TOKEN_BUDGET } from '@/config/constants';

const SYSTEM_PROMPT = `You are the editor-in-chief of a satirical academic journal.
You ONLY see article titles and sources — no content.
Select 3-5 sources that can be creatively combined into a single unexpected narrative.
Respond with ONLY valid JSON, no explanation outside the JSON.`;

function buildPrompt(catalog: CatalogEntry[]): string {
    const catalogText = catalog
        .slice(0, TOKEN_BUDGET.stage1.maxSourcesInCatalog)
        .map((e) => `[${e.id}] "${e.title}" — ${e.source} (${e.category})${e.previousRoles.length ? ` [used as: ${e.previousRoles.join(', ')}]` : ''}`)
        .join('\n');

    return `Today's catalog:\n${catalogText}\n\nRespond in JSON:
{
  "selectedIds": ["id1", "id2", "id3"],
  "theme": "Your chosen cross-domain theme",
  "outline": ["Section 1", "Section 2", "Section 3", "Section 4", "Section 5"],
  "rationale": "Why these sources work together",
  "roleAssignments": { "id1": "primary", "id2": "secondary", "id3": "easter_egg" }
}`;
}

function buildFallback(catalog: CatalogEntry[]): GatekeeperOutput {
    const selected = catalog.slice(0, 3);
    return {
        selectedIds: selected.map((e) => e.id),
        theme: 'Unexpected connections across disciplines',
        outline: ['Introduction', 'First Domain', 'Second Domain', 'The Connection', 'Conclusion'],
        rationale: 'Fallback selection',
        roleAssignments: Object.fromEntries(selected.map((e, i) =>
            [e.id, i === 0 ? 'primary' : i === 1 ? 'secondary' : 'easter_egg'],
        )) as Record<string, 'primary' | 'secondary' | 'easter_egg'>,
    };
}

export async function selectTopics(
    catalog: CatalogEntry[],
): Promise<GatekeeperOutput> {
    if (catalog.length === 0) throw new Error('Gatekeeper: empty catalog');

    try {
        const raw = await callAI(buildPrompt(catalog), { systemPrompt: SYSTEM_PROMPT });
        return parseAIResponse<GatekeeperOutput>(raw, [
            'selectedIds', 'theme', 'outline', 'rationale', 'roleAssignments',
        ]);
    } catch (err) {
        console.error('Gatekeeper failed, using fallback:', err);
        return buildFallback(catalog);
    }
}
