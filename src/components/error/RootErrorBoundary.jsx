import React, { Component } from 'react';
import { logError } from '../../services/errorLogger.js';
import ErrorFallback from './ErrorFallback.jsx';

/**
 * Root-Level Error Boundary
 *
 * Wraps the entire application in main.jsx.
 *
 * Responsibilities:
 * - Catches unhandled rendering errors at the top level
 * - Logs fatal errors to external services
 * - Shows full-app fallback UI
 * - Provides refresh button (full page reload)
 * - Hides technical details in production
 * - Shows stack trace in development only
 * - Prevents white screen crashes
 */
class RootErrorBoundary extends Component {
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
      level: 'fatal',
      source: 'root-boundary',
    });

    this.setState({ errorId });
  }

  handleReset = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          title="Application Error"
          description="An unexpected error has occurred. Our team has been notified and is working on a fix."
          onRetry={this.handleReset}
          errorId={this.state.errorId}
          variant="page"
          showHomeButton={false}
        />
      );
    }

    return this.props.children;
  }
}

export default RootErrorBoundary;
