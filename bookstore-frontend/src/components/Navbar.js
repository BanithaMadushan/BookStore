import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiMenu, FiX, FiHeart, FiLogOut } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { cartCount, clearCart } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const handleLogout = () => {
    // Start logout transition
    setIsLoggingOut(true);
    
    // Clear user authentication and cart data
    logout();
    clearCart();
    
    // Close mobile menu if open
    setIsMenuOpen(false);
    
    // Add a slight delay before redirecting for the animation to be visible
    setTimeout(() => {
      // Navigate to homepage with state indicating this is a logout redirect
      navigate('/', { state: { fromLogout: true } });
      // Reset the logout state after navigation
      setTimeout(() => setIsLoggingOut(false), 100);
    }, 600);
  };

  return (
    <>
      {/* Logout Transition Overlay */}
      <AnimatePresence>
        {isLoggingOut && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 bg-blue-600 z-[100] flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="text-white text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="mx-auto mb-4 w-16 h-16 border-4 border-white border-t-transparent rounded-full"
              ></motion.div>
              <h2 className="text-2xl font-display font-bold">Logging out...</h2>
              <p className="text-blue-100 mt-2">See you again soon!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <span className="text-blue-700 font-display text-2xl font-bold">WorldOfBooks</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/books" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Browse
              </Link>
              <Link to="/categories" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Categories
              </Link>
            </div>

            {/* Desktop Icons */}
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/wishlist" className="text-gray-700 hover:text-blue-600">
                <FiHeart className="w-6 h-6" />
              </Link>
              <Link to="/cart" className="text-gray-700 hover:text-blue-600 relative">
                <FiShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
              
              {currentUser ? (
                <div className="relative group flex items-center space-x-4">
                  <Link to="/profile" className="flex items-center text-gray-700 hover:text-blue-600">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                      <FiUser className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="font-medium">{currentUser.firstName}</span>
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center text-gray-700 hover:text-red-600 transition-colors"
                    aria-label="Logout"
                  >
                    <FiLogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link to="/login" className="text-gray-700 hover:text-blue-600 font-medium">
                    Sign In
                  </Link>
                  <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button onClick={toggleMenu} className="text-gray-700 focus:outline-none">
                {isMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 py-4 border-t border-gray-200 animate-slide-down">
              <div className="flex flex-col space-y-4">
                <Link to="/books" className="text-gray-700 hover:text-blue-600 font-medium">
                  Browse
                </Link>
                <Link to="/categories" className="text-gray-700 hover:text-blue-600 font-medium">
                  Categories
                </Link>
                
                {/* Authentication Links */}
                {currentUser ? (
                  <div className="border-t border-gray-200 pt-4 mt-2">
                    <div className="flex items-center mb-4">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                        <FiUser className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="font-medium">{currentUser.firstName} {currentUser.lastName}</span>
                    </div>
                    <Link to="/profile" className="flex items-center text-gray-700 hover:text-blue-600 mb-3">
                      <FiUser className="w-5 h-5 mr-2" />
                      My Profile
                    </Link>
                    <Link to="/cart" className="flex items-center text-gray-700 hover:text-blue-600 mb-3 relative">
                      <FiShoppingCart className="w-5 h-5 mr-2" />
                      My Cart
                      {cartCount > 0 && (
                        <span className="ml-2 bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                          {cartCount > 99 ? '99+' : cartCount}
                        </span>
                      )}
                    </Link>
                    <Link to="/wishlist" className="flex items-center text-gray-700 hover:text-blue-600 mb-3">
                      <FiHeart className="w-5 h-5 mr-2" />
                      Wishlist
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="flex items-center text-gray-700 hover:text-red-600 w-full text-left mb-3"
                    >
                      <FiLogOut className="w-5 h-5 mr-2" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="border-t border-gray-200 pt-4 mt-2">
                    <Link to="/login" className="block text-gray-700 hover:text-blue-600 font-medium mb-3">
                      Sign In
                    </Link>
                    <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors inline-block">
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar; 