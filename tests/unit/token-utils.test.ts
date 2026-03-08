/**
 * Verification: Token and truncation utilities.
 */

import { describe, it, expect } from 'vitest';
import { estimateTokens, isWithinBudget } from '../../src/utils/token-counter';
import { truncateToTokenLimit, truncateToWordCount } from '../../src/utils/text-truncator';

describe('estimateTokens', () => {
    it('returns 0 for empty string', () => {
        expect(estimateTokens('')).toBe(0);
    });

    it('returns reasonable estimate for normal text', () => {
        const text = 'The quick brown fox jumps over the lazy dog'; // 9 words
        const tokens = estimateTokens(text);
        expect(tokens).toBeGreaterThan(9);
        expect(tokens).toBeLessThan(20);
    });

    it('scales linearly with text length', () => {
        const short = estimateTokens('one two three');
        const long = estimateTokens('one two three '.repeat(10));
        expect(long).toBeGreaterThan(short * 5);
    });
});

describe('isWithinBudget', () => {
    it('returns true when text fits', () => {
        expect(isWithinBudget('short text', 100)).toBe(true);
    });

    it('returns false when text exceeds budget', () => {
        const longText = 'word '.repeat(500);
        expect(isWithinBudget(longText, 10)).toBe(false);
    });
});

describe('truncateToTokenLimit', () => {
    it('returns original text if within limit', () => {
        const text = 'short text';
        expect(truncateToTokenLimit(text, 100)).toBe(text);
    });

    it('truncates to approximately maxTokens', () => {
        const text = 'word '.repeat(200).trim();
        const result = truncateToTokenLimit(text, 50);
        expect(estimateTokens(result)).toBeLessThanOrEqual(60); // allow small margin
    });

    it('truncates at word boundary', () => {
        const text = 'Hello World Goodbye CutHere';
        const result = truncateToTokenLimit(text, 2); // ~1 word
        // All returned words must be complete words from source
        const resultWords = result.split(' ');
        const sourceWords = text.split(' ');
        for (const w of resultWords) {
            expect(sourceWords).toContain(w);
        }
    });
});

describe('truncateToWordCount', () => {
    it('returns original when under limit', () => {
        expect(truncateToWordCount('one two three', 10)).toBe('one two three');
    });

    it('truncates to exact word count', () => {
        const result = truncateToWordCount('one two three four five', 3);
        expect(result).toBe('one two three');
    });
});
