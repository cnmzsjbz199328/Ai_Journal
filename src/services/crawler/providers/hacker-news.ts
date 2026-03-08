/**
 * Hacker News API Provider.
 * Fetches top stories via the Firebase API and maps to RawFeedItem.
 * Uses Promise.allSettled for partial-failure safety.
 */

import type { SourceProvider, RawFeedItem } from '../types';
import { SOURCE_CONFIGS, RSS_FETCH_CONFIG } from '@/config/constants';

interface HNStory {
    id: number;
    title: string;
    url?: string;
    score: number;
    time: number;
    by: string;
    text?: string;
}

const BASE_URL = SOURCE_CONFIGS.HACKERNEWS.url;
const MAX_ITEMS = SOURCE_CONFIGS.HACKERNEWS.maxItems;

export class HackerNewsProvider implements SourceProvider {
    readonly name = SOURCE_CONFIGS.HACKERNEWS.name;
    readonly category = SOURCE_CONFIGS.HACKERNEWS.category;

    async fetch(): Promise<RawFeedItem[]> {
        // Step 1: Fetch top story IDs
        const res = await fetch(`${BASE_URL}/topstories.json`, {
            headers: { 'User-Agent': RSS_FETCH_CONFIG.userAgent },
        });
        const allIds: number[] = await res.json();
        const topIds = allIds.slice(0, MAX_ITEMS);

        // Step 2: Fetch each story in parallel (partial failure safe)
        const results = await Promise.allSettled(
            topIds.map((id) => this.fetchStory(id)),
        );

        const items: RawFeedItem[] = [];
        for (const result of results) {
            if (result.status === 'fulfilled' && result.value) {
                items.push(result.value);
            }
        }

        if (items.length === 0) {
            throw new Error(`${this.name}: 0 stories fetched from ${topIds.length} IDs`);
        }

        return items;
    }

    private async fetchStory(id: number): Promise<RawFeedItem | null> {
        const res = await fetch(`${BASE_URL}/item/${id}.json`, {
            headers: { 'User-Agent': RSS_FETCH_CONFIG.userAgent },
        });
        const story: HNStory = await res.json();

        if (!story.title || !story.url) return null;

        return {
            title: story.title,
            url: story.url,
            source: this.name,
            category: this.category,
            timestamp: new Date(story.time * 1000).toISOString(),
            abstract: story.text ?? null,
            content: null,
            imageUrl: null, // HN stories don't have images
        };
    }
}
