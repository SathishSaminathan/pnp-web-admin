import apiClient from '../axios';
import { API_ROUTES } from '../apiRoutes';

export const walletsApi = {
    getAll: (params) =>
        apiClient.get(API_ROUTES.WALLETS.LIST, { params }),

    getById: (id) =>
        apiClient.get(API_ROUTES.WALLETS.DETAIL(id)),

    syncBalance: (id) =>
        apiClient.post(API_ROUTES.WALLETS.SYNC_BALANCE(id)),
};
