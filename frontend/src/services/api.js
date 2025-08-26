import axios from 'axios';

// Get backend URL from environment variables
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API Response Error:', error);
    
    // Handle different types of errors
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      throw new Error(data?.detail || `Server error: ${status}`);
    } else if (error.request) {
      // Network error
      throw new Error('Network error: Unable to connect to server');
    } else {
      // Other error
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
);

// API service methods
const apiService = {
  // Profile endpoints
  async getProfile() {
    const response = await apiClient.get('/profile');
    return response.data;
  },

  // Experience endpoints
  async getExperience() {
    const response = await apiClient.get('/experience');
    return response.data;
  },

  async getExperienceById(id) {
    const response = await apiClient.get(`/experience/${id}`);
    return response.data;
  },

  // Projects endpoints
  async getProjects() {
    const response = await apiClient.get('/projects');
    return response.data;
  },

  async getProjectById(id) {
    const response = await apiClient.get(`/projects/${id}`);
    return response.data;
  },

  // Skills endpoints
  async getSkills() {
    const response = await apiClient.get('/skills');
    return response.data;
  },

  // Testimonials endpoints
  async getTestimonials() {
    const response = await apiClient.get('/testimonials');
    return response.data;
  },

  // Contact endpoints
  async submitContactMessage(messageData) {
    const response = await apiClient.post('/contact', messageData);
    return response;
  },

  // Health check
  async healthCheck() {
    const response = await apiClient.get('/health');
    return response;
  },

  // Helper method to check API connectivity
  async checkConnection() {
    try {
      const response = await apiClient.get('/');
      return { connected: true, message: response.message };
    } catch (error) {
      return { connected: false, error: error.message };
    }
  }
};

// Export individual methods for easier imports
export const {
  getProfile,
  getExperience,
  getExperienceById,
  getProjects,
  getProjectById,
  getSkills,
  getTestimonials,
  submitContactMessage,
  healthCheck,
  checkConnection
} = apiService;

// Export default service
export default apiService;