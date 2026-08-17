/* eslint-disable no-unused-vars */
import apiClient from "../axios";
import logger from "../../services/logger";

const dashboardApi = {
  /**
   * Get dashboard statistics from the account requests module
   */
  getStatistics: async () => {
    // MOCK DEV PREVIEW
    logger.debug(
      "MOCK STATS: Bypassing real stats due to missing backend setup in dev environment.",
    );
    return new Promise((resolve) =>
      setTimeout(
        () =>
          resolve({
            data: {
              success: true,
              data: {
                totalMerchants: 1248,
                activeProviders: 32,
                totalTransactions: 8421,
                totalVolume: 2400000,
                stats: {
                  pendingRequests: 14,
                  approvedRequests: 156,
                  rejectedRequests: 3,
                },
              },
            },
          }),
        500,
      ),
    );

    // Uncomment when ready for real API
    // return apiClient.get('/account-requests/dashboard/statistics');
  },

  /**
   * Get recent pending requests for the dashboard activity feed
   */
  getRecentActivity: async () => {
    // MOCK DEV PREVIEW
    logger.debug("MOCK RECENT ACTIVITY: Bypassing real endpoints for preview.");
    return new Promise((resolve) =>
      setTimeout(
        () =>
          resolve({
            data: {
              success: true,
              data: {
                requests: [
                  {
                    _id: "REQ-6782",
                    type: "Merchant KYC",
                    merchantName: "TechFlow Solutions",
                    status: "pending",
                    createdAt: new Date(
                      Date.now() - 1000 * 60 * 5,
                    ).toISOString(),
                  },
                  {
                    _id: "REQ-6781",
                    type: "Add Provider",
                    merchantName: "Global Exporters",
                    status: "pending",
                    createdAt: new Date(
                      Date.now() - 1000 * 60 * 30,
                    ).toISOString(),
                  },
                  {
                    _id: "REQ-6780",
                    type: "KYC Update",
                    merchantName: "Sunrise Trading",
                    status: "action_required",
                    createdAt: new Date(
                      Date.now() - 1000 * 60 * 60 * 2,
                    ).toISOString(),
                  },
                  {
                    _id: "REQ-6779",
                    type: "Account Setup",
                    merchantName: "NexGen Digital",
                    status: "pending",
                    createdAt: new Date(
                      Date.now() - 1000 * 60 * 60 * 4,
                    ).toISOString(),
                  },
                  {
                    _id: "REQ-6775",
                    type: "Limit Increase",
                    merchantName: "Stark Industries",
                    status: "approved",
                    createdAt: new Date(
                      Date.now() - 1000 * 60 * 60 * 24,
                    ).toISOString(),
                  },
                ],
              },
            },
          }),
        600,
      ),
    );

    // Uncomment when ready for real API
    // return apiClient.get('/account-requests/pending?limit=5');
  },
};

export default dashboardApi;
