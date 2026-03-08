/**
 * Article data types for the AI Journal system.
 */

export type ArticleStyle =
    | 'narrative'
    | 'philosophical'
    | 'humorous'
    | 'essay';

export type ArticleStatus = 'draft' | 'published' | 'archived';

/** Source image reference embedded in an article */
export interface SourceImageRef {
    sourceId: string;
    imageUrl: string;
}

/** Generated article — full database record */
export interface Article {
    id: string;
    title: string;
    content: string; // Markdown
    theme: string;
    outline: string[];
    sourceIds: string[];
    category: string | null;
    style: ArticleStyle;
    wordCount: number | null;
    aiModel: string | null;

    // Images
    coverImage: string | null;
    sourceImages: SourceImageRef[];

    // Stage 1 metadata
    gatekeeperRationale: string | null;

    // Status
    status: ArticleStatus;
    createdAt: string;
    publishedAt: string | null;
    updatedAt: string;
}

/** Social media post record */
export interface SocialPost {
    id: string;
    articleId: string;
    platform: string;
    postContent: string;
    postUrl: string | null;
    status: 'pending' | 'posted' | 'failed';
    errorMessage: string | null;
    postedAt: string | null;
    createdAt: string;
}

/** Guest comment */
export interface Comment {
    id: string;
    articleId: string;
    authorName: string;
    content: string;
    ipHash: string | null;
    isHidden: boolean;
    createdAt: string;
}

/** Pipeline run log */
export interface PipelineRun {
    id: string;
    startedAt: string;
    completedAt: string | null;
    status: 'running' | 'completed' | 'failed';
    sourcesCrawled: number;
    sourcesSelected: number;
    articleId: string | null;
    stage1TokensUsed: number;
    stage1_5TokensUsed: number;
    stage2TokensUsed: number;
    totalCostUsd: number | null;
    errorLog: string | null;
}
