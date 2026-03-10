async function testCatSource() {
    console.log("--- Testing Cat API as Data Source ---");
    const THE_CAT_API_BASE = 'https://api.thecatapi.com/v1';

    try {
        // Fetch breeds to see if we can get "content" (descriptions, traits)
        const response = await fetch(`${THE_CAT_API_BASE}/breeds?limit=5`, {
            headers: { 'x-api-key': 'demo_key' }
        });

        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

        const breeds = await response.json();
        console.log(`Successfully fetched ${breeds.length} breeds.`);

        breeds.forEach((breed, index) => {
            console.log(`\n[Source ${index + 1}]`);
            console.log(`Title: ${breed.name}`);
            console.log(`Abstract: ${breed.temperament}`);
            console.log(`Content Preview: ${breed.description?.slice(0, 150)}...`);
            console.log(`Reference URL: ${breed.wikipedia_url || 'N/A'}`);
            console.log(`Image URL: ${breed.image?.url || 'N/A'}`);

            // Qualify for AI Journal
            const hasContent = !!(breed.name && breed.description);
            console.log(`Suitable for Project: ${hasContent ? 'YES' : 'NO'}`);
        });

    } catch (error) {
        console.error("Test failed:", error.message);
    }
}

testCatSource();
