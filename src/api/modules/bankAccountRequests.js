import apiClient from '../axios';
import { API_ROUTES } from '../apiRoutes';

export const bankAccountRequestsApi = {
    getAll: async (params) => {
        return apiClient.get(API_ROUTES.REQUESTS.LIST, { params });
    },

    getById: async (id) => {
        return apiClient.get(API_ROUTES.REQUESTS.DETAIL(id));
    },

    approve: async (id, notes) => {
        return apiClient.post(API_ROUTES.REQUESTS.APPROVE(id), { notes });
    },

    reject: async (id, reason) => {
        return apiClient.post(API_ROUTES.REQUESTS.REJECT(id), { reason });
    },

    cancel: async (id, reason) => {
        return apiClient.post(API_ROUTES.REQUESTS.CANCEL(id), { reason });
    },

    assignProvider: async (id, providerId) => {
        return apiClient.post(API_ROUTES.REQUESTS.ASSIGN_PROVIDER(id), { providerId });
    },

    process: async (id) => {
        return apiClient.post(API_ROUTES.REQUESTS.PROCESS(id));
    },

    requestDocuments: async (id, documents, message) => {
        return apiClient.post(API_ROUTES.REQUESTS.REQUEST_DOCUMENTS(id), { documents, message });
    },

    editDocument: async (requestId, docId, data) => {
        return apiClient.put(API_ROUTES.REQUESTS.EDIT_DOCUMENT(requestId, docId), data);
    },

    deleteDocument: async (requestId, docId, reason) => {
        return apiClient.delete(API_ROUTES.REQUESTS.DELETE_DOCUMENT(requestId, docId), { data: { reason } });
    },

    reviewDocument: async (requestId, docId, status, notes) => {
        const payload = status === 'rejected' ? { status, reason: notes } : { status, notes };
        return apiClient.post(API_ROUTES.REQUESTS.REVIEW_DOCUMENT(requestId, docId), payload);
    },

    getEligibleProviders: async (currencyCode, isUsUser) => {
        return apiClient.get(API_ROUTES.ACCOUNT_PROVIDERS.ELIGIBLE, {
            params: { currencyCode, isUsUser },
        });
    },
};
