/**
 * Text truncation utilities for managing AI context window budgets.
 */

import { estimateTokens } from './token-counter';

/**
 * Truncate text to fit within a token budget (word-boundary safe).
 * Returns the original text if already within budget.
 */
export function truncateToTokenLimit(text: string, maxTokens: number): string {
    if (!text) return '';
    if (estimateTokens(text) <= maxTokens) return text;

    const words = text.trim().split(/\s+/);
    const targetWords = Math.floor(maxTokens / 1.3);
    return words.slice(0, targetWords).join(' ');
}

/**
 * Truncate text to a maximum word count.
 */
export function truncateToWordCount(text: string, maxWords: number): string {
    if (!text) return '';
    const words = text.trim().split(/\s+/);
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(' ');
}
