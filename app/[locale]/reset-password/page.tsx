import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ResetPasswordClient } from './ResetPasswordClient';

export const metadata: Metadata = {
  title: 'Reset Password | Crescelo',
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordClient />
    </Suspense>
  );
}
