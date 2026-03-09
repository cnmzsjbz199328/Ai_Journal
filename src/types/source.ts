/**
 * Source data types for the AI Journal pipeline.
 * Defines the three-layer progressive disclosure data model.
 */

// ---------- Status & Role Enums ----------

export type SourceStatus = 'fresh' | 'active' | 'cooling' | 'archived';

export type UsageRole = 'primary' | 'secondary' | 'easter_egg';

// ---------- Core Data Model ----------

/** Raw crawled source item — full database record */
export interface SourceItem {
  id: string;
  title: string;
  source: string;
  category: string;
  url: string;
  timestamp: string; // ISO 8601
  abstract: string | null;
  content: string | null;
  imageUrl: string | null;

  // Curator AI fields
  curatedSummary: string | null;
  keyFacts?: string[] | null;

  // Reuse management
  usageCount: number;
  usageWeight: number; // 0.0 ~ 1.0
  lastUsedAt: string | null;
  cooldownUntil: string | null;
  usageRoles: UsageRole[];
  status: SourceStatus;
  wordCount?: number | null;

  // Dedup fields
  titleHash: string | null;
  duplicateOf: string | null;
}

// ---------- Layer Views ----------

/** Stage 1 view — Gatekeeper only sees this */
export interface CatalogEntry {
  id: string;
  title: string;
  source: string;
  category: string;
  previousRoles: UsageRole[];
}

/** Content Reveal output — sent to Curator */
export interface RevealedContent {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  // Optional cache bypass fields
  curatedSummary?: string | null;
  keyFacts?: string[] | null;
  wordCount?: number | null;
}

/** Provider health tracking */
export interface ProviderHealthCheck {
  providerName: string;
  lastSuccessfulCrawl: Date | null;
  consecutiveFailures: number;
  averageItemsPerCrawl: number;
  status: 'active' | 'degraded' | 'dead';
}

/** Source health aggregate metrics */
export interface SourceHealthMetrics {
  newSourcesLast24h: number;
  activePoolSize: number;
  contributionByProvider: Record<string, number>;
  status: 'healthy' | 'warning' | 'critical';
}
