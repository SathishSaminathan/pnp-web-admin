export const HEALTH_STATUS = {
    HEALTHY:  'healthy',
    DEGRADED: 'degraded',
    DOWN:     'down',
    UNKNOWN:  'unknown',
};

export const HEALTH_STATUS_OPTIONS = [
    { label: 'Healthy',  value: HEALTH_STATUS.HEALTHY },
    { label: 'Degraded', value: HEALTH_STATUS.DEGRADED },
    { label: 'Down',     value: HEALTH_STATUS.DOWN },
    { label: 'Unknown',  value: HEALTH_STATUS.UNKNOWN },
];

export const HEALTH_STATUS_CONFIG = {
    [HEALTH_STATUS.HEALTHY]:  { color: 'success', label: 'Healthy',  antColor: '#22c55e' },
    [HEALTH_STATUS.DEGRADED]: { color: 'warning', label: 'Degraded', antColor: '#f59e0b' },
    [HEALTH_STATUS.DOWN]:     { color: 'error',   label: 'Down',     antColor: '#ef4444' },
    [HEALTH_STATUS.UNKNOWN]:  { color: 'default', label: 'Unknown',  antColor: '#94a3b8' },
};

export const DEFAULT_PAGE_SIZE = 20;

export const CURRENCY_OPTIONS = [
    { label: 'USD — US Dollar',        value: 'USD' },
    { label: 'EUR — Euro',             value: 'EUR' },
    { label: 'GBP — British Pound',    value: 'GBP' },
    { label: 'CAD — Canadian Dollar',  value: 'CAD' },
    { label: 'AUD — Australian Dollar',value: 'AUD' },
    { label: 'INR — Indian Rupee',     value: 'INR' },
    { label: 'SGD — Singapore Dollar', value: 'SGD' },
    { label: 'AED — UAE Dirham',       value: 'AED' },
];
