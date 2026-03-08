/**
 * Verification: Dedup utilities.
 */

import { describe, it, expect } from 'vitest';
import {
    normalizeTitle,
    titleSimilarity,
    isDuplicateTitle,
    hashTitle,
} from '../../src/utils/dedup';

describe('normalizeTitle', () => {
    it('lowercases and strips punctuation', () => {
        expect(normalizeTitle('Hello, World!')).toBe('hello world');
    });

    it('removes stop words', () => {
        expect(normalizeTitle('The Cat is on the Mat')).toBe('cat mat');
    });

    it('sorts remaining words', () => {
        expect(normalizeTitle('Zebra Apple Mango')).toBe('apple mango zebra');
    });

    it('handles empty string', () => {
        expect(normalizeTitle('')).toBe('');
    });
});

describe('titleSimilarity', () => {
    it('returns 1 for identical titles', () => {
        expect(titleSimilarity('Cats are great', 'Cats are great')).toBe(1);
    });

    it('returns 1 for titles that differ only by stop words', () => {
        const sim = titleSimilarity(
            'The New Cat Study',
            'A New Cat Study',
        );
        expect(sim).toBe(1);
    });

    it('returns 0 for completely different titles', () => {
        const sim = titleSimilarity(
            'Quantum Computing Breakthrough',
            'Pizza Recipe Tips',
        );
        expect(sim).toBe(0);
    });

    it('returns value between 0 and 1 for partial overlap', () => {
        const sim = titleSimilarity(
            'Arctic Ice Melting Faster',
            'Arctic Ice Disappearing Rapidly',
        );
        expect(sim).toBeGreaterThan(0);
        expect(sim).toBeLessThan(1);
    });
});

describe('isDuplicateTitle', () => {
    it('flags near-duplicate titles', () => {
        expect(isDuplicateTitle(
            'NASA Discovers Planet Mars Mission Success',
            'NASA Discovers Mars Planet Mission Update',
        )).toBe(true);
    });

    it('does not flag distinct titles', () => {
        expect(isDuplicateTitle(
            'Stock Market Crashes',
            'New Dinosaur Species Found',
        )).toBe(false);
    });
});

describe('hashTitle', () => {
    it('returns consistent hash for same title', () => {
        const h1 = hashTitle('Hello World');
        const h2 = hashTitle('Hello World');
        expect(h1).toBe(h2);
    });

    it('returns same hash regardless of stop words', () => {
        const h1 = hashTitle('The Cat');
        const h2 = hashTitle('A Cat');
        expect(h1).toBe(h2);
    });

    it('returns a 64-char hex string', () => {
        const hash = hashTitle('Some Title');
        expect(hash).toMatch(/^[0-9a-f]{64}$/);
    });
});
