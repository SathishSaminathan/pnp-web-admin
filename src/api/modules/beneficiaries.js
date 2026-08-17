import apiClient from '../axios';
import { API_ROUTES } from '../apiRoutes';

export const beneficiariesApi = {
    getAll: (params) =>
        apiClient.get(API_ROUTES.BENEFICIARIES.LIST, { params }),

    getStats: () =>
        apiClient.get(API_ROUTES.BENEFICIARIES.STATS),

    getById: (id) =>
        apiClient.get(API_ROUTES.BENEFICIARIES.DETAIL(id)),

    toggle: (id, payload) =>
        apiClient.patch(API_ROUTES.BENEFICIARIES.TOGGLE(id), payload),
};
