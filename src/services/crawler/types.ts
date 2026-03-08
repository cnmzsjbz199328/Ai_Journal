/**
 * Crawler service type definitions.
 * Defines the SourceProvider contract and intermediate types.
 */

/** Standardized output that all providers must return */
export interface RawFeedItem {
    title: string;
    url: string;
    source: string;
    category: string;
    timestamp: string; // ISO 8601
    abstract: string | null;
    content: string | null;
    imageUrl: string | null;
}

/**
 * Every data source — RSS, API, or AI-enriched —
 * must implement this single-method interface.
 */
export interface SourceProvider {
    readonly name: string;
    readonly category: string;

    /** Fetch and return normalized items */
    fetch(): Promise<RawFeedItem[]>;
}
