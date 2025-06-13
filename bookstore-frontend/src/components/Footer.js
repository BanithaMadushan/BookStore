import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiFacebook, FiTwitter, FiInstagram, FiLinkedin } from 'react-icons/fi';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    // Here you would typically make an API call to subscribe the user
    console.log('Subscribing email:', email);
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer className="bg-gray-900 text-gray-200 pt-16 pb-8">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="col-span-1">
            <Link to="/" className="block mb-6">
              <span className="text-white font-display text-2xl font-bold">WorldOfBooks</span>
            </Link>
            <p className="text-gray-400 mb-6">
              Your premier destination for books across all genres. Discover, read, and share the joy of literature.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start">
                <FiMapPin className="w-5 h-5 mr-3 text-primary-400 mt-1" />
                <span>123 Book Lane, Reading Town, RD 12345</span>
              </li>
              <li className="flex items-center">
                <FiPhone className="w-5 h-5 mr-3 text-primary-400" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center">
                <FiMail className="w-5 h-5 mr-3 text-primary-400" />
                <a href="mailto:info@worldofbooks.com" className="hover:text-primary-400 transition-colors">
                  info@worldofbooks.com
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-white text-lg font-bold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/books" className="text-gray-400 hover:text-primary-400 transition-colors">
                  All Books
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/new-releases" className="text-gray-400 hover:text-primary-400 transition-colors">
                  New Releases
                </Link>
              </li>
              <li>
                <Link to="/bestsellers" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Bestsellers
                </Link>
              </li>
              <li>
                <Link to="/deals" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Deals & Discounts
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="col-span-1">
            <h3 className="text-white text-lg font-bold mb-6">Customer Service</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/account" className="text-gray-400 hover:text-primary-400 transition-colors">
                  My Account
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Order History
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-span-1">
            <h3 className="text-white text-lg font-bold mb-6">Stay Updated</h3>
            <p className="text-gray-400 mb-4">
              Subscribe to our newsletter for updates on new releases, special offers, and literary events.
            </p>
            {subscribed ? (
              <div className="p-4 bg-primary-900/50 border border-primary-700 rounded-lg">
                <p className="text-primary-300">Thank you for subscribing!</p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="mb-6">
                <div className="flex">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    className="input bg-gray-800 border-gray-700 text-gray-200 flex-grow"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-r-lg transition-colors"
                  >
                    Subscribe
                  </button>
                </div>
              </form>
            )}

            <div className="mt-8">
              <h4 className="text-white text-md font-bold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary-400 transition-colors">
                  <FiFacebook className="w-6 h-6" />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary-400 transition-colors">
                  <FiTwitter className="w-6 h-6" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary-400 transition-colors">
                  <FiInstagram className="w-6 h-6" />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary-400 transition-colors">
                  <FiLinkedin className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row md:justify-between items-center">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} World of Books. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center space-x-4">
              <Link to="/privacy-policy" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
                Terms of Service
              </Link>
              <Link to="/cookies" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 