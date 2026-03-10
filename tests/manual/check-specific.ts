async function check() {
    const targets = [
        { name: 'Phys.org', url: 'https://phys.org/rss-feed/' },
        { name: 'TechCrunch', url: 'https://techcrunch.com/feed/' }
    ];
    for (const t of targets) {
        const r = await fetch(t.url);
        const xml = await r.text();
        const first = xml.match(/<item>([\s\S]*?)<\/item>/)?.[1] || '';
        const raw = first.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<[^>]*>/g, '').trim();
        console.log(`[${t.name}] Length: ${raw.length} | Snapshot: ${raw.slice(0, 50)}...`);
    }
}
check();
