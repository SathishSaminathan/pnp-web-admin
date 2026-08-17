import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import store from './store/index.js'
import App from './App.jsx'
import './index.css'
import { validateEnvironment } from './services/security.js'
import logger from './services/logger.js'
import monitoring from './services/monitoring.js'
import { logError } from './services/errorLogger.js'
import RootErrorBoundary from './components/error/RootErrorBoundary.jsx'

// Validate environment on startup
validateEnvironment();

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  logger.error('Unhandled Promise rejection', {
    reason: event.reason?.message || String(event.reason),
    stack: event.reason?.stack?.slice(0, 500),
  });
  monitoring.captureError(event.reason, { context: 'unhandledrejection' });
  logError({
    error: event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
    level: 'fatal',
    source: 'unhandled-promise',
  });
});

// Global error handler for uncaught exceptions
window.addEventListener('error', (event) => {
  logger.error('Uncaught error', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
  });
  logError({
    error: event.error || new Error(String(event.message)),
    level: 'fatal',
    source: 'window-error',
  });
});

// Flush logs to monitoring on page unload (best-effort)
window.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    monitoring.flushLogs();
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <RootErrorBoundary>
    <Provider store={store}>
      <App />
    </Provider>
  </RootErrorBoundary>
)
