import { db } from './src/lib/db';
import { sources } from './src/lib/schema';
import { desc } from 'drizzle-orm';

async function check() {
    console.log("Checking DB for decayed sources...");
    const rows = await db.select({
        id: sources.id,
        title: sources.title,
        usageCount: sources.usageCount,
        usageWeight: sources.usageWeight,
        status: sources.status,
    }).from(sources).orderBy(desc(sources.usageCount)).limit(10);

    console.log(rows);
    process.exit(0);
}

check().catch(console.error);
