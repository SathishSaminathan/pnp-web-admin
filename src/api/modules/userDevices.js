import apiClient from '../axios';
import { API_ROUTES } from '../apiRoutes';

const ROUTES = API_ROUTES.USER_DEVICES;

// User Devices API Endpoints

export const userDevicesApi = {
    getAll:      (params) => apiClient.get(ROUTES.LIST, { params }),
    getById:     (id)     => apiClient.get(ROUTES.DETAIL(id)),
    activate:    (id)     => apiClient.patch(ROUTES.ACTIVATE(id)),
    deactivate:  (id)     => apiClient.patch(ROUTES.DEACTIVATE(id)),
    verify:      (id)     => apiClient.patch(ROUTES.VERIFY(id)),
    unverify:    (id)     => apiClient.patch(ROUTES.UNVERIFY(id)),
    softDelete:  (id)     => apiClient.delete(ROUTES.DELETE(id)),
};
