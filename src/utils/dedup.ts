/**
 * Deduplication utilities.
 * Title normalization, Jaccard similarity, and SHA-256 hashing.
 */

import { createHash } from 'crypto';
import { DEDUP_CONFIG } from '@/config/constants';

const STOP_WORDS = new Set([
    'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for',
    'of', 'and', 'or', 'but', 'is', 'are', 'was', 'were',
    'new', 'says', 'shows', 'finds', 'reveals', 'how', 'why',
    'what', 'when', 'where', 'who', 'which', 'that', 'this',
    'has', 'have', 'had', 'be', 'been', 'being', 'do', 'does',
    'did', 'will', 'would', 'could', 'should', 'may', 'might',
    'can', 'it', 'its', 'not', 'no', 'with', 'from', 'by', 'as',
]);

/** Normalize title: lowercase, strip punctuation, remove stop words, sort */
export function normalizeTitle(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter((w) => w.length > 0 && !STOP_WORDS.has(w))
        .sort()
        .join(' ');
}

/** Jaccard similarity between two titles (0..1) */
export function titleSimilarity(a: string, b: string): number {
    const setA = new Set(normalizeTitle(a).split(' '));
    const setB = new Set(normalizeTitle(b).split(' '));

    if (setA.size === 0 && setB.size === 0) return 1;
    if (setA.size === 0 || setB.size === 0) return 0;

    const intersection = new Set([...setA].filter((x) => setB.has(x)));
    const union = new Set([...setA, ...setB]);

    return intersection.size / union.size;
}

/** Check if two titles are semantically duplicate */
export function isDuplicateTitle(a: string, b: string): boolean {
    return titleSimilarity(a, b) > DEDUP_CONFIG.similarityThreshold;
}

/** SHA-256 hash of normalized title */
export function hashTitle(title: string): string {
    const normalized = normalizeTitle(title);
    return createHash('sha256').update(normalized).digest('hex');
}
