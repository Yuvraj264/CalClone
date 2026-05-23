import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { AlertOctagon } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[React Runtime Crash Intercepted]', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-black flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-8 text-center flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/20 text-rose-600 flex items-center justify-center mb-2">
              <AlertOctagon className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Something went wrong
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm">
              {this.state.error?.message || 'An unexpected rendering crash occurred. Please refresh or try again.'}
            </p>
            <div className="flex items-center justify-center gap-3 w-full mt-2">
              <Button size="sm" onClick={this.handleReset} className="w-full">
                Reload Application
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
