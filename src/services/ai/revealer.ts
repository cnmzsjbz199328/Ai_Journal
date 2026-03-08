/**
 * Content Revealer — pure data operation, no AI.
 * Loads selected source content per the token budget configuration.
 */

import type { SourceItem, RevealedContent, RevealConfig } from '@/types';
import { truncateToTokenLimit } from '@/utils/text-truncator';
import { TOKEN_BUDGET } from '@/config/constants';

const DEFAULT_CONFIG: RevealConfig = {
    maxSourcesPerArticle: TOKEN_BUDGET.reveal.maxSourcesSelected,
    maxTokensPerSource: TOKEN_BUDGET.reveal.maxTokensPerSource,
    maxTotalContextTokens: TOKEN_BUDGET.reveal.maxTotalContextTokens,
    preferAbstract: TOKEN_BUDGET.reveal.preferAbstract,
};

/**
 * Reveal content for selected source IDs.
 * Returns truncated content respecting the token budget per source.
 */
export function revealContent(
    sources: SourceItem[],
    selectedIds: string[],
    config: RevealConfig = DEFAULT_CONFIG,
): RevealedContent[] {
    const selected = sources
        .filter((s) => selectedIds.includes(s.id))
        .slice(0, config.maxSourcesPerArticle);

    return selected.map((source) => {
        const raw = config.preferAbstract
            ? source.abstract ?? source.content ?? ''
            : source.content ?? source.abstract ?? '';

        const content = truncateToTokenLimit(raw, config.maxTokensPerSource);

        return {
            id: source.id,
            title: source.title,
            content,
            imageUrl: source.imageUrl,
        };
    });
}
