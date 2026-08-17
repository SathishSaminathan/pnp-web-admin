import React, { Component } from 'react';
import { logError } from '../../services/errorLogger.js';
import ErrorFallback from './ErrorFallback.jsx';

/**
 * Page-Level Error Boundary
 *
 * Used inside routes to isolate crashes per page.
 * Does NOT reload the whole app — only resets the boundary.
 * Resets automatically on route change (via key prop from parent).
 *
 * Usage:
 *   <PageErrorBoundary>
 *     <DashboardPage />
 *   </PageErrorBoundary>
 *
 * With route-change reset (recommended):
 *   <PageErrorBoundary key={location.pathname}>
 *     <DashboardPage />
 *   </PageErrorBoundary>
 */
class PageErrorBoundary extends Component {
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
    const errorId = logError({
      error,
      errorInfo,
      level: 'error',
      source: `page-boundary${this.props.pageName ? `:${this.props.pageName}` : ''}`,
    });

    this.setState({ errorId });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorId: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          title="Page Error"
          description="This page encountered an error. Your other pages are still working fine."
          onRetry={this.handleReset}
          onGoHome={() => { window.location.href = '/'; }}
          errorId={this.state.errorId}
          variant="inline"
          showHomeButton={true}
        />
      );
    }

    return this.props.children;
  }
}

export default PageErrorBoundary;
