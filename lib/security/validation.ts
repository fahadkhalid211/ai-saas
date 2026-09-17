/**
 * Enterprise Validation & Input Sanitization Suite
 * Provides type-safe validation rules, regex assertions, and sanitizers
 * for all input fields across the platform.
 */

export const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export const PHONE_REGEX = /^\+?[0-9\s\-().]{7,25}$/;

export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

export const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const TIME_SLOT_REGEX = /^(?:[01]?\d|2[0-3]):[0-5]\d(?:\s?(?:AM|PM|am|pm))?$/;

export const KNOWN_INDUSTRY_TEMPLATES = [
  'classic-barbershop',
  'fitness-gym',
  'real-estate',
  'ecommerce-store',
  'b2b-saas',
  'legal-law-firm',
  'dental-clinic',
  'nexus-ai',
  'hyperion-agency',
  'aether-finance',
  'custom',
] as const;

export type KnownIndustryTemplate = typeof KNOWN_INDUSTRY_TEMPLATES[number];

/**
 * Escapes unsafe HTML characters to protect against reflected and stored XSS.
 */
export function sanitizeHtml(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Strips script tags and removes control characters.
 */
export function sanitizeInput(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/data:text\/html/gi, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim();
}

/**
 * Validates an email address.
 */
export function validateEmail(email: unknown): { valid: boolean; error?: string; value?: string } {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email address is required.' };
  }
  const clean = email.trim().toLowerCase();
  if (clean.length < 5 || clean.length > 120) {
    return { valid: false, error: 'Email must be between 5 and 120 characters.' };
  }
  if (!EMAIL_REGEX.test(clean)) {
    return { valid: false, error: 'Please enter a valid email address (e.g. name@company.com).' };
  }
  return { valid: true, value: clean };
}

/**
 * Validates a telephone number.
 */
export function validatePhone(
  phone: unknown,
  required: boolean = false
): { valid: boolean; error?: string; value?: string } {
  if (!phone || typeof phone !== 'string' || !phone.trim()) {
    if (required) {
      return { valid: false, error: 'Phone number is required.' };
    }
    return { valid: true, value: '' };
  }
  const clean = phone.trim();
  if (clean.length < 7 || clean.length > 25) {
    return { valid: false, error: 'Phone number must be between 7 and 25 characters.' };
  }
  if (!PHONE_REGEX.test(clean)) {
    return { valid: false, error: 'Please enter a valid phone number (e.g. +1 (555) 234-5678).' };
  }
  return { valid: true, value: clean };
}

/**
 * Validates a URL slug.
 */
export function validateSlug(
  slug: unknown,
  fieldName: string = 'Slug'
): { valid: boolean; error?: string; value?: string } {
  if (!slug || typeof slug !== 'string' || !slug.trim()) {
    return { valid: false, error: `${fieldName} is required.` };
  }
  const clean = slug.trim().toLowerCase();
  if (clean.length < 2 || clean.length > 64) {
    return { valid: false, error: `${fieldName} must be between 2 and 64 characters.` };
  }
  if (!SLUG_REGEX.test(clean)) {
    return {
      valid: false,
      error: `${fieldName} may only contain lowercase letters, numbers, and hyphens (e.g. my-business-site).`,
    };
  }
  return { valid: true, value: clean };
}

/**
 * Validates a string with min and max length bounds.
 */
export function validateString(
  val: unknown,
  min: number,
  max: number,
  fieldName: string,
  required: boolean = true
): { valid: boolean; error?: string; value?: string } {
  if (val === undefined || val === null || val === '') {
    if (required) {
      return { valid: false, error: `${fieldName} is required.` };
    }
    return { valid: true, value: '' };
  }
  if (typeof val !== 'string') {
    return { valid: false, error: `${fieldName} must be text.` };
  }
  const clean = val.trim();
  if (required && clean.length < min) {
    return { valid: false, error: `${fieldName} must be at least ${min} characters.` };
  }
  if (clean.length > max) {
    return { valid: false, error: `${fieldName} cannot exceed ${max} characters.` };
  }
  return { valid: true, value: clean };
}

/**
 * Validates a number with min and max bounds.
 */
