import apiClient from '../axios';
import { API_ROUTES } from '../apiRoutes';

const ROUTES = API_ROUTES.USER_SESSIONS;

export const userSessionsApi = {
    getAll:        (params)           => apiClient.get(ROUTES.LIST, { params }),
    getById:       (id)               => apiClient.get(ROUTES.DETAIL(id)),
    terminate:     (id)               => apiClient.delete(ROUTES.TERMINATE(id)),
    terminateAll:  (userId, reason)   => apiClient.post(ROUTES.TERMINATE_ALL, { userId, reason }),
};
