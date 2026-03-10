const FEEDS = [
    { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index' },
    { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml' },
    { name: 'Wired', url: 'https://www.wired.com/feed/rss' },
    { name: 'The Economist (Science)', url: 'https://www.economist.com/science-and-technology/rss.xml' },
    { name: 'The Economist (Business)', url: 'https://www.economist.com/business/rss.xml' },
    { name: 'TechCrunch', url: 'https://techcrunch.com/feed/' }
];

async function runTest() {
    console.log("RSS Feed Content Quality Audit\n" + "=".repeat(30));

    for (const f of FEEDS) {
        try {
            const r = await fetch(f.url, {
                headers: { 'User-Agent': 'Mozilla/5.0' },
                signal: AbortSignal.timeout(10000)
            });
            const xml = await r.text();

            // Regex to grab first item/entry
            const match = xml.match(/<(?:item|entry)>([\s\S]*?)<\/(?:item|entry)>/);
            if (!match) {
                console.log(`[${f.name}] ❌ No items found`);
                continue;
            }

            const content = match[1];
            const title = (content.match(/<title>([\s\S]*?)<\/title>/)?.[1] || 'No Title').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();

            // Collect all possible text blocks
            const blocks = content.match(/<(?:description|content|summary|content:encoded)>([\s\S]*?)<\/(?:description|content|summary|content:encoded)>/g) || [];
            let fullText = blocks.join(' ').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');

            // Clean HTML
            fullText = fullText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
            const length = fullText.length;

            console.log(`[${f.name}]`);
            console.log(`   Title: ${title.slice(0, 50)}...`);
            console.log(`   Text Snapshot: ${fullText.slice(0, 80)}...`);
            console.log(`   Total Length: ${length} chars`);
            console.log(`   Rating: ${length > 500 ? '✅ HIGH' : length > 150 ? '🔶 MEDIUM' : '❌ LOW'}`);
            console.log("-".repeat(30));

        } catch (e) {
            console.log(`[${f.name}] ❌ FAILED: ${e.message}`);
            console.log("-".repeat(30));
        }
    }
}

runTest();