export function validateNumber(
  val: unknown,
  min: number,
  max: number,
  fieldName: string,
  required: boolean = true
): { valid: boolean; error?: string; value?: number } {
  if (val === undefined || val === null || val === '') {
    if (required) {
      return { valid: false, error: `${fieldName} is required.` };
    }
    return { valid: true, value: 0 };
  }
  const num = typeof val === 'number' ? val : Number(val);
  if (isNaN(num)) {
    return { valid: false, error: `${fieldName} must be a valid number.` };
  }
  if (num < min) {
    return { valid: false, error: `${fieldName} cannot be less than ${min}.` };
  }
  if (num > max) {
    return { valid: false, error: `${fieldName} cannot exceed ${max}.` };
  }
  return { valid: true, value: num };
}

/**
 * Validates an ISO calendar date (YYYY-MM-DD) and checks for past date constraints.
 */
export function validateDate(
  dateStr: unknown,
  allowPast: boolean = false
): { valid: boolean; error?: string; value?: string } {
  if (!dateStr || typeof dateStr !== 'string') {
    return { valid: false, error: 'Appointment date is required.' };
  }
  const clean = dateStr.trim();
  if (!DATE_REGEX.test(clean)) {
    return { valid: false, error: 'Date must be formatted as YYYY-MM-DD.' };
  }

  const [yearStr, monthStr, dayStr] = clean.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  if (month < 1 || month > 12) {
    return { valid: false, error: 'Invalid month in appointment date.' };
  }

  const maxDay = new Date(year, month, 0).getDate();
  if (day < 1 || day > maxDay) {
    return { valid: false, error: `Invalid day ${day} for the specified month.` };
  }

  if (!allowPast) {
    const today = new Date().toISOString().split('T')[0];
    if (clean < today) {
      return { valid: false, error: 'Appointment date cannot be in the past.' };
    }
  }

  return { valid: true, value: clean };
}

/**
 * Validates an appointment time slot.
 */
export function validateTimeSlot(timeStr: unknown): { valid: boolean; error?: string; value?: string } {
  if (!timeStr || typeof timeStr !== 'string') {
    return { valid: false, error: 'Appointment time slot is required.' };
  }
  const clean = timeStr.trim();
  if (!TIME_SLOT_REGEX.test(clean)) {
    return { valid: false, error: 'Please select a valid time slot (e.g. 10:00 or 2:30 PM).' };
  }
  return { valid: true, value: clean };
}

/**
 * Validates a web URL.
 */
export function validateUrl(
  url: unknown,
  allowEmpty: boolean = true,
  fieldName: string = 'URL'
): { valid: boolean; error?: string; value?: string } {
  if (!url || typeof url !== 'string' || !url.trim()) {
    if (allowEmpty) return { valid: true, value: '' };
    return { valid: false, error: `${fieldName} is required.` };
  }
  const clean = url.trim();
  try {
    const parsed = new URL(clean);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { valid: false, error: `${fieldName} must begin with http:// or https://.` };
    }
    return { valid: true, value: clean };
  } catch {
    return { valid: false, error: `Please enter a valid ${fieldName} (e.g. https://example.com).` };
  }
}

/**
 * Validates self-serve business registration payload.
 */
export function validateRegistrationPayload(data: any): {
  valid: boolean;
  errors: Record<string, string>;
  sanitized?: {
    businessName: string;
    email: string;
    password?: string;
    industryTemplateSlug: string;
  };
} {
  const errors: Record<string, string> = {};

  const nameCheck = validateString(data?.businessName, 2, 100, 'Business Name');
  if (!nameCheck.valid) errors.businessName = nameCheck.error!;

  const emailCheck = validateEmail(data?.email);
  if (!emailCheck.valid) errors.email = emailCheck.error!;

  let password: string | undefined = undefined;
  if (data?.password) {
    const passCheck = validateString(data.password, 6, 128, 'Password', true);
    if (!passCheck.valid) errors.password = passCheck.error!;
    else password = passCheck.value;
  }

  let templateSlug = (data?.industryTemplateSlug || 'classic-barbershop').trim().toLowerCase();
  const matched = KNOWN_INDUSTRY_TEMPLATES.find(
    (k) => k === templateSlug || templateSlug.includes(k)
  );
  if (!matched && templateSlug !== 'custom') {
    templateSlug = 'classic-barbershop';
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: {},
    sanitized: {
      businessName: sanitizeInput(nameCheck.value!),
      email: emailCheck.value!,
      password,
      industryTemplateSlug: templateSlug,
    },
  };
}

