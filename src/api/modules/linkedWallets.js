import apiClient from '../axios';
import { API_ROUTES } from '../apiRoutes';

export const linkedWalletsApi = {
    getAll: (params) =>
        apiClient.get(API_ROUTES.LINKED_WALLETS.LIST, { params }),

    getById: (id) =>
        apiClient.get(API_ROUTES.LINKED_WALLETS.DETAIL(id)),

    toggle: (id, payload) =>
        apiClient.patch(API_ROUTES.LINKED_WALLETS.TOGGLE(id), payload),
};
