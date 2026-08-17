import apiClient from '../axios';
import { API_ROUTES } from '../apiRoutes';

const ROUTES = API_ROUTES.USER_OTPS;

export const userOtpsApi = {
    getAll:  (params) => apiClient.get(ROUTES.LIST, { params }),
    getById: (id)     => apiClient.get(ROUTES.DETAIL(id)),
};
