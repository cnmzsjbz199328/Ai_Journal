async function testAiFeeds() {
    const targets = [
        { name: 'OpenAI', url: 'https://openai.com/news/rss.xml' },
        { name: 'Google AI', url: 'https://ai.googleblog.com/feeds/posts/default' },
        { name: 'DeepMind', url: 'https://deepmind.google/blog/rss.xml' }, // Probable URL
        { name: 'Meta AI', url: 'https://ai.meta.com/blog/rss/' } // Probable URL
    ];

    console.log("--- Testing AI Industry RSS Feeds ---");

    for (const t of targets) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);

            const res = await fetch(t.url, { signal: controller.signal });
            clearTimeout(timeout);

            const xml = await res.text();
            const first = xml.match(/<item>([\s\S]*?)<\/item>/i)?.[1] || xml.match(/<entry>([\s\S]*?)<\/entry>/i)?.[1];

            if (!first) {
                console.log(`[${t.name}] ❌ Feed fetched but no items/entries found.`);
                continue;
            }

            // Extract content preview
            const content = first.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<[^>]*>/g, '').trim();
            const hasLongContent = content.length > 300;

            console.log(`[${t.name}] Status: OK | Length: ${content.length} | Suitable: ${hasLongContent ? 'YES' : 'MAYBE'}`);
            if (hasLongContent) {
                console.log(`   Preview: ${content.slice(0, 100)}...`);
            }
        } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            console.log(`[${t.name}] ❌ Failed: ${msg}`);
        }
    }
}

testAiFeeds();
