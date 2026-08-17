/* eslint-disable no-unused-vars */
import apiClient from '../axios';

// Mock Providers Data
const mockProvidersList = [
    { id: '1', name: 'Stripe', status: 'active', type: 'Payment Gateway', balance: 12500.50, currency: 'USD' },
    { id: '2', name: 'Binance', status: 'active', type: 'Crypto Exchange', balance: 5.4, currency: 'BTC' },
    { id: '3', name: 'PayPal', status: 'maintenance', type: 'Wallet', balance: 3400.00, currency: 'EUR' }
];

export const providersApi = {
    getAllProviders: async (params) => {
        // Mock response
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    data: {
                        providers: mockProvidersList,
                        totalCount: mockProvidersList.length
                    }
                });
            }, 600);
        });
        // Real implementation
        // return apiClient.get('/providers', { params });
    }
};
