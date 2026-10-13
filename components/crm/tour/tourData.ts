// Tour step data — drives the InteractiveProductTour
export interface TourStep {
  id: string;
  selector: string;
  tab: string | null; // null = no tab switch needed
  title: string;
  body: string;
  tip?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'header-bot',
    selector: '[data-tour="header-bot"]',
    tab: 'overview',
    position: 'bottom',
    title: '1. Your AI Assistant',
    body: 'This is your active assistant. Click here to rename it, switch between businesses, or create a brand new assistant for another website.',
    tip: '💡 Tip: You can create separate assistants for different websites, client stores, or locations.',
  },
  {
    id: 'sidebar-nav',
    selector: '[data-tour="nav-overview"]',
    tab: 'overview',
    position: 'right',
    title: '2. Your Control Center',
    body: 'This sidebar gives you access to everything: teaching your AI, safe chat testing, captured leads, customer appointments, and widget styling.',
    tip: '💡 Tip: You can click any section anytime to manage your settings.',
  },
  {
    id: 'knowledge',
    selector: '[data-tour="knowledge-add"]',
    tab: 'knowledge',
    position: 'bottom',
    title: '3. Teach Your AI (Knowledge Base)',
    body: 'This is where your AI learns! Click here to paste your website link, upload PDFs or price lists, or type your business hours. Your AI reads them in seconds.',
    tip: '💡 Non-technical: If it is written in your documents, your AI knows it. Zero coding required!',
  },
  {
    id: 'playground',
    selector: '[data-tour="playground-input"]',
    tab: 'playground',
    position: 'top',
    title: '4. Safe Test Chat (Playground)',
    body: 'Test your AI before customers see it! Type questions a real customer would ask (e.g. "What are your hours?" or "How much is your service?") and watch it answer.',
    tip: '💡 Tip: If an answer needs more detail, simply add a quick note in the Knowledge Base.',
  },
  {
    id: 'widget',
    selector: '[data-tour="widget-controls"]',
    tab: 'widget',
    position: 'right',
    title: '5. Customize Your Chat Widget',
    body: 'Make the chat bubble feel 100% part of your brand! Pick your business colors, welcome greeting message, and avatar. The live preview updates instantly.',
    tip: '💡 Tip: A friendly welcome message dramatically increases visitor engagement.',
  },
  {
    id: 'leads',
    selector: '[data-tour="nav-leads"]',
    tab: 'leads',
    position: 'right',
    title: '6. Customer Leads & Appointments',
    body: 'No more lost visitors! Whenever someone leaves their phone number, email, or books an appointment in the chat, it appears right here in real time.',
    tip: '💡 Tip: You can also connect email alerts or WhatsApp so you get notified instantly.',
  },
  {
    id: 'deploy',
    selector: '[data-tour="header-deploy"]',
    tab: 'overview',
    position: 'bottom',
    title: '7. Put It on Your Website in 60s',
    body: 'Ready to go live? Click this blue button to copy a 1-line script code for any website, or download our 1-click WordPress plugin. Your AI will be live immediately!',
    tip: '💡 Tip: Works on WordPress, Shopify, Wix, Squarespace, Webflow, and custom sites.',
  },
];
