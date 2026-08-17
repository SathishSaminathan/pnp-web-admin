import apiClient from '../axios';
import { API_ROUTES } from '../apiRoutes';

export const currencyApi = {
    getAll: (params) =>
        apiClient.get(API_ROUTES.CURRENCY.LIST, { params }),

    getById: (id) =>
        apiClient.get(API_ROUTES.CURRENCY.DETAIL(id)),

    create: (payload) =>
        apiClient.post(API_ROUTES.CURRENCY.CREATE, payload),

    update: (id, payload) =>
        apiClient.patch(API_ROUTES.CURRENCY.UPDATE(id), payload),

    delete: (id) =>
        apiClient.delete(API_ROUTES.CURRENCY.DELETE(id)),

    bulkUpsert: (payload) =>
        apiClient.post(API_ROUTES.CURRENCY.BULK, payload),
};

export const exchangeRatesApi = {
    getAll: (params) =>
        apiClient.get(API_ROUTES.EXCHANGE_RATES.LIST, { params }),

    getById: (id) =>
        apiClient.get(API_ROUTES.EXCHANGE_RATES.DETAIL(id)),

    create: (payload) =>
        apiClient.post(API_ROUTES.EXCHANGE_RATES.CREATE, payload),

    update: (id, payload) =>
        apiClient.patch(API_ROUTES.EXCHANGE_RATES.UPDATE(id), payload),

    remove: (id) =>
        apiClient.delete(API_ROUTES.EXCHANGE_RATES.DELETE(id)),
};
