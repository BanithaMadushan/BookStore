import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import FeaturedBooks from '../components/FeaturedBooks';
import Footer from '../components/Footer';
import googleBooksApi from '../services/googleBooksApi';
import { useAuth } from '../context/AuthContext';
import { FiUserPlus, FiLogIn } from 'react-icons/fi';

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Avid Reader',
      avatar: 'https://randomuser.me/api/portraits/women/43.jpg',
      text: 'World of Books has transformed my reading experience. Their collection is unmatched, and their delivery is always prompt!',
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Book Club Organizer',
      avatar: 'https://randomuser.me/api/portraits/men/52.jpg',
      text: 'Our book club exclusively orders from World of Books now. The recommendations are spot on, and the discounts for bulk orders are fantastic.',
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      role: 'Literature Professor',
      avatar: 'https://randomuser.me/api/portraits/women/29.jpg',
      text: 'I recommend World of Books to all my students. Their academic collection is comprehensive, and their customer service is exceptional.',
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container-custom">
        <h2 className="text-3xl font-display font-bold text-gray-900 mb-2 text-center">What Our Customers Say</h2>
        <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
          Don't just take our word for it. Here's what readers from around the world think about our service.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <div className="flex items-center mb-4">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h3 className="font-bold text-gray-900">{testimonial.name}</h3>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-gray-700 italic">"{testimonial.text}"</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    console.log('Subscribing email:', email);
    setSubscribed(true);
    setEmail('');
  };

  return (
    <section className="py-16 bg-primary-700 text-white">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-display font-bold mb-4">Join Our Reading Community</h2>
          <p className="text-primary-100 mb-8">
            Subscribe to our newsletter and get updates on new releases, reading lists, author events, and exclusive discounts.
          </p>
          {subscribed ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-primary-800 p-6 rounded-lg inline-block"
            >
              <p className="text-primary-100 font-medium">Thank you for subscribing to our newsletter!</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubscribe} className="max-w-lg mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="input flex-grow text-gray-800"
                  required
                />
                <button
                  type="submit"
                  className="btn bg-white text-primary-700 hover:bg-gray-100 shadow-md"
                >
                  Subscribe
                </button>
              </div>
              <p className="text-xs text-primary-200 mt-4">
                By subscribing, you agree to receive marketing emails from World of Books. You can unsubscribe at any time.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

const AuthCTA = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-display font-bold mb-4">Ready to Explore More Books?</h2>
          <p className="text-white/90 mb-8 text-lg">
            Create an account to access our full collection, save your favorite books, track your orders, and enjoy exclusive discounts.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link 
              to="/register" 
              className="btn bg-white text-blue-600 hover:bg-gray-100 shadow-lg flex items-center justify-center"
            >
              <FiUserPlus className="mr-2" />
              Create an Account
            </Link>
            <Link 
              to="/login" 
              className="btn bg-blue-700 text-white hover:bg-blue-800 shadow-lg flex items-center justify-center"
            >
              <FiLogIn className="mr-2" />
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

const HomePage = () => {
  const [featuredBook, setFeaturedBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const location = useLocation();
  
  // Track if the user just logged out (for animation purposes)
  const [hasJustLoggedOut, setHasJustLoggedOut] = useState(false);
  
  // Check if the user was redirected from logout
  useEffect(() => {
    // Use the location state to determine if this was a logout redirect
    if (location.state?.fromLogout) {
      setHasJustLoggedOut(true);
      // Reset the state after animation
      setTimeout(() => {
        setHasJustLoggedOut(false);
      }, 1000);
    }
  }, [location]);

  useEffect(() => {
    const fetchFeaturedBook = async () => {
      try {
        setLoading(true);
        const data = await googleBooksApi.getFeaturedBooks(1);
        if (data && data.length > 0) {
          // Get the first featured book
          setFeaturedBook(data[0]);
        }
      } catch (err) {
        console.error('Error fetching featured book:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedBook();
  }, []);

  // Animation variants for the entire page
  const pageVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.6, 
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };
  
  // Animation variants for individual sections
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div 
      className="min-h-screen flex flex-col"
      initial="hidden"
      animate="visible"
      variants={pageVariants}
    >
      <Navbar />
      <motion.main variants={hasJustLoggedOut ? pageVariants : {}}>
        <motion.div variants={sectionVariants}>
          <Hero featuredBook={featuredBook} />
        </motion.div>
        
        <motion.div variants={sectionVariants}>
          <FeaturedBooks />
        </motion.div>
        
        {!currentUser && (
          <motion.div variants={sectionVariants}>
            <AuthCTA />
          </motion.div>
        )}
        
        <motion.div variants={sectionVariants}>
          <Testimonials />
        </motion.div>
        
        <motion.div variants={sectionVariants}>
          <Newsletter />
        </motion.div>
      </motion.main>
      <Footer />
    </motion.div>
  );
};

export default HomePage; 