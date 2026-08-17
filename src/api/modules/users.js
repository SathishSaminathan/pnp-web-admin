import apiClient from '../axios';
import { API_ROUTES } from '../apiRoutes';

export const usersApi = {
    getAllUsers: async (params) => {
        return apiClient.get(API_ROUTES.USERS.LIST, { params });
    },
    getUserById: async (id) => {
        return apiClient.get(API_ROUTES.USERS.DETAIL(id));
    },
    updateDocumentStatus: async ({ userId, documentId, status }) => {
        return apiClient.put(API_ROUTES.USERS.DOCUMENT_STATUS, { userId, documentId, status });
    },
};