/**
 * Validates new appointment booking submission payload.
 */
export function validateAppointmentPayload(data: any): {
  valid: boolean;
  errors: Record<string, string>;
  sanitized?: {
    assistantId: string;
    name: string;
    email: string;
    phone: string;
    date: string;
    timeSlot: string;
    durationMinutes: number;
    serviceId?: string;
    serviceName?: string;
    price: number;
    notes?: string;
    landingPageName?: string;
    landingPageSlug?: string;
  };
} {
  const errors: Record<string, string> = {};

  const astCheck = validateString(data?.assistantId, 1, 128, 'Assistant ID');
  if (!astCheck.valid) errors.assistantId = astCheck.error!;

  const nameCheck = validateString(data?.name, 2, 100, 'Customer Name');
  if (!nameCheck.valid) errors.name = nameCheck.error!;

  const emailCheck = validateEmail(data?.email);
  if (!emailCheck.valid) errors.email = emailCheck.error!;

  const phoneCheck = validatePhone(data?.phone, false);
  if (!phoneCheck.valid) errors.phone = phoneCheck.error!;

  const dateCheck = validateDate(data?.date, false);
  if (!dateCheck.valid) errors.date = dateCheck.error!;

  const timeCheck = validateTimeSlot(data?.timeSlot);
  if (!timeCheck.valid) errors.timeSlot = timeCheck.error!;

  const durCheck = validateNumber(data?.durationMinutes, 5, 480, 'Duration Minutes', false);
  const durationMinutes = durCheck.valid ? durCheck.value || 40 : 40;

  const priceCheck = validateNumber(data?.price, 0, 100000, 'Price', false);
  const price = priceCheck.valid ? priceCheck.value || 0 : 0;

  const notes = data?.notes ? sanitizeInput(String(data.notes)).slice(0, 500) : '';

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: {},
    sanitized: {
      assistantId: astCheck.value!,
      name: sanitizeInput(nameCheck.value!),
      email: emailCheck.value!,
      phone: phoneCheck.value || '',
      date: dateCheck.value!,
      timeSlot: timeCheck.value!,
      durationMinutes,
      serviceId: data?.serviceId ? sanitizeInput(String(data.serviceId)) : undefined,
      serviceName: data?.serviceName ? sanitizeInput(String(data.serviceName)) : undefined,
      price,
      notes,
      landingPageName: data?.landingPageName ? sanitizeInput(String(data.landingPageName)) : undefined,
      landingPageSlug: data?.landingPageSlug ? sanitizeInput(String(data.landingPageSlug)) : undefined,
    },
  };
}

/**
 * Validates chat API request payload.
 */
