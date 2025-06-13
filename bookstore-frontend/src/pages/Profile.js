import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiMapPin, FiShoppingBag, FiLogOut, FiCreditCard, FiEdit, FiCheckCircle, FiCalendar, FiBook, FiShoppingCart } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { orderApi } from '../api/api';

const Profile = () => {
  const { currentUser, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Redirect if not logged in
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        address: currentUser.address || '',
        city: currentUser.city || '',
        state: currentUser.state || '',
        zipCode: currentUser.zipCode || '',
      });
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        
        // Get orders from localStorage
        const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        
        // Filter orders for the current user
        const userOrders = currentUser 
          ? storedOrders.filter(order => order.userId === currentUser._id)
          : [];
          
        setOrders(userOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchOrders();
    } else {
      setOrders([]);
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear errors when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: '',
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    
    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/[^0-9]/g, ''))) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    if (formData.zipCode && !/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
      errors.zipCode = 'Please enter a valid zip code';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        const updatedUserData = await updateProfile(formData);
        
        setUpdateSuccess(true);
        setIsEditing(false);
        setTimeout(() => {
          setUpdateSuccess(false);
        }, 3000);
      } catch (err) {
        console.error('Error updating profile:', err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Safe calculation functions
  const getBooksPurchasedCount = () => {
    if (!Array.isArray(orders)) return 0;
    
    return orders.reduce((total, order) => {
      // Check if order.items exists and is an array
      if (order && Array.isArray(order.items)) {
        return total + order.items.length;
      }
      return total;
    }, 0);
  };

  const accountSummary = [
    {
      icon: <FiCalendar className="w-5 h-5 text-blue-500" />,
      label: 'Member Since',
      value: currentUser ? new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : '',
    },
    {
      icon: <FiBook className="w-5 h-5 text-purple-500" />,
      label: 'Books Purchased',
      value: Array.isArray(orders) ? orders.reduce((total, order) => {
        if (order && Array.isArray(order.items)) {
          return total + order.items.length;
        }
        return total;
      }, 0) : 0,
    },
    {
      icon: <FiShoppingCart className="w-5 h-5 text-green-500" />,
      label: 'Orders Placed',
      value: Array.isArray(orders) ? orders.length : 0,
    },
  ];

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Processing':
        return 'text-blue-600 bg-blue-100';
      case 'Shipped':
        return 'text-purple-600 bg-purple-100';
      case 'Delivered':
        return 'text-green-600 bg-green-100';
      case 'Cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // Render order history section
  const renderOrderHistory = () => {
    if (loading) {
      return (
        <div className="text-center py-8">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-gray-600">Loading your orders...</p>
        </div>
      );
    }

    if (orders.length === 0) {
      return (
        <div className="text-center py-8">
          <FiShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No orders yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Start shopping and your order history will appear here.
          </p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/books')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Browse Books
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {orders.map((order) => (
          <motion.div
            key={order._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-4 sm:mb-0">
                <div className="flex items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Order #{order._id.slice(-6)}</h3>
                  <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Placed on {formatDate(order.createdAt)}
                </p>
                <div className="mt-2">
                  <span className="text-sm text-gray-600">
                    {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                  </span>
                  <span className="mx-2 text-gray-300">|</span>
                  <span className="text-sm font-medium text-gray-900">
                    ${order.totalAmount?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => navigate(`/orders/${order._id}`)}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                >
                  View Details
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  const profileSections = [
    {
      id: 'personal',
      title: 'Personal Information',
      icon: <FiUser className="w-6 h-6 text-blue-600" />,
      content: (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                disabled={!isEditing}
                className={`input ${formErrors.firstName ? 'border-red-500' : ''} ${!isEditing ? 'bg-gray-100' : ''}`}
              />
              {formErrors.firstName && (
                <p className="mt-1 text-sm text-red-600">{formErrors.firstName}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                disabled={!isEditing}
                className={`input ${formErrors.lastName ? 'border-red-500' : ''} ${!isEditing ? 'bg-gray-100' : ''}`}
              />
              {formErrors.lastName && (
                <p className="mt-1 text-sm text-red-600">{formErrors.lastName}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                disabled={true} // Email cannot be edited
                className="input bg-gray-100"
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditing}
                className={`input ${formErrors.phone ? 'border-red-500' : ''} ${!isEditing ? 'bg-gray-100' : ''}`}
              />
              {formErrors.phone && (
                <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'address',
      title: 'Shipping Address',
      icon: <FiMapPin className="w-6 h-6 text-blue-600" />,
      content: (
        <div>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Street Address
              </label>
              <input
                id="address"
                name="address"
                type="text"
                value={formData.address}
                onChange={handleChange}
                disabled={!isEditing}
                className={`input ${!isEditing ? 'bg-gray-100' : ''}`}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`input ${!isEditing ? 'bg-gray-100' : ''}`}
                />
              </div>
              
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  id="state"
                  name="state"
                  type="text"
                  value={formData.state}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`input ${!isEditing ? 'bg-gray-100' : ''}`}
                />
              </div>
              
              <div>
                <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Zip Code
                </label>
                <input
                  id="zipCode"
                  name="zipCode"
                  type="text"
                  value={formData.zipCode}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`input ${formErrors.zipCode ? 'border-red-500' : ''} ${!isEditing ? 'bg-gray-100' : ''}`}
                />
                {formErrors.zipCode && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.zipCode}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'orders',
      title: 'Order History',
      icon: <FiShoppingBag className="w-6 h-6 text-blue-600" />,
      content: (
        <div>
          {renderOrderHistory()}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-grow container-custom py-12">
        <div className="max-w-5xl mx-auto">
          {updateSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex items-center"
            >
              <FiCheckCircle className="w-5 h-5 mr-2" />
              <span>Your profile has been updated successfully!</span>
            </motion.div>
          )}
          
          {/* Profile Header with Logout */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
            <div className="px-6 py-5 border-b border-gray-200 flex flex-col md:flex-row md:justify-between md:items-center">
              <div className="flex items-center mb-4 md:mb-0">
                <div className="bg-blue-100 rounded-full p-3 mr-4">
                  <FiUser className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-display font-bold text-gray-900">
                    {currentUser?.firstName} {currentUser?.lastName}
                  </h1>
                  <p className="text-gray-600">{currentUser?.email}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {isEditing ? (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
                    >
                      <FiEdit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100"
                    >
                      <FiLogOut className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {/* Account Summary */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-700 mb-3">Account Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {accountSummary.map((item, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg shadow-sm flex items-start">
                    <div className="rounded-full bg-gray-100 p-3 mr-3">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">{item.label}</p>
                      <p className="font-semibold text-gray-900">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-6">
              {profileSections.map((section) => (
                <div 
                  key={section.id}
                  className="mb-8 last:mb-0"
                >
                  <div className="flex items-center mb-4">
                    {section.icon}
                    <h2 className="text-xl font-semibold text-gray-900 ml-2">{section.title}</h2>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    {section.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
