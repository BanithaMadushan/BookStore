import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheck, FiCreditCard, FiMapPin, FiPackage, FiArrowLeft } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { cartApi, orderApi } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Checkout = () => {
  const { currentUser } = useAuth();
  const { cartItems, clearCart, calculateTotals } = useCart();
  const navigate = useNavigate();
  
  // Checkout steps
  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [placingOrder, setPlacingOrder] = useState(false);
  
  // Form data
  const [shippingInfo, setShippingInfo] = useState({
    firstName: currentUser?.firstName || '',
    lastName: currentUser?.lastName || '',
    address: currentUser?.address || '',
    city: currentUser?.city || '',
    state: currentUser?.state || '',
    zipCode: currentUser?.zipCode || '',
    phone: currentUser?.phone || '',
  });
  
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });
  
  // Form validation
  const [shippingErrors, setShippingErrors] = useState({});
  const [paymentErrors, setPaymentErrors] = useState({});
  
  // Check if cart is empty on load
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);
  
  // Calculate totals using CartContext
  const { subtotal, shipping, tax, total } = calculateTotals();
  
  // Handle form changes
  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo({ ...shippingInfo, [name]: value });
    
    // Clear error when user starts typing
    if (shippingErrors[name]) {
      setShippingErrors({ ...shippingErrors, [name]: '' });
    }
  };
  
  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentInfo({ ...paymentInfo, [name]: value });
    
    // Clear error when user starts typing
    if (paymentErrors[name]) {
      setPaymentErrors({ ...paymentErrors, [name]: '' });
    }
  };
  
  // Validate shipping form
  const validateShippingForm = () => {
    const errors = {};
    
    if (!shippingInfo.firstName.trim()) errors.firstName = 'First name is required';
    if (!shippingInfo.lastName.trim()) errors.lastName = 'Last name is required';
    if (!shippingInfo.address.trim()) errors.address = 'Address is required';
    if (!shippingInfo.city.trim()) errors.city = 'City is required';
    if (!shippingInfo.state.trim()) errors.state = 'State is required';
    if (!shippingInfo.zipCode.trim()) errors.zipCode = 'Zip code is required';
    else if (!/^\d{5}(-\d{4})?$/.test(shippingInfo.zipCode)) errors.zipCode = 'Invalid zip code format';
    if (!shippingInfo.phone.trim()) errors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(shippingInfo.phone.replace(/[^0-9]/g, ''))) errors.phone = 'Invalid phone number';
    
    setShippingErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Validate payment form
  const validatePaymentForm = () => {
    const errors = {};
    
    if (!paymentInfo.cardName.trim()) errors.cardName = 'Name on card is required';
    if (!paymentInfo.cardNumber.trim()) errors.cardNumber = 'Card number is required';
    else if (!/^\d{16}$/.test(paymentInfo.cardNumber.replace(/\s/g, ''))) errors.cardNumber = 'Invalid card number';
    if (!paymentInfo.expiryDate.trim()) errors.expiryDate = 'Expiry date is required';
    else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(paymentInfo.expiryDate)) errors.expiryDate = 'Invalid format (MM/YY)';
    if (!paymentInfo.cvv.trim()) errors.cvv = 'CVV is required';
    else if (!/^\d{3,4}$/.test(paymentInfo.cvv)) errors.cvv = 'Invalid CVV';
    
    setPaymentErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle step changes
  const goToNextStep = () => {
    if (activeStep === 1) {
      if (validateShippingForm()) {
        setActiveStep(2);
      }
    } else if (activeStep === 2) {
      if (validatePaymentForm()) {
        setActiveStep(3);
      }
    }
  };
  
  const goToPreviousStep = () => {
    setActiveStep(Math.max(1, activeStep - 1));
  };
  
  // Place order
  const handlePlaceOrder = async () => {
    try {
      setPlacingOrder(true);
      
      // Generate a random order ID
      const orderId = 'ORD-' + Math.random().toString(36).substring(2, 10).toUpperCase();
      
      // Create order data
      const orderData = {
        _id: orderId,
        userId: currentUser?._id || 'guest',
        items: cartItems,
        shippingInfo,
        paymentInfo: { cardLast4: paymentInfo.cardNumber.slice(-4) },
        totalAmount: total,
        status: 'Processing',
        createdAt: new Date().toISOString()
      };
      
      // In real implementation with backend:
      // await orderApi.createOrder(orderData);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Store order in localStorage for order history
      const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      existingOrders.push(orderData);
      localStorage.setItem('orders', JSON.stringify(existingOrders));
      
      // Clear the cart
      clearCart();
      
      // Navigate to order details page with order ID
      navigate(`/orders/${orderId}`);
    } catch (err) {
      console.error('Error placing order:', err);
      setError('Failed to place your order. Please try again.');
      setPlacingOrder(false);
    }
  };
  
  // Render step content
  const renderStepContent = () => {
    switch (activeStep) {
      case 1:
        return (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipping Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name*
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={shippingInfo.firstName}
                  onChange={handleShippingChange}
                  className={`input ${shippingErrors.firstName ? 'border-red-500' : ''}`}
                />
                {shippingErrors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{shippingErrors.firstName}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name*
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={shippingInfo.lastName}
                  onChange={handleShippingChange}
                  className={`input ${shippingErrors.lastName ? 'border-red-500' : ''}`}
                />
                {shippingErrors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{shippingErrors.lastName}</p>
                )}
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address*
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={shippingInfo.address}
                  onChange={handleShippingChange}
                  className={`input ${shippingErrors.address ? 'border-red-500' : ''}`}
                />
                {shippingErrors.address && (
                  <p className="mt-1 text-sm text-red-600">{shippingErrors.address}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  City*
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={shippingInfo.city}
                  onChange={handleShippingChange}
                  className={`input ${shippingErrors.city ? 'border-red-500' : ''}`}
                />
                {shippingErrors.city && (
                  <p className="mt-1 text-sm text-red-600">{shippingErrors.city}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                    State*
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={shippingInfo.state}
                    onChange={handleShippingChange}
                    className={`input ${shippingErrors.state ? 'border-red-500' : ''}`}
                  />
                  {shippingErrors.state && (
                    <p className="mt-1 text-sm text-red-600">{shippingErrors.state}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                    Zip Code*
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={shippingInfo.zipCode}
                    onChange={handleShippingChange}
                    className={`input ${shippingErrors.zipCode ? 'border-red-500' : ''}`}
                  />
                  {shippingErrors.zipCode && (
                    <p className="mt-1 text-sm text-red-600">{shippingErrors.zipCode}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number*
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={shippingInfo.phone}
                  onChange={handleShippingChange}
                  className={`input ${shippingErrors.phone ? 'border-red-500' : ''}`}
                  placeholder="(123) 456-7890"
                />
                {shippingErrors.phone && (
                  <p className="mt-1 text-sm text-red-600">{shippingErrors.phone}</p>
                )}
              </div>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Information</h2>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-1">
                  Name on Card*
                </label>
                <input
                  type="text"
                  id="cardName"
                  name="cardName"
                  value={paymentInfo.cardName}
                  onChange={handlePaymentChange}
                  className={`input ${paymentErrors.cardName ? 'border-red-500' : ''}`}
                />
                {paymentErrors.cardName && (
                  <p className="mt-1 text-sm text-red-600">{paymentErrors.cardName}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Card Number*
                </label>
                <input
                  type="text"
                  id="cardNumber"
                  name="cardNumber"
                  value={paymentInfo.cardNumber}
                  onChange={handlePaymentChange}
                  className={`input ${paymentErrors.cardNumber ? 'border-red-500' : ''}`}
                  placeholder="1234 5678 9012 3456"
                />
                {paymentErrors.cardNumber && (
                  <p className="mt-1 text-sm text-red-600">{paymentErrors.cardNumber}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date*
                  </label>
                  <input
                    type="text"
                    id="expiryDate"
                    name="expiryDate"
                    value={paymentInfo.expiryDate}
                    onChange={handlePaymentChange}
                    className={`input ${paymentErrors.expiryDate ? 'border-red-500' : ''}`}
                    placeholder="MM/YY"
                  />
                  {paymentErrors.expiryDate && (
                    <p className="mt-1 text-sm text-red-600">{paymentErrors.expiryDate}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                    CVV*
                  </label>
                  <input
                    type="text"
                    id="cvv"
                    name="cvv"
                    value={paymentInfo.cvv}
                    onChange={handlePaymentChange}
                    className={`input ${paymentErrors.cvv ? 'border-red-500' : ''}`}
                    placeholder="123"
                  />
                  {paymentErrors.cvv && (
                    <p className="mt-1 text-sm text-red-600">{paymentErrors.cvv}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-medium text-gray-700 mb-2">Shipping to:</h3>
              <p className="text-gray-600">
                {shippingInfo.firstName} {shippingInfo.lastName}
              </p>
              <p className="text-gray-600">{shippingInfo.address}</p>
              <p className="text-gray-600">
                {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}
              </p>
              <p className="text-gray-600">{shippingInfo.phone}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-medium text-gray-700 mb-2">Payment:</h3>
              <p className="text-gray-600">
                Card ending in {paymentInfo.cardNumber.slice(-4)}
              </p>
            </div>
            
            <h3 className="font-medium text-gray-700 mb-2">Items:</h3>
            <div className="border-t border-b border-gray-200 py-4 mb-4">
              {cartItems.map((item) => {
                const price = item.book.discountPrice || item.book.price;
                return (
                  <div key={item._id} className="flex justify-between items-center mb-2 last:mb-0">
                    <div className="flex items-center">
                      <img
                        src={item.book.coverImage}
                        alt={item.book.title}
                        className="w-10 h-14 object-cover mr-3"
                      />
                      <div>
                        <p className="text-gray-900 font-medium">{item.book.title}</p>
                        <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="text-gray-900 font-medium">${(price * item.quantity).toFixed(2)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="loader"></div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-grow container-custom py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
            Checkout
          </h1>
          <p className="text-gray-600">
            Complete your order in a few simple steps
          </p>
        </div>
        
        {/* Checkout Steps Indicator */}
        <div className="mb-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-between">
              <div className={`flex items-center ${activeStep >= 1 ? 'text-blue-600' : 'text-gray-500'}`}>
                <span className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  activeStep > 1 ? 'bg-blue-600' : (activeStep === 1 ? 'bg-blue-600' : 'bg-gray-200')
                } ${activeStep >= 1 ? 'text-white' : 'text-gray-500'}`}>
                  {activeStep > 1 ? <FiCheck className="w-5 h-5" /> : <FiMapPin className="w-5 h-5" />}
                </span>
                <span className="ml-2 text-sm font-medium">Shipping</span>
              </div>
              
              <div className={`flex items-center ${activeStep >= 2 ? 'text-blue-600' : 'text-gray-500'}`}>
                <span className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  activeStep > 2 ? 'bg-blue-600' : (activeStep === 2 ? 'bg-blue-600' : 'bg-gray-200')
                } ${activeStep >= 2 ? 'text-white' : 'text-gray-500'}`}>
                  {activeStep > 2 ? <FiCheck className="w-5 h-5" /> : <FiCreditCard className="w-5 h-5" />}
                </span>
                <span className="ml-2 text-sm font-medium">Payment</span>
              </div>
              
              <div className={`flex items-center ${activeStep >= 3 ? 'text-blue-600' : 'text-gray-500'}`}>
                <span className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  activeStep === 3 ? 'bg-blue-600' : 'bg-gray-200'
                } ${activeStep >= 3 ? 'text-white' : 'text-gray-500'}`}>
                  <FiPackage className="w-5 h-5" />
                </span>
                <span className="ml-2 text-sm font-medium">Review</span>
              </div>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <span>{error}</span>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              {renderStepContent()}
              
              <div className="flex justify-between pt-4 border-t border-gray-200">
                {activeStep > 1 ? (
                  <button
                    onClick={goToPreviousStep}
                    className="flex items-center text-blue-600 hover:text-blue-700"
                  >
                    <FiArrowLeft className="mr-2" />
                    Back
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/cart')}
                    className="flex items-center text-blue-600 hover:text-blue-700"
                  >
                    <FiArrowLeft className="mr-2" />
                    Back to Cart
                  </button>
                )}
                
                {activeStep < 3 ? (
                  <button
                    onClick={goToNextStep}
                    className="btn btn-primary"
                  >
                    {activeStep === 1 ? 'Continue to Payment' : 'Review Order'}
                  </button>
                ) : (
                  <button
                    onClick={handlePlaceOrder}
                    disabled={placingOrder}
                    className="btn btn-primary disabled:opacity-50"
                  >
                    {placingOrder ? 'Processing...' : 'Place Order'}
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({cartItems.reduce((acc, item) => acc + item.quantity, 0)} items)</span>
                  <span className="text-gray-900 font-medium">${subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900 font-medium">
                    {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (8%)</span>
                  <span className="text-gray-900 font-medium">${tax.toFixed(2)}</span>
                </div>
                
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-blue-600">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              {cartItems.map((item) => (
                <div key={item._id} className="flex items-center py-2 border-t border-gray-100 last:border-b">
                  <div className="w-12 h-16 flex-shrink-0 overflow-hidden rounded">
                    <img 
                      src={item.book.coverImage}
                      alt={item.book.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="ml-3 flex-grow">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.book.title}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    ${((item.book.discountPrice || item.book.price) * item.quantity).toFixed(2)}
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

export default Checkout; 