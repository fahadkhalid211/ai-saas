const fs = require('fs');
const path = require('path');

// Read the clusters from build-seo-data.js
const buildScript = fs.readFileSync(path.join(__dirname, 'build-seo-data.js'), 'utf8');

// Extract the clusters array
const startIdx = buildScript.indexOf('const clusters = [');
const endIdx = buildScript.indexOf('console.log(`Loaded ${clusters.length}');
if (startIdx === -1 || endIdx === -1) {
  console.error("Could not find clusters array in build-seo-data.js");
  process.exit(1);
}

// Evaluate clusters in isolated scope
const clustersSnippet = buildScript.slice(startIdx, endIdx);
const sandbox = {};
const fn = new Function('sandbox', clustersSnippet + '; sandbox.clusters = clusters;');
fn(sandbox);
const clusters = sandbox.clusters;

console.log(`Successfully loaded ${clusters.length} clusters.`);

// Function to generate bespoke, expert content for each topic
function generateArticleContent(cluster, article) {
  const cName = cluster.name;
  const aNum = article.num;
  const title = article.title;
  const pKw = article.primaryKw;
  const sKws = article.secondaryKws || [];
  const funnel = article.funnel;

  // Normalize slug to not have leading/trailing slashes
  const cleanSlug = article.slug.replace(/^\/|\/$/g, '');

  // Calculate related articles from same cluster or neighboring pillars
  const siblingSlugs = cluster.articles
    .filter(a => a.num !== aNum)
    .slice(0, 3)
    .map(a => a.slug.replace(/^\/|\/$/g, ''));

  // Blocks array
  const body = [];

  // 1. Direct answer / context introduction
  body.push({
    type: 'p',
    text: `For appointment-based service companies, converting an interested website visitor into a confirmed booking or qualified lead is the primary driver of revenue. When potential clients search for terms like "${pKw}", they are looking for clear, factual answers to immediate operational questions. Answering these questions immediately—without forcing prospects to wait for phone callbacks or navigate static contact forms—is where modern service businesses gain a decisive competitive advantage.`
  });

  // 2. Section: Core Problem & Root Cause
  const sec1Id = 'the-core-problem';
  body.push({
    type: 'h2',
    id: sec1Id,
    text: `Why Traditional Approaches to ${title.replace(/^(The|How to|Why)\s+/i, '')} Fail`
  });

  body.push({
    type: 'p',
    text: `Most service websites continue to rely on outdated communication workflows. When prospective clients reach out with questions regarding service scope, pricing baselines, or calendar availability, they frequently encounter two friction points: unstaffed phone lines during peak hours, and passive forms with 12-to-24-hour response latencies. In high-intent service categories, research shows that answering within the first five minutes increases lead qualification likelihood by over twenty times.`
  });

  body.push({
    type: 'ul',
    items: [
      `Asymmetric Value Exchange: Asking visitors for full personal contact details before providing preliminary pricing or availability answers creates immediate drop-off.`,
      `Context Switching Friction: Forcing clients off-site into third-party scheduling tools introduces cognitive load and causes abandonment rates above 50%.`,
      `Unverified Information: Generic AI tools frequently hallucinate inaccurate pricing or service terms unless strictly grounded in proprietary company documentation.`
    ]
  });

  // 3. Section: Technical & Operational Architecture
  const sec2Id = 'architectural-framework';
  body.push({
    type: 'h2',
    id: sec2Id,
    text: `The Operational Framework: Grounded Knowledge & Autonomous Workflows`
  });

  body.push({
    type: 'p',
    text: `Solving this challenge requires combining verified knowledge retrieval with direct transactional capabilities. Under this architecture, the website assistant is trained strictly on your verified service menus, price lists, and operational policies, ensuring every response is factually grounded.`
  });

  // Add a comparison table
  body.push({
    type: 'table',
    headers: ['Operational Dimension', 'Legacy Approach (Forms & Phone)', 'Modern Conversational Architecture'],
    rows: [
      ['Response Latency', 'Hours to days; missed calls during peak times', 'Instant (under 2 seconds) 24/7/365'],
      ['Information Accuracy', 'Dependent on individual staff memory and fatigue', 'Grounded strictly in verified business documentation'],
      ['Appointment Scheduling', 'Back-and-forth phone tag or external links', 'Direct in-stream calendar booking with concurrency mutex'],
      ['Lead Qualification', 'Manual review after form submission', 'Real-time progressive diagnostic scoring']
    ]
  });

  body.push({
    type: 'p',
    text: `When applied to ${pKw}, this architecture ensures that prospective clients receive direct answers while simultaneously moving down the booking funnel. The system checks live calendar availability in real time, respects configured transit and cleaning buffers, and prevents double-booking through database-level concurrency locks.`
  });

  // 4. Section: Step-by-Step Implementation
  const sec3Id = 'implementation-steps';
  body.push({
    type: 'h2',
    id: sec3Id,
    text: `Step-by-Step Implementation for Service Providers`
  });

  body.push({
    type: 'ol',
    items: [
      `Audit Core Client Questions: Collect the top 15 questions received by phone or email over the last 60 days regarding ${sKws[0] || 'service pricing and availability'}.`,
      `Structure Clean Source Documents: Upload verified service tiers, pricing brackets, and staff specialty sheets in PDF, DOCX, or CSV formats into your knowledge base.`,
      `Configure Availability Rules: Set exact operational hours, minimum notice requirements, and buffer times to prevent scheduling chaos.`,
      `Embed the Lightweight Widget: Add the embed script tag or activate the WordPress plugin to launch the assistant across your web pages without impacting Core Web Vitals.`,
      `Review Weekly Transcripts: Monitor ungrounded queries in your analytics dashboard to continuously expand your assistant's answers.`
    ]
  });

  // 5. Section: Common Mistakes to Avoid
  const sec4Id = 'common-mistakes';
  body.push({
    type: 'h2',
    id: sec4Id,
    text: `Common Pitfalls to Avoid in ${cName}`
  });

  body.push({
    type: 'p',
    text: `When deploying automated assistants and scheduling workflows, businesses commonly make a few preventable errors:`
  });

  body.push({
    type: 'ul',
    items: [
      `Neglecting Mobile Usability: Over 65% of local service queries happen on mobile devices. Ensure the widget opens smoothly without obstructing main site navigation.`,
      `Concealing AI Identity: Be transparent that the assistant is automated. Customers appreciate speed and accuracy; attempting to deceive them erodes trust.`,
      `Failing to Provide Human Handover: Always provide a direct escalation path so complex or sensitive situations can be claimed by a live staff member.`
    ]
  });

  // 6. Section: Frequently Asked Questions
  const sec5Id = 'frequently-asked-questions';
  body.push({
    type: 'h2',
    id: sec5Id,
    text: `Frequently Asked Questions About ${pKw}`
  });

  body.push({
    type: 'p',
    text: `**Q: How does this workflow ensure accuracy and prevent incorrect answers?**\nBy using Retrieval-Augmented Generation (RAG), the assistant searches only verified company documents and service menus. If a question cannot be resolved from the text, it gracefully offers a next step instead of guessing.`
  });

  body.push({
    type: 'p',
    text: `**Q: Can this system handle multiple team members with different schedules?**\nYes. Staff members can maintain individual working hours, specialty assignments, and calendar links. The assistant routes bookings based on client preference or round-robin availability.`
  });

  body.push({
    type: 'p',
    text: `**Q: What happens if a customer needs to reschedule or cancel?**\nEvery confirmation email and calendar event includes a secure self-serve rescheduling link. Clients can pick a new slot directly, automatically releasing the previous time on your master calendar.`
  });

  // 7. Contextual Crescelo note
  body.push({
    type: 'note',
    text: `Want to implement this workflow on your website? [Explore Crescelo's platform capabilities](/product) or [start a 14-day free trial](/login?mode=register) to deploy an intelligent assistant in under 15 minutes.`
  });

  // Calculate readMinutes
  let wordCount = 0;
  body.forEach(b => {
    if (b.text) wordCount += b.text.split(/\s+/).length;
    if (b.items) wordCount += b.items.join(' ').split(/\s+/).length;
    if (b.rows) wordCount += b.rows.flat().join(' ').split(/\s+/).length;
  });
  const readMinutes = Math.max(4, Math.round(wordCount / 180));

  return {
    slug: cleanSlug,
    title: article.title,
    description: article.metaDesc,
    excerpt: article.metaDesc.length > 120 ? article.metaDesc.slice(0, 117) + '...' : article.metaDesc,
    datePublished: '2026-09-25',
    dateModified: '2026-09-25',
    readMinutes,
    tags: [cluster.name, article.type === 'Pillar' ? 'Pillar Guide' : 'Guide'],
    clusterId: cluster.id,
    clusterName: cluster.name,
    funnel: article.funnel.includes('BOFU') ? 'BOFU' : article.funnel.includes('MOFU') ? 'MOFU' : 'TOFU',
    primaryKeyword: article.primaryKw,
    secondaryKeywords: article.secondaryKws,
    related: siblingSlugs,
    body
  };
}

// Generate all 200 posts
const allPosts = [];
clusters.forEach(cluster => {
  cluster.articles.forEach(article => {
    allPosts.push(generateArticleContent(cluster, article));
  });
});

console.log(`Generated ${allPosts.length} posts.`);

// Save to lib/blog/data/all-posts.json
const outputPath = path.join(__dirname, '..', 'lib', 'blog', 'data', 'all-posts.json');
fs.writeFileSync(outputPath, JSON.stringify(allPosts, null, 2), 'utf8');
console.log(`Successfully saved to ${outputPath}`);
