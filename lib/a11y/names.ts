/**
 * Names for buttons that only show an icon. The dashboard draws its icons with lucide, whose SVGs carry a class such as
 * "lucide lucide-trash-2"; that class tells us what the button does, so assistive technology can announce it.
 */

const KNOWN: Record<string, string> = {
  x: 'Close',
  'x-circle': 'Close',
  trash: 'Delete',
  'trash-2': 'Delete',
  pencil: 'Edit',
  'pencil-line': 'Edit',
  edit: 'Edit',
  'edit-2': 'Edit',
  'edit-3': 'Edit',
  'square-pen': 'Edit',
  copy: 'Copy',
  check: 'Confirm',
  plus: 'Add',
  'plus-circle': 'Add',
  minus: 'Remove',
  search: 'Search',
  menu: 'Menu',
  settings: 'Settings',
  'more-horizontal': 'More options',
  'more-vertical': 'More options',
  ellipsis: 'More options',
  'ellipsis-vertical': 'More options',
  'chevron-down': 'Expand',
  'chevron-up': 'Collapse',
  'chevron-left': 'Previous',
  'chevron-right': 'Next',
  'arrow-left': 'Back',
  'arrow-right': 'Next',
  'arrow-up': 'Up',
  'arrow-down': 'Down',
  download: 'Download',
  upload: 'Upload',
  'refresh-cw': 'Refresh',
  'rotate-cw': 'Refresh',
  send: 'Send',
  eye: 'Show',
  'eye-off': 'Hide',
  'external-link': 'Open in a new tab',
  'log-out': 'Sign out',
  bell: 'Notifications',
  info: 'More information',
  'help-circle': 'Help',
  'circle-help': 'Help',
  mic: 'Voice input',
  'volume-2': 'Sound',
  sun: 'Switch to light mode',
  moon: 'Switch to dark mode',
  'panel-left': 'Toggle sidebar',
  'maximize-2': 'Expand',
  'minimize-2': 'Minimise',
  star: 'Favourite',
  link: 'Link',
  filter: 'Filter',
  'qr-code': 'QR code',
  share: 'Share',
  'share-2': 'Share',
};

const words = (s: string) => s.replace(/-\d+$/, '').replace(/-/g, ' ');

/** The label for an SVG's class list, or '' when it is not a recognisable lucide icon. */
export function iconLabel(svgClass: string): string {
  const m = svgClass.match(/lucide-([a-z0-9-]+)/g);
  if (!m) return '';
  // an icon can carry several names ("lucide-trash lucide-trash-2"); prefer one we know, else the last
  const names = m.map((c) => c.replace('lucide-', ''));
  const known = names.find((n) => KNOWN[n]);
  if (known) return KNOWN[known];
  const name = names[names.length - 1];
  const w = words(name);
  return w ? w.charAt(0).toUpperCase() + w.slice(1) : '';
}
