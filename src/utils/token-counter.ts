/**
 * Token estimation utilities.
 * Uses a word-based approximation (words × 1.3) suitable for planning budgets.
 * Not a replacement for a real tokenizer, but sufficient for pre-flight checks.
 */

const TOKENS_PER_WORD = 1.3;

/** Estimate token count for a text string */
export function estimateTokens(text: string): number {
    if (!text) return 0;
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    return Math.ceil(wordCount * TOKENS_PER_WORD);
}

/** Check if text fits within a token budget */
export function isWithinBudget(text: string, maxTokens: number): boolean {
    return estimateTokens(text) <= maxTokens;
}
