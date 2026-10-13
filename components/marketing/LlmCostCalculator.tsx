'use client';

import { T, useT } from '@/lib/i18n/context';
import Link from '@/components/i18n/Link';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { ButtonLink, Reveal, SectionHead } from '@/components/marketing/ui';
import { SIGNUP_HREF } from '@/components/marketing/content';
import {
  DEFAULT_SCENARIO,
  PRICES_CHECKED,
  clampScenario,
  compareModels,
  conversationTokens,
  formatUsd,
  scenarioFromQuery,
  scenarioToQuery,
  type ChatScenario,
} from '@/lib/tools/llm-cost';
import './llm-calc.css';

type Field = keyof ChatScenario;

const FIELDS: { id: Field; label: string; hint: string }[] = [
  { id: 'conversations', label: 'Conversations a month', hint: 'How many chats your assistant handles in a month.' },
  { id: 'turns', label: 'Customer messages per conversation', hint: 'Each one gets a reply. Most support chats run 4 to 8.' },
  { id: 'userWords', label: 'Words in a customer message', hint: 'A typical question is 10 to 30 words.' },
  { id: 'replyWords', label: 'Words in a reply', hint: 'Short answers cost less: output is the expensive side.' },
  { id: 'knowledgeWords', label: 'Knowledge-base words sent with each message', hint: 'The passages from your documents the assistant reads before answering. Use 0 if it has none.' },
  { id: 'promptWords', label: 'Words of instructions', hint: 'The system prompt: tone, rules, services and opening hours.' },
];

/** Chat lengths shown in the "why long chats cost more" table. */
const LENGTHS = [1, 5, 10, 20];

const asText = (s: ChatScenario) => Object.fromEntries(FIELDS.map((f) => [f.id, String(s[f.id])])) as Record<Field, string>;
const count = (n: number) => Math.round(n).toLocaleString('en-US');

// The address is read once the page is in the browser; the server renders the defaults.
const subscribeNever = () => () => {};
const readSearch = () => window.location.search;
const noSearch = () => '';

