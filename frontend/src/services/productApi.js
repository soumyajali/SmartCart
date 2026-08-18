import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const searchProducts = async (query) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/products/search?q=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw error.response.data.error || { message: 'An unknown error occurred.' };
    }
  }
};

export const getProductReviews = async (productId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/products/${encodeURIComponent(productId)}/reviews`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw error.response.data.error || { message: 'An unknown error occurred.' };
    }
    throw { message: 'Unable to connect to the server.' };
  }
};

export const getProductPriceHistory = async (productId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/products/${encodeURIComponent(productId)}/price-history`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw error.response.data.error || { message: 'An unknown error occurred.' };
    }
    throw { message: 'Unable to connect to the server.' };
  }
};

export const getAnalytics = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/products/analytics`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw error.response.data.error || { message: 'An unknown error occurred.' };
    }
    throw { message: 'Unable to connect to the server.' };
  }
};

export const getSystemHealth = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/health`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw error.response.data || { message: 'An unknown error occurred.' };
    }
    throw { message: 'Unable to connect to the backend server.' };
  }
};

export const retrainModel = async () => {
  try {
    // Direct call to ML service
    const ML_URL = import.meta.env.VITE_ML_URL || 'http://localhost:5001/api/ml';
    const response = await axios.post(`${ML_URL}/retrain`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw error.response.data || { message: 'An unknown error occurred.' };
    }
    throw { message: 'Unable to connect to the ML service.' };
  }
};

export const askChatbot = async (message) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/chatbot/ask`, { message });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw error.response.data || { message: 'An unknown error occurred.' };
    }
    throw { message: 'Unable to connect to the Chatbot service.' };
  }
};

export const getPriceHistory = async (productId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/products/${productId}/price-history`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Unable to fetch price history' };
  }
};

export const createPriceAlert = async (productId, email, targetPrice) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/products/alerts`, {
      product_id: productId,
      email: email,
      target_price: targetPrice
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Unable to create price alert' };
  }
};
