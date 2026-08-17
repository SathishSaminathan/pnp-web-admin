/* eslint-disable no-unused-vars */
import apiClient from '../axios';

// Mock Requests Data
const mockRequestsList = [
    { id: 'REQ-6782', merchant: 'TechFlow Solutions', type: 'Account Setup', status: 'pending', date: '2026-02-28T01:48:23Z' },
    { id: 'REQ-6781', merchant: 'Global Exporters', type: 'Limit Increase', status: 'pending', date: '2026-02-27T14:23:23Z' },
    { id: 'REQ-6780', merchant: 'Sunrise Trading', type: 'KYC Update', status: 'action_required', date: '2026-02-26T11:53:23Z' },
    { id: 'REQ-6775', merchant: 'Stark Industries', type: 'New Currency', status: 'approved', date: '2026-02-25T01:53:23Z' }
];

export const requestsApi = {
    getAllRequests: async (params) => {
        // Mock response
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    data: {
                        requests: mockRequestsList,
                        totalCount: mockRequestsList.length
                    }
                });
            }, 500);
        });
        // Real implementation
        // return apiClient.get('/account-requests', { params });
    }
};
