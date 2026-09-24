import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign in | Crescelo',
  description: 'Sign in to your Crescelo workspace or create an account.',
  alternates: { canonical: '/login' },
  robots: { index: false, follow: true },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
