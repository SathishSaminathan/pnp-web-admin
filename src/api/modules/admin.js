import apiClient from '../axios';
import { API_ROUTES } from '../apiRoutes';

const withConfig = (params, config = {}) => ({ params, ...config });

export const adminApi = {
  overview: (config) => apiClient.get(API_ROUTES.ADMIN.OVERVIEW, config),
  users: (params, config) => apiClient.get(API_ROUTES.ADMIN.USERS, withConfig(params, config)),
  user: (id, config) => apiClient.get(API_ROUTES.ADMIN.USER(id), config),
  setUserBlocked: (id, payload) => apiClient.patch(API_ROUTES.ADMIN.USER_BLOCK(id), payload),
  owners: (params, config) => apiClient.get(API_ROUTES.ADMIN.OWNERS, withConfig(params, config)),
  listings: (params, config) => apiClient.get(API_ROUTES.ADMIN.LISTINGS, withConfig(params, config)),
  setListingVerified: (id, payload) => apiClient.patch(API_ROUTES.ADMIN.LISTING_VERIFIED(id), payload),
  bookings: (params, config) => apiClient.get(API_ROUTES.ADMIN.BOOKINGS, withConfig(params, config)),
  earnings: (config) => apiClient.get(API_ROUTES.ADMIN.EARNINGS, config),
  transactions: (params, config) => apiClient.get(API_ROUTES.ADMIN.TRANSACTIONS, withConfig(params, config)),
  reviews: (params, config) => apiClient.get(API_ROUTES.ADMIN.REVIEWS, withConfig(params, config)),
  master: (config) => apiClient.get(API_ROUTES.ADMIN.MASTER, config),
  masterType: (type, params, config) => apiClient.get(API_ROUTES.ADMIN.MASTER_ITEM(type), withConfig(params, config)),
  createMasterItem: (type, payload) => apiClient.post(API_ROUTES.ADMIN.MASTER_ITEM(type), payload),
  updateMasterItem: (type, id, payload) => apiClient.put(API_ROUTES.ADMIN.MASTER_ITEM(type, id), payload),
  deleteMasterItem: (type, id) => apiClient.delete(API_ROUTES.ADMIN.MASTER_ITEM(type, id)),
  pushTemplates: () => apiClient.get(API_ROUTES.ADMIN.PUSH_TEMPLATES),
  sendPush: payload => apiClient.post(API_ROUTES.ADMIN.PUSH_SEND, payload),
};
