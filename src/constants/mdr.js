export const DEFAULT_PAGE_SIZE = 20;

export const MDR_SCOPE = {
    GLOBAL:   'Global',
    MERCHANT: 'Merchant',
};

export const MDR_RATE_TYPE = {
    PERCENTAGE: 'Percentage',
    FLAT:       'Flat',
    TIERED:     'Tiered',
};

export const SCOPE_OPTIONS = [
    { value: '',         label: 'All Scopes' },
    { value: 'Global',   label: 'Global'     },
    { value: 'Merchant', label: 'Merchant'   },
];

export const RATE_TYPE_OPTIONS = [
    { value: 'Percentage', label: 'Percentage (%)' },
    { value: 'Flat',       label: 'Flat Fee ($)'   },
    { value: 'Tiered',     label: 'Tiered'         },
];

export const WALLET_TYPE_OPTIONS = [
    { value: '',     label: 'All Wallets' },
    { value: 'USDC', label: 'USDC'        },
    { value: 'EURC', label: 'EURC'        },
];

export const BLOCKCHAIN_OPTIONS = [
    { value: 'All',      label: 'All'      },
    { value: 'Ethereum', label: 'Ethereum' },
    { value: 'Polygon',  label: 'Polygon'  },
    { value: 'Solana',   label: 'Solana'   },
];

export const SCOPE_CONFIG = {
    Global:   { color: '#6366f1', bg: 'rgba(99,102,241,0.1)',  border: 'rgba(99,102,241,0.3)'  },
    Merchant: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)'  },
};

export const RATE_TYPE_CONFIG = {
    Percentage: { color: '#10b981', label: 'Percentage' },
    Flat:       { color: '#3b82f6', label: 'Flat Fee'   },
    Tiered:     { color: '#8b5cf6', label: 'Tiered'     },
};
