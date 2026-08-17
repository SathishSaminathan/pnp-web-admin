import apiClient from '../axios';
import { API_ROUTES } from '../apiRoutes';

export const noahCustodyWalletsApi = {
    getAll: (params) =>
        apiClient.get(API_ROUTES.NOAH_CUSTODY_WALLETS.LIST, { params }),

    getById: (id) =>
        apiClient.get(API_ROUTES.NOAH_CUSTODY_WALLETS.DETAIL(id)),

    syncBalance: (id) =>
        apiClient.post(API_ROUTES.NOAH_CUSTODY_WALLETS.SYNC_BALANCE(id)),
};
