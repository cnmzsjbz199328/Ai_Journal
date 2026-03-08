import { eq } from 'drizzle-orm';
import { db } from '../../src/lib/db';
import { articles } from '../../src/lib/schema';

async function main() {
    const res = await db.select().from(articles).orderBy(articles.createdAt).limit(1);
    if (res.length > 0) {
        console.log("=== ARTICLE ===");
        console.log("Title: " + res[0].title);
        console.log("Theme: " + res[0].theme);
        console.log("\nContent Preview:\n" + res[0].content.substring(0, 500) + "...\n===============");
    }
    process.exit(0);
}
main();
