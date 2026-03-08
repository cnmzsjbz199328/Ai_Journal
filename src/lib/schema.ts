/**
 * Drizzle ORM schema definitions for all database tables.
 * Maps directly to the SQL schema in the dev doc §9.2.
 */

import {
    pgTable,
    uuid,
    text,
    varchar,
    integer,
    boolean,
    decimal,
    timestamp,
    jsonb,
    index,
} from 'drizzle-orm/pg-core';

// ---------- sources ----------

export const sources = pgTable(
    'sources',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        title: text('title').notNull(),
        abstract: text('abstract'),
        content: text('content'),
        sourceName: varchar('source_name', { length: 100 }).notNull(),
        url: text('url').notNull().unique(),
        category: varchar('category', { length: 50 }).notNull(),
        author: varchar('author', { length: 200 }),
        tags: text('tags').array(),
        language: varchar('language', { length: 10 }).default('en'),
        wordCount: integer('word_count'),
        hasFullContent: boolean('has_full_content').default(false),
        crawledAt: timestamp('crawled_at', { withTimezone: true }).defaultNow(),
        publishedAt: timestamp('published_at', { withTimezone: true }),

        // Image
        imageUrl: text('image_url'),

        // Curator AI
        curatedSummary: text('curated_summary'),

        // Reuse management
        usageCount: integer('usage_count').default(0),
        usageWeight: decimal('usage_weight', {
            precision: 5,
            scale: 4,
        }).default('1.0'),
        lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
        cooldownUntil: timestamp('cooldown_until', { withTimezone: true }),
        usageRoles: jsonb('usage_roles').$type<string[]>().default([]),
        status: varchar('status', { length: 20 }).default('fresh'),

        // Dedup
        titleHash: varchar('title_hash', { length: 64 }),
        duplicateOf: uuid('duplicate_of'),
    },
    (table) => [
        index('idx_sources_category').on(table.category),
        index('idx_sources_crawled_at').on(table.crawledAt),
        index('idx_sources_source_name').on(table.sourceName),
        index('idx_sources_status').on(table.status),
        index('idx_sources_usage_weight').on(table.usageWeight),
        index('idx_sources_title_hash').on(table.titleHash),
    ],
);

// ---------- articles ----------

export const articles = pgTable(
    'articles',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        title: text('title').notNull(),
        content: text('content').notNull(),
        theme: text('theme').notNull(),
        outline: jsonb('outline').$type<string[]>().notNull(),
        sourceIds: text('source_ids').array().notNull(),
        category: varchar('category', { length: 50 }),
        style: varchar('style', { length: 50 }).default('narrative'),
        wordCount: integer('word_count'),
        aiModel: varchar('ai_model', { length: 100 }),

        // Images
        coverImage: text('cover_image'),
        sourceImages: jsonb('source_images')
            .$type<Array<{ sourceId: string; imageUrl: string }>>()
            .default([]),

        // Stage 1 metadata
        gatekeeperRationale: text('gatekeeper_rationale'),

        // Status
        status: varchar('status', { length: 20 }).default('draft'),
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
        publishedAt: timestamp('published_at', { withTimezone: true }),
        updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    },
    (table) => [
        index('idx_articles_status').on(table.status),
        index('idx_articles_category').on(table.category),
        index('idx_articles_created_at').on(table.createdAt),
    ],
);

// ---------- social_posts ----------

export const socialPosts = pgTable(
    'social_posts',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        articleId: uuid('article_id')
            .notNull()
            .references(() => articles.id, { onDelete: 'cascade' }),
        platform: varchar('platform', { length: 20 }).notNull(),
        postContent: text('post_content').notNull(),
        postUrl: text('post_url'),
        status: varchar('status', { length: 20 }).default('pending'),
        errorMessage: text('error_message'),
        postedAt: timestamp('posted_at', { withTimezone: true }),
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    },
    (table) => [
        index('idx_social_posts_article_id').on(table.articleId),
        index('idx_social_posts_status').on(table.status),
    ],
);

// ---------- comments ----------

export const comments = pgTable(
    'comments',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        articleId: uuid('article_id')
            .notNull()
            .references(() => articles.id, { onDelete: 'cascade' }),
        authorName: varchar('author_name', { length: 100 }).default('Guest'),
        content: text('content').notNull(),
        ipHash: varchar('ip_hash', { length: 64 }),
        isHidden: boolean('is_hidden').default(false),
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    },
    (table) => [
        index('idx_comments_article_id').on(table.articleId),
        index('idx_comments_created_at').on(table.createdAt),
    ],
);

// ---------- pipeline_runs ----------

export const pipelineRuns = pgTable('pipeline_runs', {
    id: uuid('id').defaultRandom().primaryKey(),
    startedAt: timestamp('started_at', { withTimezone: true }).defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    status: varchar('status', { length: 20 }).default('running'),
    sourcesCrawled: integer('sources_crawled').default(0),
    sourcesSelected: integer('sources_selected').default(0),
    articleId: uuid('article_id').references(() => articles.id),
    stage1TokensUsed: integer('stage1_tokens_used').default(0),
    stage1_5TokensUsed: integer('stage1_5_tokens_used').default(0),
    stage2TokensUsed: integer('stage2_tokens_used').default(0),
    totalCostUsd: decimal('total_cost_usd', { precision: 10, scale: 6 }),
    errorLog: text('error_log'),
});

// ---------- source_providers ----------

export const sourceProviders = pgTable(
    'source_providers',
    {
        id: varchar('id', { length: 50 }).primaryKey(),
        name: varchar('name', { length: 100 }).notNull(),
        url: text('url').notNull(),
        category: varchar('category', { length: 50 }).notNull(),
        crawlFrequency: varchar('crawl_frequency', { length: 20 }).notNull(),
        lastCrawlAt: timestamp('last_crawl_at', { withTimezone: true }),
        lastSuccessAt: timestamp('last_success_at', { withTimezone: true }),
        consecutiveFailures: integer('consecutive_failures').default(0),
        totalItemsCrawled: integer('total_items_crawled').default(0),
        status: varchar('status', { length: 20 }).default('active'),
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    },
    (table) => [
        index('idx_source_providers_status').on(table.status),
    ],
);
