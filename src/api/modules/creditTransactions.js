import apiClient from '../axios';
import { API_ROUTES } from '../apiRoutes';

export const creditTransactionsApi = {
    /**
     * Fetch paginated list of credit transactions.
     * @param {object} params - page, limit, sort, userId, merchantEmail, status,
     *                          paymentMethod, dateFrom, dateTo, minAmount, maxAmount
     */
    getAll: (params) =>
        apiClient.get(API_ROUTES.CREDIT_TRANSACTIONS.LIST, { params }),

    /**
     * Get full detail for a single credit transaction.
     * @param {string} id - Transaction ObjectId
     */
    getById: (id) =>
        apiClient.get(API_ROUTES.CREDIT_TRANSACTIONS.DETAIL(id)),

    /**
     * Approve a credit transaction (status must be Initiated or InProgress).
     * @param {string} id
     * @param {string} [notes]
     */
    approve: (id, notes) =>
        apiClient.patch(API_ROUTES.CREDIT_TRANSACTIONS.APPROVE(id), { notes }),

    /**
     * Reject a credit transaction (status must be Initiated, Approved, or InProgress).
     * @param {string} id
     * @param {string} [reason]
     */
    reject: (id, reason) =>
        apiClient.patch(API_ROUTES.CREDIT_TRANSACTIONS.REJECT(id), { reason }),
};
