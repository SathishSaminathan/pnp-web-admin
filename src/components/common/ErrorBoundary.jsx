import React from 'react';
import ErrorFallback from './ErrorFallback';
import logger from '../../services/logger';
import monitoring from '../../services/monitoring';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Structured logging of UI crashes
    logger.error('Unhandled UI crash caught by ErrorBoundary', {
      errorMessage: error?.message,
      componentStack: errorInfo?.componentStack?.slice(0, 500),
    });

    // Report to monitoring (Sentry/Datadog)
    monitoring.captureError(error, {
      context: 'ErrorBoundary',
      componentStack: errorInfo?.componentStack,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          resetErrorBoundary={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
