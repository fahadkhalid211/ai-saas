/**
 * The last-resort 404, used only when no language layout applies (an address like /xx/whatever). It carries its own <html>
 * because it sits above every layout. The styled, translated 404 lives in app/[locale]/not-found.tsx.
 */
export default function RootNotFound() {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', display: 'grid', placeItems: 'center', minHeight: '100vh', margin: 0, background: '#fffeeb', color: '#1a1a1a' }}>
        <main style={{ textAlign: 'center', padding: '2rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Page not found</h1>
          <p style={{ marginBottom: '1.25rem' }}>The page you are looking for does not exist or has moved.</p>
          <a href="/" style={{ color: '#0f6e58', fontWeight: 700 }}>Back to the homepage</a>
        </main>
      </body>
    </html>
  );
}
