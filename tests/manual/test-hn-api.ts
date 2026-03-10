import { SOURCE_CONFIGS, RSS_FETCH_CONFIG } from './src/config/constants';

async function testHN() {
    const BASE_URL = 'https://hacker-news.firebaseio.com/v0';
    console.log(`[HN Test] Fetching top stories from ${BASE_URL}...`);

    try {
        const res = await fetch(`${BASE_URL}/topstories.json`, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Node.js)' },
        });
        const ids = await res.json();
        const top3 = ids.slice(0, 3);
        console.log(`[HN Test] Top 3 IDs: ${top3.join(', ')}`);

        for (const id of top3) {
            console.log(`\n--- Story ID: ${id} ---`);
            const storyRes = await fetch(`${BASE_URL}/item/${id}.json`);
            const story = await storyRes.json();
            console.log(JSON.stringify(story, null, 2));
        }
    } catch (err) {
        console.error('[HN Test] Failed:', err);
    }
}

testHN();
