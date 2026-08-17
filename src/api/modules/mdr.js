import apiClient from '../axios';
import { API_ROUTES } from '../apiRoutes';

export const mdrApi = {
    getAll: (params) =>
        apiClient.get(API_ROUTES.MDR.LIST, { params }),

    getById: (id) =>
        apiClient.get(API_ROUTES.MDR.DETAIL(id)),

    create: (payload) =>
        apiClient.post(API_ROUTES.MDR.CREATE, payload),

    update: (id, payload) =>
        apiClient.patch(API_ROUTES.MDR.UPDATE(id), payload),

    deactivate: (id) =>
        apiClient.delete(API_ROUTES.MDR.DELETE(id)),
};
