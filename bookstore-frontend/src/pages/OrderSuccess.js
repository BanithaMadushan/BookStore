import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiPackage, FiTruck, FiCalendar, FiArrowLeft } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

const OrderSuccess = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Get the order ID from location state or fall back to URL params
    const orderId = location.state?.orderId || new URLSearchParams(location.search).get('id');
    
    if (!orderId) {
      navigate('/');
      return;
    }
    
    // Load order details from localStorage
    const loadOrder = () => {
      try {
        setLoading(true);
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const foundOrder = orders.find(o => o._id === orderId);
        
        if (foundOrder) {
          setOrder(foundOrder);
        } else {
          // If order not found, create a fallback with minimal info
          setOrder({
            _id: orderId,
            status: 'Processing',
            createdAt: new Date().toISOString(),
            items: [],
            shippingInfo: {},
            totalAmount: 0
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading order details:', error);
        setLoading(false);
      }
    };
    
    loadOrder();
  }, [location, navigate]);
  
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
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Estimated delivery date (7 days from order date)
  const estimatedDelivery = new Date(order.createdAt);
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-grow container-custom py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="p-6 bg-green-50 border-b border-green-100 flex items-center">
              <FiCheckCircle className="text-green-500 w-8 h-8 mr-4" />
              <div>
                <h1 className="text-2xl font-display font-bold text-gray-900">
                  Order Placed Successfully!
                </h1>
                <p className="text-gray-600">
                  Thank you for your order. We've received your order and will begin processing it soon.
                </p>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Information</h2>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div>
                    <p className="text-sm text-gray-600">Order Number:</p>
                    <p className="font-medium">{order._id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Order Date:</p>
                    <p className="font-medium">{formatDate(order.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status:</p>
                    <p className="font-medium text-green-600">{order.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Estimated Delivery:</p>
                    <p className="font-medium">{formatDate(estimatedDelivery)}</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
                {order.items && order.items.length > 0 ? (
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div key={item._id} className="flex border-b border-gray-100 pb-4">
                        <div className="w-16 h-20 flex-shrink-0 overflow-hidden rounded">
                          <img 
                            src={item.book.coverImage} 
                            alt={item.book.title} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="ml-4 flex-grow">
                          <h3 className="font-semibold text-gray-900">{item.book.title}</h3>
                          <p className="text-sm text-gray-600">by {item.book.author}</p>
                          <div className="flex justify-between mt-2">
                            <p className="text-sm">Qty: {item.quantity}</p>
                            <p className="font-medium">
                              ${(item.book.discountPrice || item.book.price) * item.quantity}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No items in this order.</p>
                )}
              </div>
              
              {order.shippingInfo && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h2>
                    <div className="p-4 bg-gray-50 rounded">
                      <p className="font-medium">{order.shippingInfo.firstName} {order.shippingInfo.lastName}</p>
                      <p>{order.shippingInfo.address}</p>
                      <p>{order.shippingInfo.city}, {order.shippingInfo.state} {order.shippingInfo.zipCode}</p>
                      <p>{order.shippingInfo.phone}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h2>
                    <div className="p-4 bg-gray-50 rounded">
                      <p className="font-medium">Payment Method:</p>
                      <p>Credit Card ending in {order.paymentInfo?.cardLast4 || '****'}</p>
                      <p className="mt-2 font-medium">Order Total:</p>
                      <p>${order.totalAmount?.toFixed(2) || '0.00'}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex space-y-4 sm:space-y-0 sm:space-x-4 flex-col sm:flex-row">
                <Link 
                  to="/"
                  className="btn btn-outline flex items-center justify-center"
                >
                  <FiArrowLeft className="mr-2" />
                  Continue Shopping
                </Link>
                <Link 
                  to={`/orders/${order._id}`}
                  className="btn btn-primary flex items-center justify-center"
                >
                  View Order Details
                </Link>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">What's Next?</h2>
            <div className="space-y-4">
              <div className="flex">
                <div className="flex-shrink-0 mr-4">
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <FiPackage />
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Order Processing</h3>
                  <p className="text-gray-600">Your order is being processed and will be prepared for shipping soon.</p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0 mr-4">
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <FiTruck />
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Shipping</h3>
                  <p className="text-gray-600">You'll receive a shipping confirmation email with tracking information once your order ships.</p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0 mr-4">
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <FiCalendar />
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Delivery</h3>
                  <p className="text-gray-600">Your order should arrive within 5-7 business days.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default OrderSuccess; 