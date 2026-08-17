import React, { Component, Suspense } from 'react';
import { Spin } from 'antd';
import { logError } from '../../services/errorLogger.js';
import ErrorFallback from './ErrorFallback.jsx';

/**
 * Async Error Boundary
 *
 * Combines React.lazy + Suspense + ErrorBoundary for lazy-loaded components.
 * Ideal for wrapping:
 * - Lazy-loaded pages/modules
 * - Complex chart/graph components
 * - Third-party widgets that may crash
 *
 * Features:
 * - Shows loading spinner during lazy load
 * - Catches chunk load failures (network issues)
 * - Provides retry mechanism for failed lazy loads
 * - Isolates crashes to the wrapped module only
 *
 * Usage:
 *   <AsyncErrorBoundary fallbackMessage="Chart failed to load">
 *     <LazyChart />
 *   </AsyncErrorBoundary>
 */

const DefaultLoader = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <Spin size="large" />
  </div>
);

class AsyncErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    const isChunkError = this.isChunkLoadError(error);

    const errorId = logError({
      error,
      errorInfo,
      level: isChunkError ? 'warning' : 'error',
      source: `async-boundary${this.props.moduleName ? `:${this.props.moduleName}` : ''}`,
    });

    this.setState({ errorId });
  }

  isChunkLoadError(error) {
    return (
      error?.name === 'ChunkLoadError' ||
      error?.message?.includes('Loading chunk') ||
      error?.message?.includes('dynamically imported module') ||
      error?.message?.includes('Failed to fetch')
    );
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorId: null });
  };

  render() {
    if (this.state.hasError) {
      const isChunkError = this.isChunkLoadError(this.state.error);

      return (
        <ErrorFallback
          title={isChunkError ? 'Loading Failed' : (this.props.fallbackTitle || 'Component Error')}
          description={
            isChunkError
              ? 'A network error occurred while loading this section. Please check your connection and try again.'
              : (this.props.fallbackMessage || 'This section encountered an error. Other parts of the app are still working.')
          }
          onRetry={this.handleRetry}
          errorId={this.state.errorId}
          variant="inline"
        />
      );
    }

    const { children, loader } = this.props;

    return (
      <Suspense fallback={loader || <DefaultLoader />}>
        {children}
      </Suspense>
    );
  }
}

export default AsyncErrorBoundary;
