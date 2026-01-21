import ASCIIBackground from './ASCIIBackground';
import { ASCIIErrorBoundary } from './ASCIIErrorBoundary';
import type { EffectType } from '@/lib/ascii';

interface Props {
  effect?: EffectType;
}

/**
 * Wrapper component that includes error boundary for safe rendering
 */
export default function ASCIIBackgroundWrapper({ effect = 'wave' }: Props) {
  return (
    <ASCIIErrorBoundary>
      <ASCIIBackground effect={effect} />
    </ASCIIErrorBoundary>
  );
}
