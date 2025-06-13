import React, { createContext, useState, useEffect, useContext } from 'react';
import { authApi } from '../api/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in on page load
    const checkUserLoggedIn = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          setLoading(true);
          const response = await authApi.getProfile();
          
          // Map the backend user response to our frontend user format
          // Fix: Handle cases where name might not be properly split
          const name = response.data.user.name || '';
          const nameParts = name.split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
          
          const user = {
            _id: response.data.user.id,
            firstName,
            lastName,
            email: response.data.user.email,
            phone: response.data.user.phoneNumber || '',
            address: response.data.user.address?.street || '',
            city: response.data.user.address?.city || '',
            state: response.data.user.address?.state || '',
            zipCode: response.data.user.address?.zipCode || '',
          };
          
          setCurrentUser(user);
          localStorage.setItem('user', JSON.stringify(user));
        } catch (err) {
          console.error('Error fetching user profile:', err);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    checkUserLoggedIn();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authApi.login({ email, password });
      
      // Save token and user data
      localStorage.setItem('token', response.data.token);
      
      // Map the backend user response to our frontend user format
      // Fix: Handle cases where name might not be properly split
      const name = response.data.user.name || '';
      const nameParts = name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      
      const user = {
        _id: response.data.user.id,
        firstName,
        lastName,
        email: response.data.user.email,
        phone: response.data.user.phoneNumber || '',
        address: response.data.user.address?.street || '',
        city: response.data.user.address?.city || '',
        state: response.data.user.address?.state || '',
        zipCode: response.data.user.address?.zipCode || '',
      };
      
      // Store user in state and localStorage
      setCurrentUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      
      return response.data;
    } catch (err) {
      console.error('Login error details:', err?.response?.data);
      setError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authApi.register(userData);
      
      // Save token and user data
      localStorage.setItem('token', response.data.token);
      
      // Map the backend user response to our frontend user format
      // Fix: Handle cases where name might not be properly split
      const name = response.data.user.name || '';
      const nameParts = name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      
      const user = {
        _id: response.data.user.id,
        firstName,
        lastName,
        email: response.data.user.email,
        phone: response.data.user.phoneNumber || '',
        address: response.data.user.address?.street || '',
        city: response.data.user.address?.city || '',
        state: response.data.user.address?.state || '',
        zipCode: response.data.user.address?.zipCode || '',
      };
      
      // Store user in state and localStorage
      setCurrentUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      
      return response.data;
    } catch (err) {
      console.error('Registration error details:', err?.response?.data);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Format user data for backend
      const backendUserData = {
        name: `${userData.firstName} ${userData.lastName}`,
        phoneNumber: userData.phone || '',
        address: {
          street: userData.address || '',
          city: userData.city || '',
          state: userData.state || '',
          zipCode: userData.zipCode || '',
          country: 'USA', // Default country
        }
      };
      
      const response = await authApi.updateProfile(backendUserData);
      
      // Map the backend response back to our frontend format
      // Fix: Handle cases where name might not be properly split
      const name = response.data.user.name || '';
      const nameParts = name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      
      const updatedUser = {
        _id: response.data.user.id,
        firstName,
        lastName,
        email: response.data.user.email,
        phone: response.data.user.phoneNumber || '',
        address: response.data.user.address?.street || '',
        city: response.data.user.address?.city || '',
        state: response.data.user.address?.state || '',
        zipCode: response.data.user.address?.zipCode || '',
      };
      
      setCurrentUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return updatedUser;
    } catch (err) {
      console.error('Error updating profile:', err?.response?.data);
      setError(err.response?.data?.message || 'Failed to update profile.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext; 