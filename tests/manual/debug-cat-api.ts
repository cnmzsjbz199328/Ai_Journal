async function debugCatApi() {
    const API_URL = 'https://api.thecatapi.com/v1/breeds';
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (data && data.length > 0) {
            const first = data[0];
            console.log("--- RAW API RESPONSE (First Breed) ---");
            console.log(JSON.stringify(first, null, 2));

            console.log("\n--- IMAGE CHECK ---");
            console.log("image field:", first.image);
            console.log("reference_image_id:", first.reference_image_id);

            if (first.reference_image_id && !first.image) {
                console.log("\n--- FALLBACK CHECK ---");
                console.log(`Constructing URL: https://cdn2.thecatapi.com/images/${first.reference_image_id}.jpg`);
            }
        }
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        console.error("Debug failed:", errorMessage);
    }
}
debugCatApi();
