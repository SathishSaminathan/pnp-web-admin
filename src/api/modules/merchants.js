import apiClient from '../axios';
import { API_ROUTES } from '../apiRoutes';

export const merchantsApi = {
    getAllMerchants: async (params) => {
        return apiClient.get(API_ROUTES.MERCHANTS.LIST, { params });
    },
    getMerchantById: async (id) => {
        return apiClient.get(API_ROUTES.MERCHANTS.DETAIL(id));
    },
};
