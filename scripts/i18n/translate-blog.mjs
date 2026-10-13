/**
 * Translates blog articles with an AI provider, one language at a time, and saves only translations that pass the checks
 * (same blocks, list and table sizes, same links). Resumable: articles that already have a file are skipped.
 *
 *   node scripts/i18n/translate-blog.mjs [--lang=sv,fi,it,es] [--limit=20] [--slug=some-post]
 *
 * The provider is chosen from the keys in .env: GEMINI_API_KEY (free tier is enough), OPENAI_API_KEY, ANTHROPIC_API_KEY,
 * GROQ_API_KEY. Override with PROVIDER=gemini|openai|anthropic|groq and MODEL=... .
 * Afterwards run: node scripts/i18n/blog-merge.mjs
 */
import fs from 'node:fs';
import { parse, check } from './blog-format.mjs';

const env = Object.fromEntries(
  fs.readFileSync('.env', 'utf8').split(/\r?\n/).map((l) => l.match(/^([A-Z0-9_]+)=(.*)$/)).filter(Boolean).map((m) => [m[1], m[2].replace(/^["']|["']$/g, '')])
);
const arg = (n) => process.argv.find((a) => a.startsWith(`--${n}=`))?.split('=')[1];
const LANGS = (arg('lang') || 'sv,fi,it,es').split(',');
const LIMIT = Number(arg('limit') || 1000);
const ONLY = arg('slug');

const KEYS = { gemini: env.GEMINI_API_KEY, openai: env.OPENAI_API_KEY, anthropic: env.ANTHROPIC_API_KEY, groq: env.GROQ_API_KEY };
const provider = process.env.PROVIDER || ['gemini', 'openai', 'anthropic', 'groq'].find((p) => KEYS[p]);
if (!provider || !KEYS[provider]) { console.error('No API key found in .env (GEMINI_API_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY or GROQ_API_KEY).'); process.exit(1); }
const MODEL = process.env.MODEL || { gemini: 'gemini-2.0-flash', openai: 'gpt-4o-mini', anthropic: 'claude-3-5-haiku-latest', groq: 'openai/gpt-oss-120b' }[provider];
console.log(`provider ${provider}, model ${MODEL}, languages ${LANGS.join(',')}`);

const NAMES = { sv: 'Swedish', fi: 'Finnish', it: 'Italian', es: 'Spanish' };
const STYLE = {
  sv: 'Use informal "du". Note: Crescelo\'s possessive is "Crescelos".',
  fi: 'Use natural written Finnish, imperative or "voit" forms, not formal "te".',
  it: 'Use informal "tu".',
  es: 'Use informal "tú"; neutral Spanish that works in Spain and Latin America.',
};
const SYSTEM = (lang) => `You are a professional translator for a SaaS company's blog. Translate the article into ${NAMES[lang]}. ${STYLE[lang]}
The article is in a line format. Rules:
- Keep every line prefix exactly (TITLE:, SEO:, DESC:, EXCERPT:, CLUSTER:, MOD:, P:, H2[id]:, H3:, NOTE:, UL:, OL:, TABLE:, H:, R:, FAQ:, Q:, A:, "- " items). Keep the same number of lines and items. Keep the id inside H2[...] unchanged. Do not translate MOD.
- Table cells stay separated by " | ".
- Keep markdown: **bold**, \`code\`, and links [text](url): translate the text, never change the url.
- Do not translate brand and product names (Crescelo, WordPress, Google Calendar, Calendly, OpenAI, Groq...). Keep numbers, prices ($49) and units.
- SEO: a title of at most 60 characters. DESC: 140-160 characters.
- Output only the translated article, no commentary, no code fences.`;

async function call(lang, text) {
  const sys = SYSTEM(lang);
  let url, headers = { 'content-type': 'application/json' }, body;
  if (provider === 'gemini') {
    url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEYS.gemini}`;
    body = { systemInstruction: { parts: [{ text: sys }] }, contents: [{ role: 'user', parts: [{ text }] }], generationConfig: { temperature: 0.2, maxOutputTokens: 16000 } };
  } else if (provider === 'anthropic') {
    url = 'https://api.anthropic.com/v1/messages';
    headers['x-api-key'] = KEYS.anthropic; headers['anthropic-version'] = '2023-06-01';
    body = { model: MODEL, max_tokens: 16000, temperature: 0.2, system: sys, messages: [{ role: 'user', content: text }] };
  } else {
    url = provider === 'groq' ? 'https://api.groq.com/openai/v1/chat/completions' : 'https://api.openai.com/v1/chat/completions';
    headers.authorization = `Bearer ${KEYS[provider]}`;
    body = { model: MODEL, temperature: 0.2, messages: [{ role: 'system', content: sys }, { role: 'user', content: text }] };
  }
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
    if (res.status === 429 || res.status >= 500) {
      const j = await res.text();
      if (/per day|daily|quota/i.test(j) && res.status === 429) { console.log('Daily limit reached; run again later.'); process.exit(0); }
      const wait = Number(res.headers.get('retry-after')) || 15 * (attempt + 1);
      console.log(`  waiting ${wait}s (${res.status})`);
      await new Promise((r) => setTimeout(r, wait * 1000));
      continue;
    }
    if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 200)}`);
    const j = await res.json();
    return provider === 'gemini' ? j.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') : provider === 'anthropic' ? j.content?.[0]?.text : j.choices?.[0]?.message?.content;
  }
  throw new Error('too many retries');
}

const dir = 'scripts/i18n/out/blog';
const all = fs.readdirSync(`${dir}/src`).map((f) => f.replace('.txt', ''));
const counts = {};
for (const f of all) for (const m of fs.readFileSync(`${dir}/src/${f}.txt`, 'utf8').matchAll(/\]\(\/blog\/([a-z0-9-]+)\)/g)) counts[m[1]] = (counts[m[1]] || 0) + 1;
const have = (s) => (fs.existsSync(`${dir}/tr/${s}.txt`) ? fs.readFileSync(`${dir}/tr/${s}.txt`, 'utf8') : '');
const todo = (ONLY ? [ONLY] : all.sort((a, b) => (counts[b] || 0) - (counts[a] || 0))).filter((s) => LANGS.some((l) => !have(s).includes(`=== ${l}\n`)));
let done = 0;
for (const slug of todo.slice(0, LIMIT)) {
  const srcText = fs.readFileSync(`${dir}/src/${slug}.txt`, 'utf8');
  const src = parse(srcText);
  for (const lang of LANGS) {
    if (have(slug).includes(`=== ${lang}\n`)) continue;
    let out = null, feedback = '';
    for (let t = 0; t < 3 && !out; t++) {
      try {
        const raw = (await call(lang, feedback ? `${srcText}\n\n(Your previous attempt failed this check: ${feedback}. Fix it and output the full article again.)` : srcText)).replace(/^```\w*\n?|```\s*$/g, '').trim() + '\n';
        const errs = check(src, parse(raw));
        if (errs.length) { feedback = errs.slice(0, 2).join('; '); console.log(`  ${slug} [${lang}] retry: ${feedback}`); } else out = raw;
      } catch (e) { feedback = String(e.message).slice(0, 100); console.log(`  ${slug} [${lang}] ${feedback}`); }
    }
    if (!out) { console.log(`${slug} [${lang}] skipped`); continue; }
    fs.appendFileSync(`${dir}/tr/${slug}.txt`, `=== ${lang}\n${out}`);
    console.log(`${slug} [${lang}] ok`);
  }
  if (++done % 5 === 0) console.log(`${done} articles processed`);
}
console.log('Done. Now run: node scripts/i18n/blog-merge.mjs');
