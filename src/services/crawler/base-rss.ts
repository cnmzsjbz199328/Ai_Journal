/**
 * BaseRssProvider — abstract base class for RSS-based data sources.
 *
 * Improvements over prior project:
 * - maxItems as constructor param (not hardcoded)
 * - cleanDescription() hook for per-provider cleanup
 * - Enhanced error diagnostics (HTTP status, body length, XML preview)
 * - Date normalization to ISO 8601
 * - Four-level image extraction fallback
 */

import type { SourceProvider, RawFeedItem } from './types';
import { cleanText } from '@/utils/text-cleaner';
import { RSS_FETCH_CONFIG } from '@/config/constants';
import type { SourceConfig } from '@/config/constants';

export abstract class BaseRssProvider implements SourceProvider {
    readonly name: string;
    readonly category: string;

    constructor(
        protected config: SourceConfig,
        protected maxItems: number = config.maxItems,
    ) {
        this.name = config.name;
        this.category = config.category;
    }

    async fetch(): Promise<RawFeedItem[]> {
        const controller = new AbortController();
        const timeout = setTimeout(
            () => controller.abort(),
            RSS_FETCH_CONFIG.timeoutMs,
        );

        let xml: string;
        let httpStatus: number;

        try {
            const res = await fetch(this.config.url, {
                signal: controller.signal,
                headers: {
                    'User-Agent': RSS_FETCH_CONFIG.userAgent,
                    Accept: 'application/rss+xml, application/xml, text/xml, */*',
                },
            });
            httpStatus = res.status;
            xml = await res.text();
        } finally {
            clearTimeout(timeout);
        }

        const items: RawFeedItem[] = [];
        const matches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);

        for (const match of matches) {
            const item = this.parseItem(match[1]);
            if (item) items.push(item);
            if (items.length >= this.maxItems) break;
        }

        if (items.length === 0) {
            throw new Error(
                `${this.name}: 0 items parsed. ` +
                `HTTP ${httpStatus}, body ${xml.length} chars. ` +
                `Preview: ${xml.slice(0, 200)}`,
            );
        }

        return items;
    }

    /** Override this hook to clean source-specific dirty data */
    protected cleanDescription(desc: string): string {
        return desc;
    }

    protected parseItem(content: string): RawFeedItem | null {
        const title = this.extractCdata(content, 'title');
        const link = this.extractTag(content, 'link');
        const pubDate = this.extractTag(content, 'pubDate');

        if (!title || !link) return null;

        // Pick the longer of description vs content:encoded
        const desc = this.extractCdata(content, 'description') ?? '';
        const encoded = this.extractCdata(content, 'content:encoded') ?? '';
        const rawBody = encoded.length > desc.length ? encoded : desc;
        const cleaned = cleanText(this.cleanDescription(rawBody));

        const imageUrl = this.extractImage(content);

        return {
            title: cleanText(title),
            url: link.trim(),
            source: this.name,
            category: this.category,
            timestamp: this.normalizeDate(pubDate),
            abstract: cleaned.slice(0, 500) || null,
            content: cleaned || null,
            imageUrl,
        };
    }

    protected extractCdata(xml: string, tag: string): string | null {
        const re = new RegExp(
            `<${tag}>[\\s\\S]*?(?:<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>|([\\s\\S]*?))<\\/${tag}>`,
            'i',
        );
        const m = xml.match(re);
        return m?.[1] ?? m?.[2] ?? null;
    }

    protected extractTag(xml: string, tag: string): string | null {
        const re = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i');
        return xml.match(re)?.[1]?.trim() ?? null;
    }

    protected extractImage(content: string): string | null {
        return (
            content.match(/<media:content[^>]+url="([^"]+)"/i)?.[1] ??
            content.match(/<media:thumbnail[^>]+url="([^"]+)"/i)?.[1] ??
            content.match(/<enclosure[^>]+url="([^"]+)"/i)?.[1] ??
            content.match(/<img[^>]+src="([^"]+)"/i)?.[1] ??
            null
        );
    }

    protected normalizeDate(dateStr: string | null): string {
        if (!dateStr) return new Date().toISOString();
        try {
            return new Date(dateStr).toISOString();
        } catch {
            return new Date().toISOString();
        }
    }
}
