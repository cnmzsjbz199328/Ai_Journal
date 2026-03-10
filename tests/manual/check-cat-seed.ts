import { db } from '../../src/lib/db';
import { sources } from '../../src/lib/schema';
import { eq } from 'drizzle-orm';

async function verify() {
    console.log("--- Verifying Cat Data in DB ---");
    const rows = await db.select().from(sources).where(eq(sources.sourceName, 'The Cat API'));
    console.log(`Total Cat Breeds in DB: ${rows.length}`);
    if (rows.length > 0) {
        console.log("Latest Entry Sample:");
        console.log(`- Title: ${rows[0].title}`);
        console.log(`- Status: ${rows[0].status}`);
        console.log(`- Weight: ${rows[0].usageWeight}`);
        console.log(`- Has Content: ${rows[0].hasFullContent}`);
    }
}
verify();
