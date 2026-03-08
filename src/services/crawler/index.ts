/**
 * Crawler module barrel export.
 * Creates and exports a pre-configured SourceRegistry.
 */

export { SourceRegistry } from './registry';
export type { SourceProvider, RawFeedItem } from './types';
export { BaseRssProvider } from './base-rss';

// Providers
export { BBCProvider } from './providers/bbc';
export { NatureProvider } from './providers/nature';
export { ScienceDailyProvider } from './providers/sciencedaily';
export { HackerNewsProvider } from './providers/hacker-news';

import { SourceRegistry } from './registry';
import { BBCProvider } from './providers/bbc';
import { NatureProvider } from './providers/nature';
import { ScienceDailyProvider } from './providers/sciencedaily';
import { HackerNewsProvider } from './providers/hacker-news';

/** Create a registry with all built-in providers registered */
export function createRegistry(): SourceRegistry {
    const registry = new SourceRegistry();
    registry.register(new BBCProvider());
    registry.register(new NatureProvider());
    registry.register(new ScienceDailyProvider());
    registry.register(new HackerNewsProvider());
    return registry;
}
