import apiClient from "../axios";
import { API_ROUTES } from "../apiRoutes";

export const kycApi = {
  /**
   * Fetch all merchants (with KYC status fields) for the KYC management table.
   * @param {object} params - { page, limit, search, kycStatus, accountType }
   */
  getAllMerchantsKyc: async (params, config) => {
    return apiClient.get(API_ROUTES.KYC.LIST, { params, ...config });
  },

  /**
   * Get the full KYC status for a specific merchant.
   * @param {string} userId - Merchant's userId
   */
  getKycStatus: async (userId) => {
    return apiClient.get(API_ROUTES.KYC.GET_STATUS(userId));
  },

  /**
   * Update KYC status fields for a merchant.
   * @param {string} userId
   * @param {object} kycStatus - Partial or full KYC status payload (see KYC_REQUEST_SAMPLES.md)
   */
  updateKycStatus: async (userId, kycStatus) => {
    return apiClient.put(API_ROUTES.KYC.UPDATE_STATUS, { userId, kycStatus });
  },

  getInquiryInfo: async (inquiryId) => {
    return apiClient.get(API_ROUTES.KYC.INQUIRY_INFO(inquiryId));
  },
};
