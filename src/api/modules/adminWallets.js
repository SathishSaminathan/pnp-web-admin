import apiClient from '../axios';
import { API_ROUTES } from '../apiRoutes';

export const adminWalletsApi = {
    getAll: (params) =>
        apiClient.get(API_ROUTES.ADMIN_WALLETS.LIST, { params }),

    getById: (id) =>
        apiClient.get(API_ROUTES.ADMIN_WALLETS.DETAIL(id)),

    getBalanceSummary: (params) =>
        apiClient.get(API_ROUTES.ADMIN_WALLETS.BALANCE_SUMMARY, { params }),

    syncBalance: (id) =>
        apiClient.post(API_ROUTES.ADMIN_WALLETS.SYNC_BALANCE(id)),
};
