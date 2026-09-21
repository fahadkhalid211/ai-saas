/** Crescelo logo mark + wordmark, matching the marketing site. Colours come from the .kx-app tokens. */
export function BrandMark({ size = 32, showWord = true }: { size?: number; showWord?: boolean }) {
  return (
    <span className="kx-brand">
      <svg width={size} height={size} viewBox="0 0 22 22" aria-hidden="true">
        <rect x="1" y="1" width="20" height="20" rx="6" fill="#08251a" />
        <path d="M14.6 7.4A5 5 0 1 0 14.6 14.6" stroke="#abff44" strokeWidth="2" strokeLinecap="round" fill="none" />
      </svg>
      {showWord ? <span className="kx-brand-word">Crescelo</span> : null}
    </span>
  );
}
