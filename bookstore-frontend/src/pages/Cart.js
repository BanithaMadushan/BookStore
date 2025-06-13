import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiTrash2, FiPlus, FiMinus, FiAlertCircle, FiArrowLeft } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { cartApi } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const { currentUser } = useAuth();
  const { cartItems, updateCartItemQuantity, removeFromCart, clearCart, calculateTotals } = useCart();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingCart, setUpdatingCart] = useState(false);
  
  useEffect(() => {
    // Set loading to false after a short delay to simulate loading state
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1 || newQuantity > 10) return;
    
    try {
      setUpdatingCart(true);
      
      // Update cart using CartContext
      updateCartItemQuantity(itemId, newQuantity);
      
    } catch (err) {
      console.error('Error updating cart:', err);
      setError('Failed to update item quantity. Please try again.');
    } finally {
      setUpdatingCart(false);
    }
  };
  
  const handleRemoveItem = async (itemId) => {
    try {
      setUpdatingCart(true);
      
      // Remove item using CartContext
      removeFromCart(itemId);
      
    } catch (err) {
      console.error('Error removing item:', err);
      setError('Failed to remove item from cart. Please try again.');
    } finally {
      setUpdatingCart(false);
    }
  };
  
  const handleClearCart = async () => {
    try {
      setUpdatingCart(true);
      
      // Clear cart using CartContext
      clearCart();
      
    } catch (err) {
      console.error('Error clearing cart:', err);
      setError('Failed to clear cart. Please try again.');
    } finally {
      setUpdatingCart(false);
    }
  };
  
  // Calculate subtotal, shipping, and total using CartContext
  const { subtotal, shipping, total } = calculateTotals();
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-grow container-custom py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
            Your Cart
          </h1>
          <p className="text-gray-600">
            Review and modify your items before checkout
          </p>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="loader"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <div className="flex items-center">
              <FiAlertCircle className="mr-2" />
              <span>{error}</span>
            </div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <FiShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Looks like you haven't added any books to your cart yet.</p>
            <Link to="/books" className="btn btn-primary">
              Browse Books
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {cartItems.map((item) => {
                      const price = item.book.discountPrice || item.book.price;
                      const itemTotal = price * item.quantity;
                      
                      return (
                        <tr key={item._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-20 w-14 flex-shrink-0 overflow-hidden rounded">
                                <img 
                                  src={item.book.coverImage} 
                                  alt={item.book.title} 
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  <Link to={`/books/${item.book._id}`} className="hover:text-blue-600">
                                    {item.book.title}
                                  </Link>
                                </div>
                                <div className="text-sm text-gray-500">
                                  by {item.book.author}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 font-medium">
                              ${price.toFixed(2)}
                            </div>
                            {item.book.discountPrice && (
                              <div className="text-sm text-gray-500 line-through">
                                ${item.book.price.toFixed(2)}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center border border-gray-300 rounded-md max-w-min">
                              <button 
                                onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                                disabled={updatingCart || item.quantity <= 1}
                                className="px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                              >
                                <FiMinus className="w-4 h-4" />
                              </button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <button 
                                onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                                disabled={updatingCart || item.quantity >= 10}
                                className="px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                              >
                                <FiPlus className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              ${itemTotal.toFixed(2)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleRemoveItem(item._id)}
                              disabled={updatingCart}
                              className="text-red-500 hover:text-red-700 disabled:opacity-50"
                            >
                              <FiTrash2 className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              <div className="flex justify-between">
                <Link to="/books" className="flex items-center text-blue-600 hover:text-blue-700">
                  <FiArrowLeft className="mr-2" />
                  Continue Shopping
                </Link>
                
                <button
                  onClick={handleClearCart}
                  disabled={updatingCart}
                  className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  Clear Cart
                </button>
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900 font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-900 font-medium">
                      {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  {shipping === 0 && (
                    <div className="text-sm text-green-600">
                      You've qualified for free shipping!
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-gray-900">Total</span>
                      <span className="text-lg font-bold text-blue-600">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <button
                    onClick={() => navigate('/checkout')}
                    className="w-full py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Proceed to Checkout
                  </button>
                </motion.div>
                
                <div className="mt-6 text-sm text-gray-500">
                  <p className="mb-2">We accept:</p>
                  <div className="flex space-x-2">
                    <div className="bg-gray-200 rounded px-2 py-1">Visa</div>
                    <div className="bg-gray-200 rounded px-2 py-1">Mastercard</div>
                    <div className="bg-gray-200 rounded px-2 py-1">PayPal</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Cart; 