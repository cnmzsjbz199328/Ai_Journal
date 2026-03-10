/**
 * Cat Data Seeder — One-time injection of full cat breed library into the database.
 * This script bypasses the crawler registry and injects directly into source-store.
 */
import { insertSources } from '../../src/services/storage/source-store';
import { RawFeedItem } from '../../src/services/crawler/types';

async function seedCats() {
    console.log("🚀 Initializing Cat Data Seeding Pipeline...");
    const API_URL = 'https://api.thecatapi.com/v1/breeds';

    try {
        console.log("📡 Fetching breeds from The Cat API...");
        const response = await fetch(API_URL, {
            headers: { 'x-api-key': 'demo_key' }
        });

        if (!response.ok) throw new Error(`Fetch failed with HTTP ${response.status}`);
        const breeds = await response.json();

        console.log(`📊 Received ${breeds.length} breeds. Mapping to RawFeedItem...`);

        const sourceItems: RawFeedItem[] = breeds.map((breed: any) => {
            // Construct Image URL: Priority: breed.image.url > reference_image_id > null
            let imageUrl = breed.image?.url || null;
            if (!imageUrl && breed.reference_image_id) {
                imageUrl = `https://cdn2.thecatapi.com/images/${breed.reference_image_id}.jpg`;
            }

            return {
                title: `Taxonomic Profile: ${breed.name}`,
                url: breed.wikipedia_url || `https://thecatapi.com/breeds/${breed.id}`,
                source: "The Cat API",
                category: "Science",
                timestamp: new Date().toISOString(),
                abstract: `Evolutionary Traits: ${breed.temperament}`,
                content: breed.description || null,
                imageUrl: imageUrl
            };
        });

        console.log("💾 Injecting into database (skipping duplicates)...");
        const count = await insertSources(sourceItems);

        console.log(`✅ Success! ${count} records processed and synced.`);
        console.log("Note: If the count is 0, all items already existed in the DB.");

    } catch (error: any) {
        console.error("❌ Seeding failed:", error.message);
        process.exit(1);
    }
}

seedCats();
