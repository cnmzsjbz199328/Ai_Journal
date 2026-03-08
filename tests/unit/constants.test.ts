/**
 * Verification: All source configs have required fields
 * and all constant values are within valid ranges.
 */

import { describe, it, expect } from 'vitest';
import {
    SOURCE_CONFIGS,
    TOKEN_BUDGET,
    REUSE_CONFIG,
    DEDUP_CONFIG,
    HEALTH_THRESHOLDS,
    ENTITY_MAP,
} from '../../src/config/constants';

describe('SOURCE_CONFIGS', () => {
    const entries = Object.entries(SOURCE_CONFIGS);

    it('has at least 3 source configs', () => {
        expect(entries.length).toBeGreaterThanOrEqual(3);
    });

    it.each(entries)(
        '%s has all required fields',
        (_key, config) => {
            expect(config.url).toBeTruthy();
            expect(config.name).toBeTruthy();
            expect(config.category).toBeTruthy();
            expect(config.crawlFrequency).toBeTruthy();
            expect(config.maxItems).toBeGreaterThan(0);
        },
    );
});

describe('TOKEN_BUDGET', () => {
    it('stage1 has positive limits', () => {
        expect(TOKEN_BUDGET.stage1.maxInputTokens).toBeGreaterThan(0);
        expect(TOKEN_BUDGET.stage1.maxOutputTokens).toBeGreaterThan(0);
        expect(TOKEN_BUDGET.stage1.maxSourcesInCatalog).toBeGreaterThan(0);
    });

    it('stage2 target word count is valid', () => {
        const { min, max } = TOKEN_BUDGET.stage2.targetWordCount;
        expect(min).toBeGreaterThan(0);
        expect(max).toBeGreaterThan(min);
    });
});

describe('REUSE_CONFIG', () => {
    it('decay factor is between 0 and 1', () => {
        expect(REUSE_CONFIG.decayFactor).toBeGreaterThan(0);
        expect(REUSE_CONFIG.decayFactor).toBeLessThan(1);
    });

    it('max usage count is positive', () => {
        expect(REUSE_CONFIG.maxUsageCount).toBeGreaterThan(0);
    });
});

describe('DEDUP_CONFIG', () => {
    it('similarity threshold is between 0 and 1', () => {
        expect(DEDUP_CONFIG.similarityThreshold).toBeGreaterThan(0);
        expect(DEDUP_CONFIG.similarityThreshold).toBeLessThan(1);
    });
});

describe('HEALTH_THRESHOLDS', () => {
    it('critical thresholds are lower than min thresholds', () => {
        expect(HEALTH_THRESHOLDS.criticalDailyInflow)
            .toBeLessThan(HEALTH_THRESHOLDS.minDailyInflow);
        expect(HEALTH_THRESHOLDS.criticalActivePool)
            .toBeLessThan(HEALTH_THRESHOLDS.minActivePool);
    });
});

describe('ENTITY_MAP', () => {
    it('covers essential HTML entities', () => {
        const essentials = ['&amp;', '&lt;', '&gt;', '&quot;', '&#39;'];
        for (const entity of essentials) {
            expect(ENTITY_MAP[entity]).toBeDefined();
        }
    });

    it('has at least 10 entries', () => {
        expect(Object.keys(ENTITY_MAP).length).toBeGreaterThanOrEqual(10);
    });
});
