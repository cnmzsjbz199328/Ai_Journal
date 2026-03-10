const FEEDS = [
    { name: 'The Register', url: 'https://www.theregister.com/headlines.rss' },
    { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index' },
    { name: 'Phys.org', url: 'https://phys.org/rss-feed/' },
    { name: 'Quanta Magazine', url: 'https://www.quantamagazine.org/feed/' },
    { name: 'Science News', url: 'https://www.sciencenews.org/feed' },
    { name: 'TechCrunch', url: 'https://techcrunch.com/feed/' },
    { name: 'The Economist (S&T)', url: 'https://www.economist.com/science-and-technology/rss.xml' }
];

async function runAudit() {
    console.log("FINAL RSS AUDIT\n" + "=".repeat(40));

    for (const f of FEEDS) {
        try {
            const r = await fetch(f.url, {
                headers: { 'User-Agent': 'Mozilla/5.0' },
                signal: AbortSignal.timeout(10000)
            });
            const xml = await r.text();

            const match = xml.match(/<(?:item|entry)>([\s\S]*?)<\/(?:item|entry)>/);
            if (!match) {
                console.log(`[${f.name}] ❌ ERROR: NO ITEMS FOUND`);
                continue;
            }

            const content = match[1];
            const title = (content.match(/<title>([\s\S]*?)<\/title>/)?.[1] || 'Untitled')
                .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<[^>]*>/g, '').trim();

            const blocks = content.match(/<(?:description|content|summary|content:encoded)>([\s\S]*?)<\/(?:description|content|summary|content:encoded)>/g) || [];
            let fullText = blocks.join(' ').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
            fullText = fullText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

            const len = fullText.length;
            const rating = len > 800 ? '⭐⭐⭐ FULL' : len > 300 ? '⭐⭐ MID' : '⭐ SHORT';

            console.log(`[${f.name}] -> ${rating} (${len} chars)`);
            console.log(`   T: ${title.slice(0, 60)}...`);
            console.log(`   S: ${fullText.slice(0, 100)}...`);
            console.log("-".repeat(40));

        } catch (e) {
            console.log(`[${f.name}] ❌ FAILED: ${e.message}`);
        }
    }
}

runAudit();
