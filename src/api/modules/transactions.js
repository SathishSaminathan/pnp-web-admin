import apiClient from '../axios';
import { API_ROUTES } from '../apiRoutes';

const ROUTES = API_ROUTES.ADMIN_TRANSACTIONS;

export const transactionsApi = {
    getAll:   (params) => apiClient.get(ROUTES.LIST, { params }),
    getById:  (id)     => apiClient.get(ROUTES.DETAIL(id)),
    getStats: (params) => apiClient.get(ROUTES.STATS, { params }),
};

