import apiClient from '../axios';
import { API_ROUTES } from '../apiRoutes';

const R = API_ROUTES.STATES;

export const statesApi = {
    getAll:     (params)     => apiClient.get(R.LIST, { params }),
    getById:    (id)         => apiClient.get(R.DETAIL(id)),
    create:     (data)       => apiClient.post(R.CREATE, data),
    update:     (id, data)   => apiClient.put(R.UPDATE(id), data),
    softDelete: (id)         => apiClient.delete(R.DELETE(id)),
    restore:    (id)         => apiClient.post(R.RESTORE(id)),
    getCities:  (id, params) => apiClient.get(R.CITIES(id), { params }),
};
