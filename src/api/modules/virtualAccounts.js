import apiClient from '../axios';
import { API_ROUTES } from '../apiRoutes';

export const virtualAccountsApi = {
    getAll: (params) =>
        apiClient.get(API_ROUTES.VIRTUAL_ACCOUNTS.LIST, { params }),

    getById: (id) =>
        apiClient.get(API_ROUTES.VIRTUAL_ACCOUNTS.DETAIL(id)),

    freeze: (id, payload) =>
        apiClient.patch(API_ROUTES.VIRTUAL_ACCOUNTS.FREEZE(id), payload),

    unfreeze: (id, payload) =>
        apiClient.patch(API_ROUTES.VIRTUAL_ACCOUNTS.UNFREEZE(id), payload),

    close: (id, payload) =>
        apiClient.delete(API_ROUTES.VIRTUAL_ACCOUNTS.CLOSE(id), { data: payload }),

    simulateFiatDeposit: (payload) =>
        apiClient.post(API_ROUTES.VIRTUAL_ACCOUNTS.SIMULATE_FIAT_DEPOSIT, payload),
};
