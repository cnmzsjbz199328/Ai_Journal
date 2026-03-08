/**
 * Centralized configuration constants for the AI Journal system.
 * All magic values live here — no hardcoding in business logic.
 */

// ---------- Source Provider Configs ----------

export interface SourceConfig {
    url: string;
    name: string;
    category: string;
    crawlFrequency: string;
    maxItems: number;
}

export const SOURCE_CONFIGS: Record<string, SourceConfig> = {
    BBC: {
        url: 'https://feeds.bbci.co.uk/news/rss.xml',
        name: 'BBC News',
        category: 'general',
        crawlFrequency: '1h',
        maxItems: 10,
    },
    TECHCRUNCH: {
        url: 'https://techcrunch.com/feed/',
        name: 'TechCrunch',
        category: 'technology',
        crawlFrequency: '1h',
        maxItems: 10,
    },
    NATURE: {
        url: 'https://www.nature.com/nature.rss',
        name: 'Nature',
        category: 'science',
        crawlFrequency: '2h',
        maxItems: 10,
    },
    SCIENCEDAILY: {
        url: 'https://www.sciencedaily.com/rss/all.xml',
        name: 'ScienceDaily',
        category: 'science',
        crawlFrequency: '2h',
        maxItems: 10,
    },
    HACKERNEWS: {
        url: 'https://hacker-news.firebaseio.com/v0',
        name: 'Hacker News',
        category: 'technology',
        crawlFrequency: '30min',
        maxItems: 10,
    },
    THE_ONION: {
        url: 'https://theonion.com/feed/',
        name: 'The Onion',
        category: 'satire',
        crawlFrequency: '2h',
        maxItems: 5,
    },
} as const;

// ---------- Token Budget ----------

export const TOKEN_BUDGET = {
    stage1: {
        maxInputTokens: 800,
        maxOutputTokens: 500,
        maxSourcesInCatalog: 50,
    },
    reveal: {
        maxSourcesSelected: 5,
        maxTokensPerSource: 1000,
        maxTotalContextTokens: 4000,
        preferAbstract: true,
    },
    curator: {
        maxInputTokens: 2000,
        maxOutputTokens: 800,
        maxSummaryWords: 200,
    },
    stage2: {
        maxInputTokens: 3000,
        maxOutputTokens: 2000,
        targetWordCount: { min: 800, max: 1500 },
    },
} as const;

// ---------- Reuse Strategy ----------

export const REUSE_CONFIG = {
    decayFactor: 0.3,
    maxUsageCount: 3,
    cooldownDays: { 1: 7, 2: 30, 3: 90 } as Record<number, number>,
    archiveWeightThreshold: 0.05,
} as const;

// ---------- Dedup ----------

export const DEDUP_CONFIG = {
    similarityThreshold: 0.6,
    titleHashWindowDays: 7,
} as const;

// ---------- Health Monitor ----------

export const HEALTH_THRESHOLDS = {
    minDailyInflow: 10,
    criticalDailyInflow: 3,
    minActivePool: 50,
    criticalActivePool: 20,
    minActiveSources: 3,
    providerDegradedAfter: 3,   // consecutive failures
    providerDeadAfter: 10,
} as const;

// ---------- HTML Entity Map ----------

export const ENTITY_MAP: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&#x27;': "'",
    '&apos;': "'",
    '&nbsp;': ' ',
    '&mdash;': '—',
    '&ndash;': '–',
    '&hellip;': '…',
    '&lsquo;': '\u2018',
    '&rsquo;': '\u2019',
    '&ldquo;': '\u201C',
    '&rdquo;': '\u201D',
    '&copy;': '©',
    '&reg;': '®',
    '&trade;': '™',
    '&bull;': '•',
    '&middot;': '·',
    '&#x2019;': '\u2019',
    '&#x2018;': '\u2018',
    '&#x201C;': '\u201C',
    '&#x201D;': '\u201D',
};

// ---------- AI Backend ----------

export const AI_CONFIG = {
    baseUrl: 'https://unified-ai-backend.tj15982183241.workers.dev',
    modelPath: '/v1/models/large/nvidia',
    timeoutMs: 60_000,
    maxRetries: 1,
    model: 'nvidia/llama-3.3-nemotron-super-49b-v1.5',
} as const;

// ---------- RSS Fetch ----------

export const RSS_FETCH_CONFIG = {
    timeoutMs: 10_000,
    userAgent:
        'Mozilla/5.0 (compatible; AIJournalBot/1.0; +https://aijournal.ai)',
} as const;
