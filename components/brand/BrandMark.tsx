/** Kortex logo mark + wordmark, matching the marketing site. Colours come from the .kx-app tokens. */
export function BrandMark({ size = 32, showWord = true }: { size?: number; showWord?: boolean }) {
  return (
    <span className="kx-brand">
      <svg width={size} height={size} viewBox="0 0 22 22" aria-hidden="true">
        <rect x="1" y="1" width="20" height="20" rx="6" fill="#08251a" />
        <path d="M7 6v10M7 11l6-5M8.5 10l5.5 6" stroke="#abff44" strokeWidth="2" strokeLinecap="round" fill="none" />
      </svg>
      {showWord ? <span className="kx-brand-word">Kortex</span> : null}
    </span>
  );
}
