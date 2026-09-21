import type { Metadata } from 'next';

// Unlinked and kept out of search engines. Access is enforced by the API, not by hiding the page.
export const metadata: Metadata = {
  title: 'Crescelo',
  robots: { index: false, follow: false, nocache: true },
};

export default function MasterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