export function validateChatPayload(data: any): {
  valid: boolean;
  errors: Record<string, string>;
  sanitized?: {
    assistantId: string;
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
    visitorId?: string;
    conversationId?: string;
    preferredLanguage?: string;
    landingPageSlug?: string;
  };
} {
  const errors: Record<string, string> = {};

  const astCheck = validateString(data?.assistantId, 1, 128, 'Assistant ID');
  if (!astCheck.valid) errors.assistantId = astCheck.error!;

  if (!data?.messages || !Array.isArray(data.messages) || data.messages.length === 0) {
    errors.messages = 'A messages array containing at least one message is required.';
  }

  const sanitizedMessages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [];

  if (Array.isArray(data?.messages)) {
    for (let i = 0; i < data.messages.length; i++) {
      const msg = data.messages[i];
      if (!msg || typeof msg !== 'object') {
        errors[`messages[${i}]`] = 'Message must be an object with role and content.';
        continue;
      }
      const role = msg.role;
      if (role !== 'user' && role !== 'assistant' && role !== 'system') {
        errors[`messages[${i}].role`] = 'Role must be user, assistant, or system.';
      }
      if (typeof msg.content !== 'string' || !msg.content.trim()) {
        errors[`messages[${i}].content`] = 'Message content cannot be empty.';
      } else if (msg.content.length > 4000) {
        errors[`messages[${i}].content`] = 'Message content cannot exceed 4,000 characters.';
      } else {
        sanitizedMessages.push({
          role: role as any,
          content: sanitizeInput(msg.content),
        });
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: {},
    sanitized: {
      assistantId: astCheck.value!,
      messages: sanitizedMessages,
      visitorId: data?.visitorId ? sanitizeInput(String(data.visitorId)) : undefined,
      conversationId: data?.conversationId ? sanitizeInput(String(data.conversationId)) : undefined,
      preferredLanguage: data?.preferredLanguage ? sanitizeInput(String(data.preferredLanguage)) : undefined,
      landingPageSlug: data?.landingPageSlug ? sanitizeInput(String(data.landingPageSlug)) : undefined,
    },
  };
}

/**
 * Validates landing page configuration payload.
 */
export function validateLandingPagePayload(config: any): {
  valid: boolean;
  errors: Record<string, string>;
  sanitized?: any;
} {
  const errors: Record<string, string> = {};

  if (!config || typeof config !== 'object') {
    return { valid: false, errors: { config: 'Landing page configuration object is required.' } };
  }

  const nameCheck = validateString(config.businessName, 2, 100, 'Business Name');
  if (!nameCheck.valid) errors.businessName = nameCheck.error!;

  const slugCheck = validateSlug(config.slug, 'URL Slug');
  if (!slugCheck.valid) errors.slug = slugCheck.error!;

  if (config.email) {
    const emailCheck = validateEmail(config.email);
    if (!emailCheck.valid) errors.email = emailCheck.error!;
  }

  if (config.phone) {
    const phoneCheck = validatePhone(config.phone, false);
    if (!phoneCheck.valid) errors.phone = phoneCheck.error!;
  }

  if (config.themeColor) {
    const cleanColor = String(config.themeColor).trim();
    if (!HEX_COLOR_REGEX.test(cleanColor)) {
      errors.themeColor = 'Theme color must be a valid hex color code (e.g. #2563eb).';
    }
  }

  if (config.services && Array.isArray(config.services)) {
    for (let i = 0; i < config.services.length; i++) {
      const s = config.services[i];
      if (!s.name || typeof s.name !== 'string' || !s.name.trim()) {
        errors[`services[${i}].name`] = 'Service name cannot be empty.';
      }
      if (s.price !== undefined) {
        const pCheck = validateNumber(s.price, 0, 100000, 'Service price', false);
        if (!pCheck.valid) errors[`services[${i}].price`] = pCheck.error!;
      }
      if (s.durationMinutes !== undefined) {
        const dCheck = validateNumber(s.durationMinutes, 5, 480, 'Service duration', false);
        if (!dCheck.valid) errors[`services[${i}].durationMinutes`] = dCheck.error!;
      }
    }
  }

  if (config.socialLinks && typeof config.socialLinks === 'object') {
    for (const [key, link] of Object.entries(config.socialLinks)) {
      if (link && typeof link === 'string' && link.trim()) {
        const urlCheck = validateUrl(link, true, `${key} link`);
        if (!urlCheck.valid) errors[`socialLinks.${key}`] = urlCheck.error!;
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: {},
    sanitized: {
      ...config,
      businessName: sanitizeInput(nameCheck.value!),
      slug: slugCheck.value!,
      heroHeadline: config.heroHeadline ? sanitizeInput(String(config.heroHeadline)).slice(0, 250) : undefined,
      heroSubheadline: config.heroSubheadline ? sanitizeInput(String(config.heroSubheadline)).slice(0, 600) : undefined,
      address: config.address ? sanitizeInput(String(config.address)).slice(0, 300) : undefined,
      phone: config.phone ? sanitizeInput(String(config.phone)).slice(0, 30) : undefined,
      email: config.email ? String(config.email).trim().toLowerCase().slice(0, 120) : undefined,
    },
  };
}
