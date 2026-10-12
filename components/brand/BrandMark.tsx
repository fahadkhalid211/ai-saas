import { T } from '@/lib/i18n/context';
import { CresceloMark } from './CresceloMark';

/** Crescelo logo: the C mark plus the wordmark. Colours come from the .kx-app tokens. */
export function BrandMark({ size = 32, showWord = true }: { size?: number; showWord?: boolean }) {
  return (
    <span className="kx-brand">
      <CresceloMark size={size} label="Crescelo" />
      {showWord ? <span className="kx-brand-word"><T>Crescelo</T></span> : null}
    </span>
  );
}
