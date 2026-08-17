import apiClient from '../axios';
import { API_ROUTES } from '../apiRoutes';

export const adminApi = {
  overview: () => apiClient.get(API_ROUTES.ADMIN.OVERVIEW),
  users: (params) => apiClient.get(API_ROUTES.ADMIN.USERS, { params }),
  user: (id) => apiClient.get(API_ROUTES.ADMIN.USER(id)),
  owners: (params) => apiClient.get(API_ROUTES.ADMIN.OWNERS, { params }),
  listings: () => apiClient.get(API_ROUTES.ADMIN.LISTINGS),
  bookings: (params) => apiClient.get(API_ROUTES.ADMIN.BOOKINGS, { params }),
  earnings: () => apiClient.get(API_ROUTES.ADMIN.EARNINGS),
  transactions: () => apiClient.get(API_ROUTES.ADMIN.TRANSACTIONS),
  reviews: () => apiClient.get(API_ROUTES.ADMIN.REVIEWS),
  master: () => apiClient.get(API_ROUTES.ADMIN.MASTER),
  createMasterItem: (type, payload) => apiClient.post(API_ROUTES.ADMIN.MASTER_ITEM(type), payload),
  updateMasterItem: (type, id, payload) => apiClient.put(API_ROUTES.ADMIN.MASTER_ITEM(type, id), payload),
  deleteMasterItem: (type, id) => apiClient.delete(API_ROUTES.ADMIN.MASTER_ITEM(type, id)),
};
