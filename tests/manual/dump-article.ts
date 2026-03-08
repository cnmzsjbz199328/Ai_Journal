import { readFileSync, writeFileSync } from 'fs';
import { db } from '../../src/lib/db';
import { articles } from '../../src/lib/schema';
import { desc } from 'drizzle-orm';

async function main() {
    const res = await db.select().from(articles).orderBy(desc(articles.createdAt)).limit(1);
    if (res.length > 0) {
        const article = res[0];
        const mdContent = `# ${article.title}\n\n*Theme: ${article.theme}*\n*Word Count: ${article.wordCount}*\n\n---\n\n${article.content}`;
        writeFileSync('../../generated_article.md', mdContent);
    }
    process.exit(0);
}
main();
