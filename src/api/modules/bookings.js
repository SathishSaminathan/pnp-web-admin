import apiClient from '../axios';
import { API_ROUTES } from '../apiRoutes';

const ROUTES = API_ROUTES.BOOKINGS;

/**
 * Booking List API — GET /booking
 *
 * Query params (per Meralot docs):
 *   userId, spaceProviderId, date, fromDate, toDate,
 *   status (comma-separated), offset, limit
 */
export const bookingsApi = {
    getAll: (params) => apiClient.get(ROUTES.LIST, { params }),

    getById: (id) => apiClient.get(ROUTES.DETAIL(id)),
};
