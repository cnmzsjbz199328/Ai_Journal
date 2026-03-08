/**
 * X (Twitter) Publishing Service
 * Handles automated posting of generated articles to a connected X account.
 */

import { TwitterApi } from 'twitter-api-v2';
import { db } from '@/lib/db';
import { socialPosts } from '@/lib/schema';

/**
 * Format and post a teaser to X/Twitter.
 * Falls back to "Dry Run" mode if API keys are missing.
 */
export async function postArticleTeaser(
    articleId: string,
    title: string,
    theme: string,
    articleUrl: string
): Promise<void> {
    const {
        TWITTER_API_KEY,
        TWITTER_API_SECRET,
        TWITTER_ACCESS_TOKEN,
        TWITTER_ACCESS_SECRET,
    } = process.env;

    const isConfigured = !!(TWITTER_API_KEY && TWITTER_API_SECRET && TWITTER_ACCESS_TOKEN && TWITTER_ACCESS_SECRET);

    // 1. Format the Tweet (280 char limit)
    const branding = "New Volume Published \uD83D\uDCDA\n\n";
    const urlSpace = 24; // Twitter t.co shortening length

    // Rough budget: 280 - branding(23) - title(?) - url(24) - spacing(10)
    const budgetForTheme = 280 - branding.length - title.length - urlSpace - 10;

    let excerpt = theme;
    if (excerpt.length > budgetForTheme && budgetForTheme > 20) {
        excerpt = excerpt.substring(0, budgetForTheme - 3).trim() + "...";
    }

    const tweetText = `${branding}《${title}》\n\n${excerpt}\n\nRead the full paper: ${articleUrl}`;

    if (!isConfigured) {
        console.log('\n[Twitter Dry Run] API keys missing. Would have posted:');
        console.log('--------------------------------------------------');
        console.log(tweetText);
        console.log('--------------------------------------------------\n');

        await db.insert(socialPosts).values({
            articleId,
            platform: 'twitter',
            postContent: tweetText,
            status: 'mocked',
            errorMessage: 'Missing API Keys',
        });
        return;
    }

    try {
        const client = new TwitterApi({
            appKey: TWITTER_API_KEY as string,
            appSecret: TWITTER_API_SECRET as string,
            accessToken: TWITTER_ACCESS_TOKEN as string,
            accessSecret: TWITTER_ACCESS_SECRET as string,
        });

        // Use v2 API for posting tweets
        const rwClient = client.readWrite;
        const response = await rwClient.v2.tweet(tweetText);

        // https://twitter.com/user/status/ID
        const postUrl = `https://x.com/i/status/${response.data.id}`;

        await db.insert(socialPosts).values({
            articleId,
            platform: 'twitter',
            postContent: tweetText,
            postUrl,
            status: 'published',
            postedAt: new Date()
        });

        console.log(`[Twitter Success] Posted article ${articleId} to ${postUrl}`);
    } catch (error) {
        console.error('[Twitter Error] Failed to post tweet:', error);

        await db.insert(socialPosts).values({
            articleId,
            platform: 'twitter',
            postContent: tweetText,
            status: 'failed',
            errorMessage: String(error)
        });
    }
}
