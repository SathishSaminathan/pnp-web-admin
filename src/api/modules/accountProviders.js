import apiClient from '../axios';
import { API_ROUTES } from '../apiRoutes';

export const accountProvidersApi = {
    getAll: (params) =>
        apiClient.get(API_ROUTES.ACCOUNT_PROVIDERS.LIST, { params }),

    getStats: () =>
        apiClient.get(API_ROUTES.ACCOUNT_PROVIDERS.STATS),

    getEligible: (params) =>
        apiClient.get(API_ROUTES.ACCOUNT_PROVIDERS.ELIGIBLE, { params }),

    getByCode: (code) =>
        apiClient.get(API_ROUTES.ACCOUNT_PROVIDERS.BY_CODE(code)),

    getById: (id) =>
        apiClient.get(API_ROUTES.ACCOUNT_PROVIDERS.DETAIL(id)),

    create: (payload) =>
        apiClient.post(API_ROUTES.ACCOUNT_PROVIDERS.LIST, payload),

    update: (id, payload) =>
        apiClient.put(API_ROUTES.ACCOUNT_PROVIDERS.DETAIL(id), payload),

    toggle: (id) =>
        apiClient.patch(API_ROUTES.ACCOUNT_PROVIDERS.TOGGLE(id)),

    updateHealth: (id, healthStatus) =>
        apiClient.patch(API_ROUTES.ACCOUNT_PROVIDERS.HEALTH(id), { healthStatus }),

    addCurrency: (id, currencyCode, isEnabled = true) =>
        apiClient.post(API_ROUTES.ACCOUNT_PROVIDERS.CURRENCIES(id), { currencyCode, isEnabled }),

    removeCurrency: (id, currencyCode) =>
        apiClient.delete(API_ROUTES.ACCOUNT_PROVIDERS.CURRENCY_REMOVE(id, currencyCode)),

    softDelete: (id) =>
        apiClient.delete(API_ROUTES.ACCOUNT_PROVIDERS.DETAIL(id)),

    permanentDelete: (id) =>
        apiClient.delete(API_ROUTES.ACCOUNT_PROVIDERS.PERMANENT_DELETE(id)),
};
