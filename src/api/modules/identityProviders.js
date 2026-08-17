import apiClient from '../axios';
import { API_ROUTES } from '../apiRoutes';

export const identityProvidersApi = {
    getAll: async (params) => {
        return apiClient.get(API_ROUTES.IDENTITY_PROVIDERS.LIST, { params });
    },
    getById: async (id) => {
        return apiClient.get(API_ROUTES.IDENTITY_PROVIDERS.DETAIL(id));
    },
    create: async (data) => {
        return apiClient.post(API_ROUTES.IDENTITY_PROVIDERS.CREATE, data);
    },
    update: async (id, data) => {
        return apiClient.patch(API_ROUTES.IDENTITY_PROVIDERS.UPDATE(id), data);
    },
    rotateApiKey: async (id, apiKey) => {
        return apiClient.patch(API_ROUTES.IDENTITY_PROVIDERS.UPDATE(id), { apiKey });
    },
    delete: async (id) => {
        return apiClient.delete(API_ROUTES.IDENTITY_PROVIDERS.DELETE(id));
    },
    updateHealth: async (id, data) => {
        return apiClient.patch(API_ROUTES.IDENTITY_PROVIDERS.HEALTH(id), data);
    },
};