export function LlmCostCalculator({ faq }: { faq: { q: string; a: string }[] }) {
  const __t = useT();
  // a shared link (?c=5000&m=10) opens with its numbers, until the visitor types their own
  const search = useSyncExternalStore(subscribeNever, readSearch, noSearch);
  const [edited, setEdited] = useState<Record<Field, string> | null>(null);
  const text = useMemo(() => edited ?? asText(scenarioFromQuery(search)), [edited, search]);
  const [copied, setCopied] = useState(false);

  // an empty box counts as the field's lowest value, so the result never disappears while typing
  const scenario = useMemo(() => clampScenario(Object.fromEntries(FIELDS.map((f) => [f.id, text[f.id].trim() === '' ? 0 : text[f.id]]))), [text]);
  const rows = useMemo(() => compareModels(scenario), [scenario]);
  const used = conversationTokens(scenario);
  const cheapest = rows[0];
  const dearest = rows[rows.length - 1];

  // keep the address in step, so copying it from the bar shares the scenario too
  useEffect(() => {
    if (!edited) return;
    const q = scenarioToQuery(scenario);
    window.history.replaceState(null, '', window.location.pathname + (q ? `?${q}` : '') + window.location.hash);
  }, [edited, scenario]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { /* clipboard blocked: the address bar still holds the link */ }
  }

  return (
    <>
      <section className="mk-hero" style={{ marginTop: '1rem' }}>
        <div className="mk-hero-glow" aria-hidden="true" />
        <div className="mk-wrap mk-hero-inner">
          <p className="mk-eyebrow"><T>FREE TOOL</T></p>
          <h1 className="mk-h1" style={{ maxWidth: '18ch', marginInline: 'auto' }}><T>What will your AI chatbot cost to run?</T></h1>
          <p className="mk-lead" style={{ maxWidth: '60ch' }}>
            <T>Describe how your customers chat and see the API bill per conversation and per month, model by model. It counts the chat history that is sent again with every message, which quick estimates leave out.</T>
          </p>
        </div>
      </section>

      <section className="mk-section" aria-label={__t('LLM cost calculator')} style={{ paddingTop: '2rem' }}>
        <div className="mk-wrap lc-grid">
          <form className="lc-panel" onSubmit={(e) => e.preventDefault()}>
            <h2 className="lc-title"><T>Your chatbot</T></h2>
            {FIELDS.map((f) => (
              <div key={f.id} className="lc-field">
                <label htmlFor={`lc-${f.id}`}><T>{f.label}</T></label>
                <input
                  id={`lc-${f.id}`}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={1}
                  value={text[f.id]}
                  onChange={(e) => setEdited({ ...text, [f.id]: e.target.value })}
                  onBlur={() => edited && setEdited(asText(scenario))}
                  aria-describedby={`lc-${f.id}-hint`}
                />
                <small id={`lc-${f.id}-hint`}><T>{f.hint}</T></small>
              </div>
            ))}
            <div className="lc-actions">
              <button type="button" className="mk-btn mk-btn-ghost mk-btn-sm" onClick={copyLink}><T>{copied ? 'Link copied' : 'Copy link to these numbers'}</T></button>
              <button type="button" className="lc-reset" onClick={() => setEdited(asText(DEFAULT_SCENARIO))}><T>Reset</T></button>
            </div>
            <span className="mk-sr" role="status">{copied ? __t('Link copied') : ''}</span>
          </form>

          <div className="lc-results">
            <div className="lc-stats" aria-live="polite">
              <div className="lc-stat">
                <span><T>Cheapest model here</T></span>
                <b>{formatUsd(cheapest.perMonth)}</b>
                <small>{__t('{model}, per month', { model: cheapest.label })}</small>
              </div>
              <div className="lc-stat">
                <span><T>Most expensive here</T></span>
                <b>{formatUsd(dearest.perMonth)}</b>
                <small>{__t('{model}, per month', { model: dearest.label })}</small>
              </div>
              <div className="lc-stat">
                <span><T>Tokens in one conversation</T></span>
                <b>{count(used.input + used.output)}</b>
                <small>{__t('{input} in, {output} out', { input: count(used.input), output: count(used.output) })}</small>
              </div>
            </div>

            <div className="mk-compare-table-wrap lc-table-wrap" role="region" aria-label={__t('Cost by model')} tabIndex={0}>
              <table className="mk-table">
                <caption className="mk-sr"><T>Cost by model</T></caption>
                <thead>
                  <tr>
                    <th scope="col"><T>Model</T></th>
                    <th scope="col" className="lc-num"><T>Per conversation</T></th>
                    <th scope="col" className="lc-num"><T>Per month</T></th>
                    <th scope="col" className="lc-num"><T>List price per 1M tokens</T></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.model}>
                      <th scope="row"><span className="lc-model"><T>{r.label}</T></span><span className="lc-provider"><T>{r.providerLabel}</T></span></th>
                      <td className="lc-num">{formatUsd(r.perConversation)}</td>
                      <td className="lc-num"><b>{formatUsd(r.perMonth)}</b></td>
                      <td className="lc-num lc-rate">{__t('${input} in, ${output} out', { input: r.price.input, output: r.price.output })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="lc-note">
              {__t('Estimates from public list prices in US dollars, last checked {date}. One token is counted as three quarters of an English word. Cached and batch requests are billed lower, so a real bill is usually below these figures.', { date: PRICES_CHECKED })}
            </p>
          </div>
        </div>
      </section>

      <section className="mk-section mk-section-tint" aria-labelledby="lc-why">
        <div className="mk-wrap" style={{ maxWidth: '56rem' }}>
          <SectionHead
            eyebrow="THE PART PEOPLE MISS"
            title="Why a long chat costs more per message."
            intro="A chat model has no memory. Each time a customer writes, the app sends the instructions, the knowledge-base text and the whole chat so far, and you pay for all of it again. A chat twice as long sends about four times as much history."
            id="lc-why"
            align="center"
          />
          <div className="mk-compare-table-wrap lc-table-wrap" role="region" aria-label={__t('Input tokens by chat length')} tabIndex={0} style={{ marginTop: '2rem' }}>
            <table className="mk-table">
              <caption className="mk-sr"><T>Input tokens by chat length</T></caption>
              <thead>
                <tr>
                  <th scope="col"><T>Customer messages</T></th>
                  <th scope="col" className="lc-num"><T>Input tokens billed</T></th>
                  <th scope="col" className="lc-num"><T>Average per message</T></th>
                </tr>
              </thead>
              <tbody>
                {LENGTHS.map((n) => {
                  const input = conversationTokens({ ...scenario, turns: n }).input;
                  return (
                    <tr key={n}>
                      <th scope="row"><T>{n}</T></th>
                      <td className="lc-num">{count(input)}</td>
                      <td className="lc-num">{count(input / n)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="lc-note" style={{ textAlign: 'center' }}><T>Worked out from the numbers you entered above.</T></p>
        </div>
      </section>

      <section className="mk-section" aria-labelledby="lc-faq">
        <div className="mk-wrap">
          <SectionHead eyebrow="GOOD TO KNOW" title="How the numbers are worked out." id="lc-faq" align="center" />
          <div className="lc-faq">
            {faq.map((f, i) => (
              <Reveal key={f.q} delay={i * 50}>
                <details className="lc-faq-item"><summary><T>{f.q}</T></summary><p><T>{f.a}</T></p></details>
              </Reveal>
            ))}
          </div>
          <div className="lc-cta">
            <h2 className="lc-title"><T>Pay the provider, not a markup.</T></h2>
            <p>
              <T>Crescelo connects to your own AI key, so the bill above goes straight to the provider at their price. We add nothing on top.</T>{' '}
              <Link href="/support/ai-connectors" style={{ textDecoration: 'underline' }}><T>See how to connect a key</T></Link>
            </p>
            <div className="mk-cta-row" style={{ justifyContent: 'center' }}>
              <ButtonLink href={SIGNUP_HREF}><T>Start free trial</T></ButtonLink>
              <ButtonLink href="/pricing" variant="ghost"><T>View pricing</T></ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
