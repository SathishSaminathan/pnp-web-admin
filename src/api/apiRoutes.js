// Mirrors the pattern from meralot-merchants-epos-fend/src/lib/apiRoutes.tsx
// VITE_API_BASE_URL is set in .env.local for dev and in the CI/CD environment for production.
const API_BASE = import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL}`
    : '/api';

export const API_ROUTES = {
    BASE_URL: API_BASE,

    AUTH: {
        LOGIN:               `${API_BASE}/authentication/admin/login`,
        REGISTER:            `${API_BASE}/admin-auth/register`,
        VERIFY_MFA:          `${API_BASE}/admin-auth/verify-mfa`,
        LOGOUT:              `${API_BASE}/admin-auth/logout`,
        LOGOUT_ALL:          `${API_BASE}/admin-auth/logout-all`,
        CHANGE_PASSWORD:     `${API_BASE}/admin-auth/change-password`,
        FORGOT_PASSWORD:     `${API_BASE}/admin-auth/forgot-password`,
        FORGOT_PASSWORD_VERIFY_MFA: `${API_BASE}/admin-auth/forgot-password/verify-mfa`,
        VERIFY_RESET_TOKEN:  (token) => `${API_BASE}/admin-auth/reset-password/${token}`,
        RESET_PASSWORD:      `${API_BASE}/admin-auth/reset-password`,
        MFA_SETUP:           `${API_BASE}/admin-auth/mfa/setup`,
        MFA_VERIFY_SETUP:    `${API_BASE}/admin-auth/mfa/verify-setup`,
        MFA_DISABLE:         `${API_BASE}/admin-auth/mfa/disable`,
        MFA_BACKUP_CODES:    `${API_BASE}/admin-auth/mfa/backup-codes`,
        MFA_SEND_OTP:        `${API_BASE}/admin-auth/mfa/send-otp`,
        SESSIONS:            `${API_BASE}/admin-auth/sessions`,
        VALIDATE_SESSION:    `${API_BASE}/admin-auth/sessions/validate`,
        INVALIDATE_SESSION:  (id) => `${API_BASE}/admin-auth/sessions/${id}`,
        PROFILE:             `${API_BASE}/admin-auth/profile`,
        USER_PROFILE:        (id) => `${API_BASE}/authentication/user/${id}`,
    },

    MERCHANTS: {
        LIST:   `${API_BASE}/merchants`,
        DETAIL: (id) => `${API_BASE}/merchants/${id}`,
    },

    USERS: {
        LIST:            `${API_BASE}/authentication/user`,
        DETAIL:          (id) => `${API_BASE}/authentication/user/${id}`,
        DOCUMENT_STATUS: `${API_BASE}/authentication/document/status`,
    },

    STORAGE: {
        DOCUMENT_URL: `${API_BASE}/storage/document-url`,
    },

    DASHBOARD: {
        STATISTICS:     `${API_BASE}/account-requests/dashboard/statistics`,
        RECENT_ACTIVITY:`${API_BASE}/account-requests/pending`,
    },

    TRANSACTIONS: {
        LIST: `${API_BASE}/transactions`,
    },

    ADMIN_TRANSACTIONS: {
        LIST:   `${API_BASE}/admin/transactions`,
        DETAIL: (id) => `${API_BASE}/admin/transactions/${id}`,
        STATS:  `${API_BASE}/admin/transactions/stats`,
    },

    PROVIDERS: {
        LIST: `${API_BASE}/providers`,
    },

    REQUESTS: {
        LIST:            `${API_BASE}/account-requests`,
        DETAIL:          (id) => `${API_BASE}/account-requests/${id}`,
        APPROVE:         (id) => `${API_BASE}/account-requests/${id}/approve`,
        REJECT:          (id) => `${API_BASE}/account-requests/${id}/reject`,
        CANCEL:          (id) => `${API_BASE}/account-requests/${id}/cancel`,
        ASSIGN_PROVIDER:     (id) => `${API_BASE}/account-requests/${id}/assign-provider`,
        PROCESS:            (id) => `${API_BASE}/account-requests/${id}/process`,
        REQUEST_DOCUMENTS:  (id) => `${API_BASE}/account-requests/${id}/request-documents`,
        EDIT_DOCUMENT:      (requestId, docId) => `${API_BASE}/account-requests/${requestId}/documents/${docId}`,
        DELETE_DOCUMENT:    (requestId, docId) => `${API_BASE}/account-requests/${requestId}/documents/${docId}`,
        REVIEW_DOCUMENT:    (requestId, docId) => `${API_BASE}/account-requests/${requestId}/documents/${docId}/review`,
    },

    ACCOUNT_PROVIDERS: {
        LIST:              `${API_BASE}/account-providers`,
        STATS:             `${API_BASE}/account-providers/stats`,
        ELIGIBLE:          `${API_BASE}/account-providers/eligible`,
        BY_CODE:           (code) => `${API_BASE}/account-providers/code/${code}`,
        DETAIL:            (id) => `${API_BASE}/account-providers/${id}`,
        TOGGLE:            (id) => `${API_BASE}/account-providers/${id}/toggle`,
        HEALTH:            (id) => `${API_BASE}/account-providers/${id}/health`,
        CURRENCIES:        (id) => `${API_BASE}/account-providers/${id}/currencies`,
        CURRENCY_REMOVE:   (id, code) => `${API_BASE}/account-providers/${id}/currencies/${code}`,
        PERMANENT_DELETE:  (id) => `${API_BASE}/account-providers/${id}/permanent`,
    },

    IDENTITY_PROVIDERS: {
        LIST:       `${API_BASE}/admin/identity-providers`,
        CREATE:     `${API_BASE}/admin/identity-providers`,
        DETAIL:     (id) => `${API_BASE}/admin/identity-providers/${id}`,
        UPDATE:     (id) => `${API_BASE}/admin/identity-providers/${id}`,
        DELETE:     (id) => `${API_BASE}/admin/identity-providers/${id}`,
        HEALTH:     (id) => `${API_BASE}/admin/identity-providers/${id}/health`,
    },
    KYC: {
        LIST:          `${API_BASE}/merchants`,           // reuse merchants list with KYC fields
        GET_STATUS:    (userId) => `${API_BASE}/kyc/status?userId=${userId}`,
        UPDATE_STATUS: `${API_BASE}/kyc/update-status`,
        INQUIRY_INFO:  (inquiryId) => `${API_BASE}/kyc/getInquiryInfo?inquiryId=${inquiryId}`,
    },

    MPOS: {
        LIST:          `${API_BASE}/admin/mpos/requests`,
        DETAIL:        (id) => `${API_BASE}/admin/mpos/${id}`,
        REVIEW:        (id) => `${API_BASE}/admin/mpos/${id}/review`,
        APPROVE:       (id) => `${API_BASE}/admin/mpos/${id}/approve`,
        REJECT:        (id) => `${API_BASE}/admin/mpos/${id}/reject`,
        RETRY_WALLET:  (id) => `${API_BASE}/admin/mpos/${id}/retry-wallet`,
    },

    ACCOUNT_TYPES: {
        LIST: `${API_BASE}/admin/account-types`,
    },

    MDR: {
        LIST:   `${API_BASE}/admin/mdr`,
        CREATE: `${API_BASE}/admin/mdr`,
        DETAIL: (id) => `${API_BASE}/admin/mdr/${id}`,
        UPDATE: (id) => `${API_BASE}/admin/mdr/${id}`,
        DELETE: (id) => `${API_BASE}/admin/mdr/${id}`,
    },

    VIRTUAL_ACCOUNTS: {
        LIST:                  `${API_BASE}/admin/virtual-accounts`,
        DETAIL:                (id) => `${API_BASE}/admin/virtual-accounts/${id}`,
        FREEZE:                (id) => `${API_BASE}/admin/virtual-accounts/${id}/freeze`,
        UNFREEZE:              (id) => `${API_BASE}/admin/virtual-accounts/${id}/unfreeze`,
        CLOSE:                 (id) => `${API_BASE}/admin/virtual-accounts/${id}`,
        SIMULATE_FIAT_DEPOSIT: `${API_BASE}/admin/noah/simulate-fiat-deposit`,
    },

    WALLETS: {
        LIST:         `${API_BASE}/admin/wallets`,
        DETAIL:       (id) => `${API_BASE}/admin/wallets/${id}`,
        SYNC_BALANCE: (id) => `${API_BASE}/admin/wallets/${id}/sync-balance`,
    },

    BENEFICIARIES: {
        LIST:   `${API_BASE}/admin/beneficiaries`,
        STATS:  `${API_BASE}/admin/beneficiaries/stats`,
        DETAIL: (id) => `${API_BASE}/admin/beneficiaries/${id}`,
        TOGGLE: (id) => `${API_BASE}/admin/beneficiaries/${id}/toggle`,
    },

    LINKED_BANK_ACCOUNTS: {
        LIST:    `${API_BASE}/admin/linked-bank-accounts`,
        DETAIL:  (id) => `${API_BASE}/admin/linked-bank-accounts/${id}`,
        APPROVE: (id) => `${API_BASE}/admin/linked-bank-accounts/${id}/approve`,
    },

    LINKED_WALLETS: {
        LIST:   `${API_BASE}/admin/linked-wallets`,
        DETAIL: (id) => `${API_BASE}/admin/linked-wallets/${id}`,
        TOGGLE: (id) => `${API_BASE}/admin/linked-wallets/${id}/toggle`,
    },

    CURRENCY: {
        LIST:   `${API_BASE}/admin/currencies`,
        DETAIL: (id) => `${API_BASE}/admin/currencies/${id}`,
        CREATE: `${API_BASE}/admin/currencies`,
        UPDATE: (id) => `${API_BASE}/admin/currencies/${id}`,
        DELETE: (id) => `${API_BASE}/admin/currencies/${id}`,
        BULK:   `${API_BASE}/admin/currencies/bulk`,
    },

    EXCHANGE_RATES: {
        LIST:   `${API_BASE}/admin/exchange-rates`,
        DETAIL: (id) => `${API_BASE}/admin/exchange-rates/${id}`,
        CREATE: `${API_BASE}/admin/exchange-rates`,
        UPDATE: (id) => `${API_BASE}/admin/exchange-rates/${id}`,
        DELETE: (id) => `${API_BASE}/admin/exchange-rates/${id}`,
    },

    CREDIT_TRANSACTIONS: {
        LIST:    `${API_BASE}/admin/credit-transactions`,
        DETAIL:  (id) => `${API_BASE}/admin/credit-transactions/${id}`,
        APPROVE: (id) => `${API_BASE}/admin/credit-transactions/${id}/approve`,
        REJECT:  (id) => `${API_BASE}/admin/credit-transactions/${id}/reject`,
    },

    COUNTRIES: {
        LIST:    `${API_BASE}/admin/countries`,
        DETAIL:  (id) => `${API_BASE}/admin/countries/${id}`,
        CREATE:  `${API_BASE}/admin/countries`,
        UPDATE:  (id) => `${API_BASE}/admin/countries/${id}`,
        DELETE:  (id) => `${API_BASE}/admin/countries/${id}`,
        RESTORE: (id) => `${API_BASE}/admin/countries/${id}/restore`,
        STATES:  (id) => `${API_BASE}/admin/countries/${id}/states`,
        CITIES:  (id) => `${API_BASE}/admin/countries/${id}/cities`,
    },

    STATES: {
        LIST:    `${API_BASE}/admin/states`,
        DETAIL:  (id) => `${API_BASE}/admin/states/${id}`,
        CREATE:  `${API_BASE}/admin/states`,
        UPDATE:  (id) => `${API_BASE}/admin/states/${id}`,
        DELETE:  (id) => `${API_BASE}/admin/states/${id}`,
        RESTORE: (id) => `${API_BASE}/admin/states/${id}/restore`,
        CITIES:  (id) => `${API_BASE}/admin/states/${id}/cities`,
    },

    CITIES: {
        LIST:    `${API_BASE}/admin/cities`,
        DETAIL:  (id) => `${API_BASE}/admin/cities/${id}`,
        CREATE:  `${API_BASE}/admin/cities`,
        UPDATE:  (id) => `${API_BASE}/admin/cities/${id}`,
        DELETE:  (id) => `${API_BASE}/admin/cities/${id}`,
        RESTORE: (id) => `${API_BASE}/admin/cities/${id}/restore`,
    },

    ADMIN_WALLETS: {
        LIST:            `${API_BASE}/admin/admin-wallets`,
        DETAIL:          (id) => `${API_BASE}/admin/admin-wallets/${id}`,
        BALANCE_SUMMARY: `${API_BASE}/admin/admin-wallets/balance-summary`,
        SYNC_BALANCE:    (id) => `${API_BASE}/admin/admin-wallets/${id}/sync-balance`,
    },

    NOAH_CUSTODY_WALLETS: {
        LIST:         `${API_BASE}/admin/noah-custody-wallets`,
        DETAIL:       (id) => `${API_BASE}/admin/noah-custody-wallets/${id}`,
        SYNC_BALANCE: (id) => `${API_BASE}/admin/noah-custody-wallets/${id}/sync-balance`,
    },

    USER_SESSIONS: {
        LIST:           `${API_BASE}/admin/sessions`,
        DETAIL:         (id) => `${API_BASE}/admin/sessions/${id}`,
        TERMINATE:      (id) => `${API_BASE}/admin/sessions/${id}`,
        TERMINATE_ALL:  `${API_BASE}/admin/sessions/terminate-all`,
    },

    USER_DEVICES: {
        LIST:       `${API_BASE}/admin/devices`,
        DETAIL:     (id) => `${API_BASE}/admin/devices/${id}`,
        ACTIVATE:   (id) => `${API_BASE}/admin/devices/${id}/activate`,
        DEACTIVATE: (id) => `${API_BASE}/admin/devices/${id}/deactivate`,
        VERIFY:     (id) => `${API_BASE}/admin/devices/${id}/verify`,
        UNVERIFY:   (id) => `${API_BASE}/admin/devices/${id}/unverify`,
        DELETE:     (id) => `${API_BASE}/admin/devices/${id}`,
    },

    USER_OTPS: {
        LIST:   `${API_BASE}/admin/otps`,
        DETAIL: (id) => `${API_BASE}/admin/otps/${id}`,
    },

    BOOKINGS: {
        LIST:   `${API_BASE}/booking`,
        DETAIL: (id) => `${API_BASE}/booking/${id}`,
    },
};
