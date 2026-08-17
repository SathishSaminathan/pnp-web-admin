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
};
