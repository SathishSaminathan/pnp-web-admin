import apiClient from '../axios';
import { API_ROUTES } from '../apiRoutes';

export const linkedBankAccountsApi = {
    getAll: (params) =>
        apiClient.get(API_ROUTES.LINKED_BANK_ACCOUNTS.LIST, { params }),

    getById: (id) =>
        apiClient.get(API_ROUTES.LINKED_BANK_ACCOUNTS.DETAIL(id)),

    approve: (id, payload) =>
        apiClient.patch(API_ROUTES.LINKED_BANK_ACCOUNTS.APPROVE(id), payload),
};
