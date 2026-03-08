import { db } from '../../src/lib/db';
import { articles } from '../../src/lib/schema';

async function main() {
    const res = await db.select().from(articles);
    console.log("Total articles:", res.length);
    res.forEach(a => {
        console.log(`- ${a.id}: [${a.status}] ${a.title}`);
    });
    process.exit(0);
}
main();
