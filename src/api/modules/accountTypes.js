import apiClient from '../axios';
import { API_ROUTES } from '../apiRoutes';

export const accountTypesApi = {
    getAll: async (params) => {
        return apiClient.get(API_ROUTES.ACCOUNT_TYPES.LIST, { params });
    },
};
