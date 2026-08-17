const API_BASE = import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL}`
    : '/api';

export const API_ROUTES = {
    BASE_URL: API_BASE,

    AUTH: {
        LOGIN: `${API_BASE}/admin/login`,
        PROFILE: `${API_BASE}/admin/me`,
        USER_PROFILE: () => `${API_BASE}/admin/me`,
        LOGOUT: `${API_BASE}/admin/me`,
        VERIFY_MFA: `${API_BASE}/admin/login`,
        REGISTER: `${API_BASE}/admin/login`,
        LOGOUT_ALL: `${API_BASE}/admin/me`,
        CHANGE_PASSWORD: `${API_BASE}/admin/me`,
        FORGOT_PASSWORD: `${API_BASE}/admin/login`,
        FORGOT_PASSWORD_VERIFY_MFA: `${API_BASE}/admin/login`,
        VERIFY_RESET_TOKEN: () => `${API_BASE}/admin/me`,
        RESET_PASSWORD: `${API_BASE}/admin/login`,
        MFA_SETUP: `${API_BASE}/admin/me`,
        MFA_VERIFY_SETUP: `${API_BASE}/admin/me`,
        MFA_DISABLE: `${API_BASE}/admin/me`,
        MFA_BACKUP_CODES: `${API_BASE}/admin/me`,
        MFA_SEND_OTP: `${API_BASE}/admin/me`,
        SESSIONS: `${API_BASE}/admin/me`,
        VALIDATE_SESSION: `${API_BASE}/admin/me`,
        INVALIDATE_SESSION: () => `${API_BASE}/admin/me`,
    },

    ADMIN: {
        OVERVIEW: `${API_BASE}/admin/overview`,
        USERS: `${API_BASE}/admin/users`,
        USER: (id) => `${API_BASE}/admin/users/${id}`,
        USER_BLOCK: (id) => `${API_BASE}/admin/users/${id}/block`,
        OWNERS: `${API_BASE}/admin/owners`,
        LISTINGS: `${API_BASE}/admin/listings`,
        BOOKINGS: `${API_BASE}/admin/bookings`,
        EARNINGS: `${API_BASE}/admin/earnings`,
        TRANSACTIONS: `${API_BASE}/admin/transactions`,
        REVIEWS: `${API_BASE}/admin/reviews`,
        MASTER: `${API_BASE}/admin/master`,
        MASTER_ITEM: (type, id) => `${API_BASE}/admin/master/${type}${id ? `/${id}` : ''}`,
    },
};
