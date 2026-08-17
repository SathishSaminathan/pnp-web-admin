import apiClient from '../axios';
import { API_ROUTES } from '../apiRoutes';

export const storageApi = {
    /**
     * Get a pre-signed S3 URL to view a stored document.
     * @param {string} filePath - S3 key / relative path of the document.
     * @returns {Promise<{ url: string }>}
     */
    getDocumentUrl: async (filePath) => {
        const response = await apiClient.post(API_ROUTES.STORAGE.DOCUMENT_URL, { filePath });
        // Support both { url } and { data: { url } } response shapes
        return response?.url ? response : response?.data ?? response;
    },
};
