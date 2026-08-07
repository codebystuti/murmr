import { Component, type ReactNode } from 'react';
import { RouteErrorFallback } from './RouteErrorFallback';

interface Props {
  children: ReactNode;
}

interface State {
  error: unknown;
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: undefined };

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: unknown, info: { componentStack: string }) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return <RouteErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
