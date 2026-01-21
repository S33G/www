import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Error boundary for ASCII background - ensures rendering errors
 * don't crash the whole page
 */
export class ASCIIErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('ASCII Background error:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Fallback to a simple solid background
      return this.props.fallback ?? (
        <div
          className="ascii-background"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'var(--bg-primary, #0f0f0f)',
            zIndex: -1,
          }}
          aria-hidden={true}
        />
      );
    }

    return this.props.children;
  }
}
