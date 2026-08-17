export const DEFAULT_PAGE_SIZE = 20;

export const MPOS_STATUS = {
    PENDING:      'Pending',
    UNDER_REVIEW: 'Under Review',
    APPROVED:     'Approved',
    REJECTED:     'Rejected',
};

export const MPOS_STATUS_CONFIG = {
    Pending:      { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.3)',  label: 'Pending'      },
    'Under Review': { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.3)',  label: 'Under Review' },
    Approved:     { color: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.3)',  label: 'Approved'     },
    Rejected:     { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.3)',   label: 'Rejected'     },
};

export const STATUS_FILTER_OPTIONS = [
    { value: '',             label: 'All Statuses'  },
    { value: 'Pending',      label: 'Pending'       },
    { value: 'Under Review', label: 'Under Review'  },
    { value: 'Approved',     label: 'Approved'      },
    { value: 'Rejected',     label: 'Rejected'      },
];

export const WALLET_TYPE_OPTIONS = [
    { value: '',     label: 'All Wallets' },
    { value: 'USDC', label: 'USDC'        },
    { value: 'EURC', label: 'EURC'        },
];

export const SETTLEMENT_FREQ_OPTIONS = [
    { value: 'Daily',   label: 'Daily'   },
    { value: 'Weekly',  label: 'Weekly'  },
    { value: 'Monthly', label: 'Monthly' },
];

export const SETTLEMENT_MODE_OPTIONS = [
    { value: 'Fiat',   label: 'Fiat'   },
    { value: 'Crypto', label: 'Crypto' },
];
