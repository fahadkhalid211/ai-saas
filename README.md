# Crescelo — Universal Business Chatbot & RAG Engine

A production-ready, enterprise-grade AI chatbot platform that enables businesses of all sizes to train an intelligent assistant on their proprietary data (**PDF, CSV, JSON, DOCX, TXT, and Web descriptions**) and deploy it in seconds via an embeddable website widget or a 1-click WordPress plugin.

Built with **100% open-source by default ($0 mandatory platform API cost)** and a universal **Bring Your Own Key (BYOK)** adapter for OpenAI, Claude, Gemini, Groq, DeepSeek, or local Ollama.

---

## 🌟 Key Features

* **$0 Default API Cost:**
  * Embeddings generated locally on CPU using `@xenova/transformers` with `bge-small-en-v1.5` (384-dimensional dense vectors).
  * No OpenAI embedding subscription required.
* **Universal Multi-LLM & BYOK Engine:**
  * **Ollama (Local/Free):** Connects to `http://localhost:11434` with zero API key (Llama 3.2, Qwen 2.5, Mistral).
  * **Groq Cloud (Free Tier):** Ultra-fast inference with Llama 3.3 70B.
  * **Google Gemini:** Gemini 1.5 Flash & 2.0 Flash (generous free tier).
  * **Customer BYOK:** OpenAI (GPT-4o, GPT-4o-mini), Anthropic Claude (Claude 3.5 Sonnet & Haiku), DeepSeek.
  * **Custom OpenAI-Compatible:** Any vLLM, LM Studio, or private LLM server.
* **Specialized Multi-Format Ingestion:**
  * **CSV:** Row-aware semantic serialization (`[Record #N] Product: X | Price: $Y`) ensuring tabular queries preserve complete row context.
  * **JSON:** Recursive hierarchical flattener for structured catalogs and APIs.
  * **PDF & DOCX:** Header-preserving chunking with token-aware sliding windows.
  * **TXT / Descriptions:** Direct ingestion with section extraction.
* **Hybrid Retrieval (Dense Vector + Keyword Search):**
  * Vector Cosine Similarity (`<=>` in `pgvector`).
  * Sparse Full-Text Keyword Search (`tsvector` / BM25).
  * Reciprocal Rank Fusion (RRF) combining vector semantics with exact SKU/name matches.
  * Multi-turn query condensation for follow-up questions.
* **Embeddable Web Widget (`public/widget.js`):**
  * Standalone, zero-dependency script tag.
  * Isolated in **Shadow DOM** to prevent CSS bleeding.
  * Real-time Server-Sent Events (SSE) token streaming.
  * Source citations, starter questions, customizable colors, and mobile responsiveness.
* **WordPress Plugin Connector (`wordpress/ai-business-assistant`):**
  * 1-Click integration for WordPress websites.
  * Admin settings to connect to the assistant backend and auto-inject the widget into `wp_footer`.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(The system runs out of the box with zero external API keys using local embeddings and disk storage fallback).*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to access the sleek AI Assistant Studio.

### 4. Optional: Run PostgreSQL + pgvector with Docker
```bash
docker compose up -d
npx prisma db push
```

---

## 🔌 Embedding on Your Website

### Universal HTML Embed (Any Website)
Paste this before the closing `</body>` tag:
```html
<script src="http://localhost:3000/widget.js" data-assistant="YOUR_ASSISTANT_ID" defer></script>
```

### WordPress Integration
1. Copy the `wordpress/ai-business-assistant` folder into your WordPress site's `wp-content/plugins/` directory.
2. In WordPress Admin, go to **Plugins** and activate **AI Business Assistant & Knowledge Chatbot**.
3. Navigate to **AI Assistant** in the WordPress menu.
4. Enter your backend URL (e.g. `http://localhost:3000` or your production domain) and your **Assistant ID**.
5. Click **Save** — the chat widget is instantly live!

---

## 🧪 Testing the RAG Pipeline

Run the automated verification suite:
```bash
npx tsx scripts/test-engine.ts
```
Verifies CSV row serialization, JSON parsing, 384-dimensional local vector embedding generation, cosine similarity, and hybrid ranking.

---

## 📜 License
MIT License. Built for commercial SaaS and license distribution.
