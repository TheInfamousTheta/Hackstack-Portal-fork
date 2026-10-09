import { apiClient } from './apiClient';

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || error.message || fallback;

export const certificateService = {
  getModuleCertificate: async (moduleId) => {
    try {
      const response = await apiClient.get(`/certificates/module/${moduleId}`);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to fetch certificate.'));
    }
  },

  verifyCertificate: async (certCode) => {
    try {
      const response = await apiClient.get(`/certificates/verify/${certCode}`);
      return response.data;
    } catch (error) {
      const err = new Error(getErrorMessage(error, 'Failed to verify certificate.'));
      err.status = error.response?.status;
      throw err;
    }
  },
};
