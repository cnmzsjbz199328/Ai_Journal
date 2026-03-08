/**
 * AI pipeline request/response types.
 * Defines the contract for each AI stage.
 */

import type { CatalogEntry, RevealedContent, UsageRole } from './source';

// ---------- Stage 1: Content Gatekeeper ----------

export interface GatekeeperInput {
    sources: CatalogEntry[];
}

export interface GatekeeperOutput {
    selectedIds: string[];
    theme: string;
    outline: string[];
    rationale: string;
    /** Role assignments for each selected source */
    roleAssignments: Record<string, UsageRole>;
}

// ---------- Stage 1.5: Content Curator ----------

export interface CuratorInput {
    /** Raw content without outline — information firewall */
    sources: RevealedContent[];
}

export interface CuratedSource {
    id: string;
    curatedSummary: string;
    keyFacts: string[];
    contentQuality: 'poor' | 'fair' | 'good' | 'rich';
    wordCount: number;
}

export interface CuratorOutput {
    sources: CuratedSource[];
}

// ---------- Stage 2: Story Generator ----------

export interface GeneratorSourceInput {
    id: string;
    title: string;
    curatedSummary: string;
    keyFacts: string[];
    imageUrl: string | null;
}

export interface GeneratorInput {
    theme: string;
    outline: string[];
    sources: GeneratorSourceInput[];
}

export interface GeneratorOutput {
    title: string;
    content: string; // Markdown
    wordCount: number;
}

// ---------- Reveal Config ----------

export interface RevealConfig {
    maxSourcesPerArticle: number;
    maxTokensPerSource: number;
    maxTotalContextTokens: number;
    preferAbstract: boolean;
}
