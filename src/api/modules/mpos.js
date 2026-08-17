import apiClient from '../axios';
import { API_ROUTES } from '../apiRoutes';

export const mposApi = {
    getAll: (params) =>
        apiClient.get(API_ROUTES.MPOS.LIST, { params }),

    getById: (id) =>
        apiClient.get(API_ROUTES.MPOS.DETAIL(id)),

    markUnderReview: (id, payload) =>
        apiClient.patch(API_ROUTES.MPOS.REVIEW(id), payload),

    approve: (id, payload) =>
        apiClient.patch(API_ROUTES.MPOS.APPROVE(id), payload),

    reject: (id, payload) =>
        apiClient.patch(API_ROUTES.MPOS.REJECT(id), payload),

    retryWallet: (id) =>
        apiClient.post(API_ROUTES.MPOS.RETRY_WALLET(id)),
};
