// Tells Bing, Yandex and other IndexNow engines which pages exist, so they are crawled (and reach ChatGPT search / Copilot) within
// hours instead of weeks. Run after a deploy:  INDEXNOW_KEY=<key> node scripts/indexnow.mjs [https://www.crescelo.com]
const key = process.env.INDEXNOW_KEY;
const origin = (process.argv[2] || 'https://www.crescelo.com').replace(/\/$/, '');
if (!key) { console.error('Set INDEXNOW_KEY (and the same value on the server) first.'); process.exit(1); }

const xml = await (await fetch(`${origin}/sitemap.xml`)).text();
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (!urls.length) { console.error('No URLs in sitemap.'); process.exit(1); }

for (let i = 0; i < urls.length; i += 10000) {
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: new URL(origin).host, key, keyLocation: `${origin}/${key}.txt`, urlList: urls.slice(i, i + 10000) }),
  });
  console.log(`Submitted ${Math.min(10000, urls.length - i)} URLs: HTTP ${res.status}`);
}
