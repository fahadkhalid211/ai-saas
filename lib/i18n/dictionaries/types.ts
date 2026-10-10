export interface TranslationDictionary {
  nav: {
    product: string;
    features: string;
    pricing: string;
    blog: string;
    integrations: string;
    playground: string;
    contact: string;
    login: string;
    signup: string;
    dashboard: string;
    whoItsFor: string;
    support: string;
  };
  geoBanner: {
    visitingFrom: string;
    switchedTo: string;
    keep: string;
    switchToEnglish: string;
    dismiss: string;
  };
  switcher: {
    language: string;
    detectedCountry: string;
    globalDefault: string;
  };
  hero: {
    eyebrow: string;
    title: [string, string];
    body: string;
    primaryCta: string;
    secondaryCta: string;
    trust: string[];
    turns: { q: string; a: string; source: string; booking?: boolean }[];
    interactiveCaption: string;
    sampleBadge: string;
    confirmBooking: string;
    confirmed: string;
  };
  logoStrip: {
    caption: string;
    items: string[];
  };
  story: {
    eyebrow: string;
    title: string;
    before: { title: string; body: string }[];
    afterEyebrow: string;
    afterTitle: string;
    after: { title: string; body: string }[];
  };
  demo: {
    eyebrow: string;
    title: string;
    intro: string;
    question: string;
    visitorAsks: string;
    genericLabel: string;
    genericText: string;
    genericNote: string;
    groundedLabel: string;
    groundedText: string;
    groundedNote: string;
    badTitle: string;
    badWords: string[];
    goodTitle: string;
    goodWords: string[];
  };
  useCases: {
    eyebrow: string;
    title: string;
    items: {
      id: string;
      label: string;
      title: string;
      body: string;
      points: string[];
    }[];
  };
  metrics: {
    eyebrow: string;
    title: string;
    items: { value: number; suffix: string; label: string }[];
    footnote: string;
  };
  integrations: {
    eyebrow: string;
    title: string;
    intro: string;
  };
  security: {
    eyebrow: string;
    title: string;
    intro: string;
    items: { title: string; body: string }[];
  };
  pricing: {
    eyebrow: string;
    title: string;
    intro: string;
    monthly: string;
    annual: string;
    save: string;
    recommended: string;
    perMonth: string;
    trialNote: string;
    billedAnnually: string;
    billedMonthly: string;
    byokNote: string;
  };
  faq: {
    eyebrow: string;
    title: string;
    items: { q: string; a: string }[];
  };
  finalCta: {
    title: string;
    body: string;
    primary: string;
    secondary: string;
  };
  newsletter: {
    title: string;
    placeholder: string;
    button: string;
    success: string;
    error: string;
  };
  footer: {
    blurb: string;
    allRightsReserved: string;
    contactSupport: string;
    cookieSettings: string;
    legalNote: string;
    productCol: string;
    solutionsCol: string;
    legalCol: string;
  };
  auth: {
    viewWebsite: string;
    back: string;
    registerTitle: string;
    loginTitle: string;
    registerSubtitle: string;
    loginSubtitle: string;
    continueWithGoogle: string;
    orWithEmail: string;
    registerTab: string;
    loginTab: string;
    businessNameLabel: string;
    businessNamePlaceholder: string;
    businessNameError: string;
    ownerEmailLabel: string;
    ownerEmailPlaceholder: string;
    ownerEmailError: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    passwordError: string;
    staffEmailLabel: string;
    staffEmailPlaceholder: string;
    staffPasswordLabel: string;
    staffPasswordPlaceholder: string;
    createAccountBtn: string;
    signInBtn: string;
    creatingAccount: string;
    signingIn: string;
    termsNotice: string;
    termsLink: string;
    privacyLink: string;
    and: string;
  };
}
