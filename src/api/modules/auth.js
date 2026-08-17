import apiClient from '../axios';
import { API_ROUTES } from '../apiRoutes';

const authApi = {
    // === Authentication ===

    login: async (credentials) => {
        return apiClient.post(API_ROUTES.AUTH.LOGIN, credentials);
    },

    register: async (adminData) => {
        return apiClient.post(API_ROUTES.AUTH.REGISTER, adminData);
    },

    verifyMfa: async (userId, mfaCode) => {
        return apiClient.post(API_ROUTES.AUTH.VERIFY_MFA, { userId, mfaCode });
    },

    logout: async () => {
        return apiClient.post(API_ROUTES.AUTH.LOGOUT);
    },

    logoutAll: async () => {
        return apiClient.post(API_ROUTES.AUTH.LOGOUT_ALL);
    },

    getProfile: async () => {
        // skipErrorToast prevents the axios interceptor from showing a 403 toast
        // during the initial session check on page load (stale cookie scenario)
        return apiClient.get(API_ROUTES.AUTH.PROFILE, { skipErrorToast: true });
    },

    getUserProfile: async (userId) => {
        return apiClient.get(API_ROUTES.AUTH.USER_PROFILE(userId), {
            skipErrorToast: true,
        });
    },

    // === Password Management ===

    changePassword: async (data) => {
        return apiClient.put(API_ROUTES.AUTH.CHANGE_PASSWORD, data);
    },

    forgotPassword: async (emailId) => {
        return apiClient.post(API_ROUTES.AUTH.FORGOT_PASSWORD, { emailId });
    },

    forgotPasswordVerifyMfa: async (userId, mfaCode) => {
        return apiClient.post(API_ROUTES.AUTH.FORGOT_PASSWORD_VERIFY_MFA, { userId, mfaCode });
    },

    verifyResetToken: async (token) => {
        return apiClient.get(API_ROUTES.AUTH.VERIFY_RESET_TOKEN(token));
    },

    resetPassword: async (data) => {
        return apiClient.post(API_ROUTES.AUTH.RESET_PASSWORD, data);
    },

    // === MFA Management ===

    setupMfa: async () => {
        return apiClient.post(API_ROUTES.AUTH.MFA_SETUP, { method: 'totp' });
    },

    verifyMfaSetup: async (verificationCode) => {
        return apiClient.post(API_ROUTES.AUTH.MFA_VERIFY_SETUP, { verificationCode });
    },

    disableMfa: async (password) => {
        return apiClient.delete(API_ROUTES.AUTH.MFA_DISABLE, { data: { password } });
    },

    regenerateBackupCodes: async (password) => {
        return apiClient.post(API_ROUTES.AUTH.MFA_BACKUP_CODES, { password });
    },

    sendMfaOtp: async (userId) => {
        return apiClient.post(API_ROUTES.AUTH.MFA_SEND_OTP, { userId });
    },

    // === Session Management ===

    getActiveSessions: async () => {
        return apiClient.get(API_ROUTES.AUTH.SESSIONS);
    },

    validateSession: async (sessionToken) => {
        return apiClient.post(API_ROUTES.AUTH.VALIDATE_SESSION, { sessionToken });
    },

    invalidateSession: async (sessionId) => {
        return apiClient.delete(API_ROUTES.AUTH.INVALIDATE_SESSION(sessionId));
    },
};

export default authApi;
