import { db } from '../../src/lib/db';
import { articles } from '../../src/lib/schema';

async function main() {
    await db.update(articles).set({ status: 'published', publishedAt: new Date() });
    console.log("All articles set to published");
    process.exit(0);
}
main();
