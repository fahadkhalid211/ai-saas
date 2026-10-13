/**
 * Pages where Crescelo's own visitor chrome must not appear: the cookie banner and Crescelo's Google Analytics, and the
 * country/language banner.
 *
 *  - /embed/*  the chat that runs inside an iframe on a customer's website. It is the customer's page and the customer's
 *              visitors: Crescelo's analytics and cookie banner have no place there.
 *  - /site/*   a customer's hosted business page, for the same reason.
 *  - /dashboard, /master  signed-in app screens, whose addresses and titles carry customer data that must not go to Google.
 *
 * The path may carry a language prefix (/sv/embed/...).
 */
const NO_TRACKING = /^\/(?:(?:sv|fi|it|es)\/)?(?:embed|site|dashboard|master)(?:\/|$)/;

export function isNoTrackingPath(pathname: string | null | undefined): boolean {
  return NO_TRACKING.test(pathname || '');
}
