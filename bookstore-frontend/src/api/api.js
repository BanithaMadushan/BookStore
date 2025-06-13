import axios from 'axios';

// Get API base URL from environment variable or use default
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create an axios instance with base URL and configurations
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 unauthorized errors
    if (error.response && error.response.status === 401) {
      // Clear localStorage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Book API functions
export const bookApi = {
  // Get all books with optional pagination and filtering
  getBooks: (page = 1, limit = 10, query = '', category = '') => 
    api.get(`/books?page=${page}&limit=${limit}&search=${query}&category=${category}`),
  
  // Get a specific book by ID
  getBookById: (id) => api.get(`/books/${id}`),
  
  // Get featured books
  getFeaturedBooks: () => api.get('/books/featured'),

  // Get books by category
  getBooksByCategory: (category, page = 1, limit = 10) => 
    api.get(`/books?category=${category}&page=${page}&limit=${limit}`),
  
  // Get book reviews
  getBookReviews: (bookId) => api.get(`/books/${bookId}/reviews`),
  
  // Add a review for a book
  addBookReview: (bookId, reviewData) => api.post(`/books/${bookId}/reviews`, reviewData),
};

// Auth API functions
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/me', userData),
};

// Cart API functions
export const cartApi = {
  getCart: () => api.get('/cart'),
  addToCart: (bookId, quantity = 1) => api.post('/cart', { bookId, quantity }),
  updateCartItem: (bookId, quantity) => api.put('/cart', { bookId, quantity }),
  removeFromCart: (bookId) => api.delete(`/cart/${bookId}`),
  clearCart: () => api.delete('/cart'),
};

// Order API functions
export const orderApi = {
  createOrder: (orderData) => api.post('/orders', orderData),
  getOrders: () => api.get('/orders'),
  getOrderById: (orderId) => api.get(`/orders/${orderId}`),
};

export default api; 