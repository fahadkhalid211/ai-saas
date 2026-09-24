/**
 * Crescelo Platform Concierge Knowledge Engine
 * Provides authoritative, structured platform knowledge for the floating concierge widget
 * and ensures instant, reliable answers about Crescelo capabilities, setup, pricing, and integrations.
 */

export function getPlatformConciergeAnswer(query: string): string {
  const q = (query || '').toLowerCase().trim();

  // 1. Zero Token Markup & Pricing Architecture
  if (
    q.includes('markup') ||
    q.includes('zero token') ||
    q.includes('token cost') ||
    q.includes('wholesale') ||
    q.includes('byok')
  ) {
    return `### **Zero Token Markup at Crescelo**

Crescelo operates on a **100% sovereign BYOK (Bring Your Own Key)** architecture:

1. **0% Token Markup**: Traditional AI platforms charge 300%–800% markups on top of LLM token costs. Crescelo charges **\$0 markup** on all AI tokens.
2. **Direct Wholesale Billing**: You connect your own API keys (Google Gemini, OpenAI, Groq, Anthropic Claude, DeepSeek) or run free local models with Ollama.
3. **Predictable Flat SaaS Subscription**: You only pay for Crescelo's software platform (from \$19/mo), with no surprise per-token charges or hidden margins.
4. **Complete Data Sovereignty**: Your prompts and business data stream directly between your visitors and your chosen AI provider without vendor lock-in.`;
  }

  // 2. Connecting Providers / API Keys (Gemini, OpenAI, Groq, Claude, DeepSeek, Ollama)
  if (
    q.includes('connect') ||
    q.includes('gemini') ||
    q.includes('openai') ||
    q.includes('api key') ||
    q.includes('groq') ||
    q.includes('claude') ||
    q.includes('deepseek') ||
    q.includes('ollama') ||
    q.includes('provider') ||
    q.includes('model')
  ) {
    return `### **How to Connect AI Providers in Crescelo**

You can connect your preferred AI model in under 60 seconds:

1. **Open the Dashboard**: Log in and select your assistant from the left sidebar.
2. **Navigate to AI Engine**: Click on the **"AI Engine (BYOK)"** tab in the assistant configuration.
3. **Choose Your Engine**:
   - **Google Gemini**: Get a free API key at [aistudio.google.com](https://aistudio.google.com/app/apikey) (models: \`gemini-3.6-flash\`, \`gemini-2.0-flash\`).
   - **Groq Cloud**: Get a free key at [console.groq.com](https://console.groq.com/keys) for sub-second responses (~500+ tokens/sec).
   - **OpenAI**: Connect \`gpt-4o\` or \`gpt-4o-mini\` with your API key from [platform.openai.com](https://platform.openai.com).
   - **Anthropic Claude**: Connect \`claude-3-5-sonnet\` or \`claude-3-5-haiku\`.
   - **DeepSeek**: Connect \`deepseek-chat\` or \`deepseek-reasoner\`.
   - **Ollama**: Run completely free, 100% offline models locally (\`llama3.2\`, \`mistral\`) at \`http://localhost:11434\`.
4. **Save Changes**: Paste your key and click **Save Changes**. Your API keys are immediately encrypted at rest using AES-256-GCM.`;
  }

  // 3. Knowledge Base & RAG Training
  if (
    q.includes('knowledge base') ||
    q.includes('rag') ||
    q.includes('upload') ||
    q.includes('document') ||
    q.includes('pdf') ||
    q.includes('youtube') ||
    q.includes('crawl') ||
    q.includes('source')
  ) {
    return `### **Training Your Assistant with Knowledge Base (RAG)**

Crescelo features a hybrid semantic Retrieval-Augmented Generation (RAG) system:

1. **Upload Documents**: Head to **Dashboard > Knowledge Base** to upload PDFs, CSV spreadsheets, TXT files, or Markdown documentation.
2. **Ingest Web URLs**: Paste any public website URL to crawl and index product catalogs, FAQs, or help centers.
3. **YouTube Video Ingestion**: Paste a YouTube video URL—Crescelo automatically extracts transcripts, segments timestamps, and indexes video content into searchable knowledge chunks.
4. **Hybrid Semantic Search**: Uses high-performance vector embeddings (\`bge-small-en-v1.5\`) combined with BM25 keyword matching and cross-language synonym expansion.
5. **Strict Anti-Hallucination**: Assistants cite verified knowledge from your uploaded files and decline questions outside your business scope.`;
  }

  // 4. Embedding the Chat Widget on Websites
  if (
    q.includes('embed') ||
    q.includes('widget') ||
    q.includes('website') ||
    q.includes('install') ||
    q.includes('script') ||
    q.includes('shopify') ||
    q.includes('wordpress')
  ) {
    return `### **How to Embed the Chatbot Widget on Your Website**

You can add your Crescelo assistant to any website with a single line of JavaScript:

1. **Go to Widget Settings**: In your Dashboard, select your assistant and open the **"Embed & Widget"** tab.
2. **Customize Appearance**: Choose your brand color, position (bottom-right or bottom-left), avatar, welcome message, and quick starter questions.
3. **Copy the Embed Code**:
   \`\`\`html
   <script src="https://crescelo.com/widget.js" data-assistant-id="YOUR_ASSISTANT_ID" async></script>
   \`\`\`
4. **Paste Before \`</body>\`**: Paste this code into your HTML template, or in the Header/Footer script settings of **WordPress**, **Shopify**, **Webflow**, **Wix**, **Squarespace**, or **Framer**.
5. **Real-Time Updates**: Any changes you make to your knowledge base or prompt update immediately without having to edit your website code again!`;
  }

  // 5. Pricing & Subscription Plans
  if (
    q.includes('price') ||
    q.includes('pricing') ||
    q.includes('plan') ||
    q.includes('cost') ||
    q.includes('subscription') ||
    q.includes('tier')
  ) {
    return `### **Crescelo Pricing Plans**

All plans include **0% Token Markup** and **Bring Your Own Key (BYOK)**:

- **Starter (\$19 / month)**:
  - 1 Active AI Assistant
  - 1,000 conversations / month
  - 10 MB Knowledge Base storage
  - Web chat widget embed & lead capture
  - Community support

- **Pro (\$49 / month)**:
  - 5 Active AI Assistants
  - 10,000 conversations / month
  - 50 MB Knowledge Base storage
  - Web widget, Telegram & WhatsApp channels
  - Custom branding & advanced analytics
  - Priority email support

- **Enterprise (\$149 / month)**:
  - Unlimited AI Assistants & conversations
  - 250 MB Knowledge Base storage
  - Dedicated account manager & custom SLA
  - Full white-labeling & multi-seat team access

You can upgrade, downgrade, or cancel anytime from the **Billing** tab in your dashboard.`;
  }

  // 6. Security, Privacy & Compliance
  if (
    q.includes('privacy') ||
    q.includes('security') ||
    q.includes('terms') ||
    q.includes('safe') ||
    q.includes('encrypt') ||
    q.includes('gdpr')
  ) {
    return `### **Security & Data Privacy at Crescelo**

We protect your business data with enterprise-grade safeguards:

- **AES-256-GCM Encryption**: All external provider API keys (OpenAI, Gemini, Groq, etc.) are encrypted at rest with AES-256-GCM.
- **Tenant Isolation**: Strict workspace partitioning and row-level authorization prevent cross-tenant data leakage.
- **Distributed Rate Limiting**: All sensitive endpoints and chat streams are protected against DDoS and brute-force abuse.
- **Privacy Policy & Terms**: Read our complete [Privacy Policy](/privacy) and [Terms of Service](/terms) for full compliance disclosures.`;
  }

  // 7. Messaging Channels (Telegram, WhatsApp)
  if (q.includes('channel') || q.includes('telegram') || q.includes('whatsapp')) {
    return `### **Multi-Channel AI Deployments**

In addition to the website chat widget, Crescelo supports:

- **Telegram Bot**: Connect your Telegram Bot Token to automatically answer customer inquiries on Telegram 24/7.
- **WhatsApp Business**: Integrate with the WhatsApp Cloud API for automated customer conversations and appointment scheduling.

You can configure channels directly in **Dashboard > Channels**.`;
  }

  // 8. General / Greeting / Platform Overview
  return `### **Welcome to Crescelo AI**

I am the **Crescelo Platform Concierge**, here to help you get the most out of our AI platform.

**Popular Topics I Can Help With:**
- **Zero Token Markup**: Learn how you pay \$0 extra for AI compute.
- **Connecting Models**: Step-by-step guides for Google Gemini, OpenAI, Groq, Claude, DeepSeek, and Ollama.
- **Knowledge Base (RAG)**: How to train your bot with PDFs, websites, and YouTube videos.
- **Embedding the Widget**: How to install the chat widget on WordPress, Shopify, or Webflow.
- **Plans & Pricing**: Overview of Starter (\$19), Pro (\$49), and Enterprise (\$149).

Feel free to ask any specific question, or email our support team directly at **contact@crescelo.com**!`;
}
