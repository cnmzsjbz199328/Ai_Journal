import { db } from './src/lib/db';
import { sources } from './src/lib/schema';
import { eq } from 'drizzle-orm';

async function checkHN() {
    console.log("Checking DB for Hacker News sources...");
    const rows = await db.select({
        id: sources.id,
        title: sources.title,
        url: sources.url,
        content: sources.content,
        wordCount: sources.wordCount,
        hasFullContent: sources.hasFullContent
    }).from(sources).where(eq(sources.sourceName, 'Hacker News')).limit(3);

    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
}

checkHN().catch(console.error);
