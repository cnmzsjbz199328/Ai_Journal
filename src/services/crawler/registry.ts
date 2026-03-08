/**
 * SourceRegistry — factory + registry for all data source providers.
 * Provides category-based filtering and bulk fetch coordination.
 */

import type { SourceProvider } from './types';

export class SourceRegistry {
    private providers: Map<string, SourceProvider> = new Map();

    register(provider: SourceProvider): void {
        this.providers.set(provider.name, provider);
    }

    getAll(): SourceProvider[] {
        return Array.from(this.providers.values());
    }

    getByCategory(category: string): SourceProvider[] {
        return this.getAll().filter((p) => p.category === category);
    }

    getByName(name: string): SourceProvider | undefined {
        return this.providers.get(name);
    }

    get size(): number {
        return this.providers.size;
    }
}
