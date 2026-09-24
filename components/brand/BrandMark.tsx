import { CresceloOrb } from './CresceloOrb';

/** Crescelo logo: the orb (its arc turns continuously) plus the wordmark. Colours come from the .kx-app tokens. */
export function BrandMark({ size = 32, showWord = true }: { size?: number; showWord?: boolean }) {
  return (
    <span className="kx-brand">
      <CresceloOrb size={size} label="Crescelo" />
      {showWord ? <span className="kx-brand-word">Crescelo</span> : null}
    </span>
  );
}
