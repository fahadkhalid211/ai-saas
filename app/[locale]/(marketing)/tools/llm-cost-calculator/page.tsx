import { localizeMeta } from '@/lib/i18n/metadata';
import type { Metadata } from 'next';
import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Closing';
import { JsonLd } from '@/components/marketing/JsonLd';
import { LlmCostCalculator } from '@/components/marketing/LlmCostCalculator';
import { withSocial } from '@/lib/seo';
import { breadcrumbSchema, faqSchema, webPageSchema } from '@/lib/schema';

const PATH = '/tools/llm-cost-calculator';
const title = 'LLM Cost Calculator: What an AI Chatbot Costs per Conversation';
const description = 'Free calculator for AI chatbot API costs. Enter your chat volume and message length to compare the cost per conversation and per month across OpenAI, Claude, Gemini and Groq models.';

export async function generateMetadata(): Promise<Metadata> {
  return localizeMeta(withSocial({ title, description, alternates: { canonical: PATH } }, PATH));
}

const FAQ = [
  { q: 'How is the cost of a chatbot conversation calculated?', a: 'Providers charge per token, with one price for the text you send (input) and a higher one for the text the model writes (output). The calculator adds up every token sent and written across the whole conversation and multiplies each side by the model\'s list price.' },
  { q: 'Why does the history get sent again?', a: 'The model keeps nothing between messages. To answer the fifth question in context, the app sends the first four questions and answers along with it. That is why input tokens, not replies, make up most of a chatbot bill.' },
  { q: 'How many tokens is a word?', a: 'In English one token is about three quarters of a word, so 100 words are roughly 133 tokens. Other languages, numbers and code use more tokens per word, so add a margin if your customers do not write in English.' },
  { q: 'What is the knowledge-base text?', a: 'An assistant that answers from your own documents looks up the passages that match each question and sends them to the model with it. Those passages are usually the largest part of every request.' },
  { q: 'Are these prices exact?', a: 'They are the providers\' public list prices on the date shown under the table, and they change. Discounts for cached or batch requests are not counted, so treat the result as an upper estimate and check the provider\'s pricing page before you budget.' },
  { q: 'Can I run a chatbot with no API bill?', a: 'Yes, with a model you host yourself, for example through Ollama. There is no charge per token, but you pay for the computer it runs on, and small local models answer less reliably than the hosted ones.' },
  { q: 'Does Crescelo add a markup on AI usage?', a: 'No. You connect your own key from OpenAI, Anthropic, Google, Groq or DeepSeek, or a self-hosted model, and the provider bills you directly. The Crescelo plan price is separate.' },
];

export default function LlmCostCalculatorPage() {
  return (
    <>
      <JsonLd data={[webPageSchema(title, description, PATH), breadcrumbSchema([{ name: 'LLM cost calculator', path: PATH }]), faqSchema(FAQ)]} />
      <Header />
      <main id="main">
        <LlmCostCalculator faq={FAQ} />
      </main>
      <Footer />
    </>
  );
}
