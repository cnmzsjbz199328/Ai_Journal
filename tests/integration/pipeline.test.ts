/**
 * Integration test: Live AI pipeline with mock source data.
 * Tests the unified AI backend + full progressive-disclosure pipeline.
 */

import { describe, it, expect } from 'vitest';
import { callAI } from '../../src/services/ai/client';
import { extractJSON } from '../../src/services/ai/parser';
import { revealContent } from '../../src/services/ai/revealer';
import type { SourceItem } from '../../src/types';

// --------------- Mock source data ---------------

const MOCK_SOURCES: SourceItem[] = [
    {
        id: 'src-001',
        title: 'Cats Hunt More Efficiently at Night',
        source: 'Nature',
        category: 'science',
        url: 'https://nature.com/cat-hunting',
        timestamp: new Date().toISOString(),
        abstract: 'Researchers found domestic cats have 87% hunting success rate in darkness.',
        content: 'A detailed study of feline nocturnal hunting behavior across 50 cats...',
        imageUrl: null,
        curatedSummary: null,
        usageCount: 0, usageWeight: 1.0,
        lastUsedAt: null, cooldownUntil: null,
        usageRoles: [], status: 'fresh',
        titleHash: null, duplicateOf: null,
    },
    {
        id: 'src-002',
        title: 'Drone Swarm Tactics in Modern Warfare',
        source: 'BBC',
        category: 'technology',
        url: 'https://bbc.com/drone-swarm',
        timestamp: new Date().toISOString(),
        abstract: 'Military analysts report autonomous drone swarms achieve 93% target acquisition.',
        content: 'The rise of autonomous drone warfare represents a paradigm shift...',
        imageUrl: null,
        curatedSummary: null,
        usageCount: 0, usageWeight: 1.0,
        lastUsedAt: null, cooldownUntil: null,
        usageRoles: [], status: 'fresh',
        titleHash: null, duplicateOf: null,
    },
    {
        id: 'src-003',
        title: 'Ancient Stoic Philosophy Resurfaces in Corporate Wellness',
        source: 'HackerNews',
        category: 'technology',
        url: 'https://hn.com/stoic-wellness',
        timestamp: new Date().toISOString(),
        abstract: 'Silicon Valley firms adopt Stoic practices to combat burnout.',
        content: 'Marcus Aurelius never attended a stand-up meeting, yet his teachings...',
        imageUrl: null,
        curatedSummary: null,
        usageCount: 0, usageWeight: 0.8,
        lastUsedAt: null, cooldownUntil: null,
        usageRoles: [], status: 'active',
        titleHash: null, duplicateOf: null,
    },
];

// --------------- Tests ---------------

describe('AI Client (live call)', () => {
    it('calls unified AI backend and gets a response', async () => {
        const response = await callAI('Say only: {"pong": true}');
        expect(response).toBeTruthy();
        expect(response.length).toBeGreaterThan(5);
    }, 30_000);

    it('can extract JSON from AI response', async () => {
        const response = await callAI(
            'Return exactly this JSON and nothing else: {"items": [1,2,3]}',
        );
        const parsed = extractJSON<{ items: number[] }>(response);
        expect(Array.isArray(parsed.items)).toBe(true);
    }, 30_000);
});

describe('Content Revealer (unit)', () => {
    it('reveals content for selected IDs', () => {
        const revealed = revealContent(MOCK_SOURCES, ['src-001', 'src-002']);
        expect(revealed).toHaveLength(2);
        expect(revealed[0].title).toBe('Cats Hunt More Efficiently at Night');
    });

    it('respects maxSourcesPerArticle limit', () => {
        const revealed = revealContent(MOCK_SOURCES, ['src-001', 'src-002', 'src-003'], {
            maxSourcesPerArticle: 2,
            maxTokensPerSource: 1000,
            maxTotalContextTokens: 4000,
            preferAbstract: true,
        });
        expect(revealed).toHaveLength(2);
    });

    it('prefers abstract over full content when configured', () => {
        const revealed = revealContent(MOCK_SOURCES, ['src-001'], {
            maxSourcesPerArticle: 5,
            maxTokensPerSource: 1000,
            maxTotalContextTokens: 4000,
            preferAbstract: true,
        });
        // abstract is shorter than content, so it should be used
        expect(revealed[0].content).toBe(MOCK_SOURCES[0].abstract);
    });
});
