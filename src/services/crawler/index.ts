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
export { PhysOrgProvider } from './providers/physorg';
export { QuantaProvider } from './providers/quanta';
export { TheRegisterProvider } from './providers/theregister';

import { SourceRegistry } from './registry';
import { BBCProvider } from './providers/bbc';
import { NatureProvider } from './providers/nature';
import { ScienceDailyProvider } from './providers/sciencedaily';
import { PhysOrgProvider } from './providers/physorg';
import { QuantaProvider } from './providers/quanta';
import { TheRegisterProvider } from './providers/theregister';

/** Create a registry with all built-in providers registered */
export function createRegistry(): SourceRegistry {
    const registry = new SourceRegistry();
    registry.register(new BBCProvider());
    registry.register(new NatureProvider());
    registry.register(new ScienceDailyProvider());
    registry.register(new PhysOrgProvider());
    registry.register(new QuantaProvider());
    registry.register(new TheRegisterProvider());
    return registry;
}
