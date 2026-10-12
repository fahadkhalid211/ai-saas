'use client';

import { T } from '@/lib/i18n/context';
import React from 'react';
import {
  BookOpen,
  Lightbulb,
  FileText,
  Target,
  RefreshCw,
  Globe,
  Eye,
  ClipboardList,
} from 'lucide-react';

const Youtube = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

export const DocsTab: React.FC = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    <T>Guides &amp; Documentation</T>
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    <T>Step-by-step guides to set up integrations, train your AI, and get the most out of Crescelo.</T>
                  </p>
                </div>

                {/* Section: Getting Started */}
                <div>
                  <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                    <T>Getting Started</T>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        title: 'Training Your AI with Data',
                        badge: 'Core',
                        badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
                        steps: [
                          'Go to Knowledge Base in the sidebar.',
                          'Click "Upload File" — supports PDF, CSV, DOCX, TXT, PNG/JPG images.',
                          'Or paste a URL / YouTube link to extract content automatically.',
                          'Wait for status to turn "Ready" (green). This means the AI has indexed the data.',
                          'Test it instantly in Testing Studio by asking questions.',
                        ],
                        tip: 'For large datasets, use CSV files with column headers. The AI understands tabular data like member lists, product catalogs, and FAQs.',
                      },
                      {
                        title: 'Embedding the Widget on Your Site',
                        badge: 'Setup',
                        badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
                        steps: [
                          'Go to Widget & Styling → click "Embed on Your Site".',
                          'Copy the one-line <script> tag shown in the modal.',
                          'Paste it before the </body> tag on any HTML page.',
                          'For WordPress: use a plugin like "Insert Headers and Footers" to paste the script.',
                          'For Webflow/Framer: paste in "Custom Code" → Before </body>.',
                        ],
                        tip: 'The widget loads asynchronously — it won\'t slow down your page. Works on any site.',
                      },
                    ].map((guide) => (
                      <div
                        key={guide.title}
                        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${guide.badgeColor}`}>
                            {guide.badge}
                          </span>
                          <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm"><T>{guide.title}</T></h3>
                        </div>
                        <ol className="space-y-1.5 mb-3">
                          {guide.steps.map((step, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                              <span className="shrink-0 w-4 h-4 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] font-bold mt-0.5">
                                {i + 1}
                              </span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                        {guide.tip && (
                          <div className="flex items-start gap-2 text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl p-2.5">
                            <Lightbulb className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                            <span>{guide.tip}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section: Integrations */}
                <div>
                  <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                    <T>Integrations</T>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        title: 'Connect WhatsApp',
                        badge: 'WhatsApp Cloud API',
                        badgeColor: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
                        steps: [
                          'Go to Meta for Developers → create a new app → choose "Business" type.',
                          'Add the WhatsApp product to your app.',
                          'Under WhatsApp → Getting Started: copy your Phone Number ID and temporary Access Token.',
                          'In Crescelo → Channels & Integrations → WhatsApp, paste both values.',
                          'Set the Verify Token to any string you choose (e.g. "crescelo2024").',
                          'In Meta Dashboard → WhatsApp → Configuration, set Webhook URL to the one shown in Crescelo and use your same Verify Token.',
                          'Subscribe to the "messages" webhook field and click Verify.',
                          'Enable WhatsApp in Crescelo and save.',
                        ],
                        tip: 'Use a permanent System User token for production instead of the temporary token which expires.',
                      },
                      {
                        title: 'Connect Telegram',
                        badge: 'Telegram Bot API',
                        badgeColor: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
                        steps: [
                          'Open Telegram and search for @BotFather.',
                          'Send /newbot and follow the prompts to name your bot.',
                          'BotFather gives you a Bot Token — copy it.',
                          'Go to Crescelo → Channels & Integrations → Telegram Bot.',
                          'Paste your Bot Token and click "Test Connection" to verify it works.',
                          'Click "Set Webhook" — this connects Telegram to your Crescelo assistant.',
                          'Enable the bot and save. Users can now chat your AI via Telegram.',
                        ],
                        tip: 'Your Telegram bot is public by default. Consider setting /setprivacy with BotFather to control group access.',
                      },
                      {
                        title: 'Outbound Webhooks',
                        badge: 'Automation',
                        badgeColor: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
                        steps: [
                          'Go to Channels & Integrations → Outbound Webhooks.',
                          'Enter your endpoint URL (e.g. a Zapier Webhook, Make.com, or your own server).',
                          'Set a Webhook Secret — this signs each request with HMAC SHA-256 for security.',
                          'Select which events to send: Lead Captured, Message Sent, etc.',
                          'Click "Send Test Ping" to verify your endpoint receives data.',
                          'Save. Every matching event will now POST JSON to your URL.',
                        ],
                        tip: 'Verify the X-Crescelo-Signature header on your receiving server to prevent spoofed requests.',
                      },
                      {
                        title: 'White-Label / Agency Branding',
                        badge: 'Agency',
                        badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
                        steps: [
                          'Go to Channels & Integrations → White-Label Agency Branding.',
                          'Toggle "Enable White-Label" to ON.',
                          'Enter your brand name (e.g. "Powered by Acme AI") in Custom Branding Text.',
                          'Enter your brand URL for the clickable link.',
                          'Save — the widget footer now shows your brand instead of Crescelo.',
                        ],
                        tip: 'You can leave the URL blank to disable the link and just show your brand text.',
                      },
                    ].map((guide) => (
                      <div
                        key={guide.title}
                        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${guide.badgeColor}`}>
                            {guide.badge}
                          </span>
                          <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm"><T>{guide.title}</T></h3>
                        </div>
                        <ol className="space-y-1.5 mb-3">
                          {guide.steps.map((step, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                              <span className="shrink-0 w-4 h-4 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] font-bold mt-0.5">
                                {i + 1}
                              </span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                        {guide.tip && (
                          <div className="flex items-start gap-2 text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl p-2.5">
                            <Lightbulb className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                            <span>{guide.tip}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section: AI & Knowledge Tips */}
                <div>
                  <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                    <T>AI & Knowledge Tips</T>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      {
                        iconName: 'file',
                        title: 'Best File Formats',
                        body: 'PDFs and CSVs give the best accuracy. For member data, use a CSV with headers like Name, Email, DOB, Plan. Avoid scanned images when possible — use real text PDFs.',
                      },
                      {
                        iconName: 'target',
                        title: 'Writing a Good System Prompt',
                        body: 'Be specific: tell the AI its role ("You are a support agent for Acme Gym"), what it should and shouldn\'t answer, and what tone to use. Short and clear beats long and vague.',
                      },
                      {
                        iconName: 'refresh',
                        title: 'Re-training After Updates',
                        body: 'After updating source material (new FAQ, updated policy), delete the old knowledge source and re-upload the new file. The AI uses what\'s indexed — stale data = stale answers.',
                      },
                      {
                        iconName: 'globe',
                        title: 'Adding Web Pages',
                        body: 'Use the URL field to scrape any public webpage — product pages, terms, about pages. Works best on pages without JavaScript-rendered content (static HTML).',
                      },
                      {
                        iconName: 'youtube',
                        title: 'YouTube Transcripts',
                        body: 'Paste a YouTube URL to extract the video transcript. Great for indexing explainer videos, tutorials, and interviews. Only works if captions are available on the video.',
                      },
                      {
                        iconName: 'eye',
                        title: 'Image Text (OCR)',
                        body: 'Upload PNG/JPG files — the AI extracts printed text from the image. Works best on clear, high-contrast text. Handwritten notes and low-quality scans may not extract well.',
                      },
                    ].map((card) => (
                      <div
                        key={card.title}
                        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs"
                      >
                        <div className="mb-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 inline-block border border-slate-200 dark:border-slate-700">
                          {card.iconName === 'file' && <FileText className="h-5 w-5 text-blue-500" />}
                          {card.iconName === 'target' && <Target className="h-5 w-5 text-rose-500" />}
                          {card.iconName === 'refresh' && <RefreshCw className="h-5 w-5 text-amber-500" />}
                          {card.iconName === 'globe' && <Globe className="h-5 w-5 text-emerald-500" />}
                          {card.iconName === 'youtube' && <Youtube className="h-5 w-5 text-red-500" />}
                          {card.iconName === 'eye' && <Eye className="h-5 w-5 text-purple-500" />}
                        </div>
                        <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-xs mb-1.5"><T>{card.title}</T></h4>
                        <p className="text-[11.5px] text-slate-500 dark:text-slate-400 leading-relaxed">{card.body}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section: Lead Capture */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm mb-3 flex items-center gap-2">
                    <span className="flex items-center gap-1.5"><ClipboardList className="h-4 w-4 text-blue-500 inline" /><span><T>Setting Up Lead Capture</T></span></span>
                  </h3>
                  <ol className="space-y-2">
                    {[
                      'Go to Behavior & Rules → Lead Capture section.',
                      'Toggle "Collect Lead Email" to ON.',
                      'Enter the Receiver Email — this is who gets notified when a lead submits their info.',
                      'Optionally add CC emails (comma-separated) for your team.',
                      'Add Custom Form Fields if you need more than just name/email/phone (e.g. "Company", "Budget", "Membership Plan").',
                      'Save Settings. The widget will now show a contact form when visitors express interest.',
                      'View all captured leads in the Captured Leads tab.',
                    ].map((step, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                        <span className="shrink-0 w-4 h-4 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] font-bold mt-0.5">
                          {i + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

              </div>
  );
};
