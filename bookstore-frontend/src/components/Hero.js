import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Hero = ({ featuredBook }) => {
  // Default book if none is provided from API
  const defaultBook = {
    _id: 'default-book',
    title: 'The Great Adventure',
    author: 'Jane Doe',
    description: 'Embark on an epic journey through uncharted territories and discover the secrets of ancient civilizations in this thrilling adventure novel that will keep you on the edge of your seat.',
    coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1287&auto=format&fit=crop',
    price: 24.99,
    discountPrice: 19.99,
  };

  const book = featuredBook || defaultBook;

  return (
    <div className="bg-gradient-to-r from-primary-50 via-white to-secondary-50 py-12 md:py-24">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-gray-900 leading-tight">
              Discover Your Next <span className="text-primary-600">Favorite Book</span>
            </h1>
            <p className="text-lg text-gray-700 max-w-md">
              Explore our vast collection of books across all genres. From bestsellers to hidden gems, find your perfect read today.
            </p>
            <div className="space-x-4 pt-4">
              <Link to="/books" className="btn btn-primary px-8 py-3">Browse Collection</Link>
              <Link to="/categories" className="btn btn-outline px-8 py-3">Categories</Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative mt-10 md:mt-0"
          >
            <div className="relative z-10">
              <div className="book-hover bg-white p-6 rounded-lg shadow-xl">
                <div className="relative pb-2/3 overflow-hidden rounded-lg shadow-lg mb-4">
                  <img 
                    src={book.coverImage} 
                    alt={book.title} 
                    className="absolute h-full w-full object-cover transform hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="pt-4">
                  <h3 className="text-2xl font-display font-bold text-gray-900">{book.title}</h3>
                  <p className="text-gray-600 mb-2">by {book.author}</p>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-3">{book.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline">
                      <span className="text-2xl font-bold text-primary-600">${book.discountPrice?.toFixed(2) || book.price?.toFixed(2)}</span>
                      {book.discountPrice && book.price && book.discountPrice < book.price && (
                        <span className="text-sm text-gray-500 line-through ml-2">${book.price.toFixed(2)}</span>
                      )}
                    </div>
                    <Link to={`/books/${book._id}`} className="btn btn-primary text-sm">View Book</Link>
                  </div>
                </div>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-6 -right-6 w-64 h-64 bg-secondary-100 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob"></div>
            <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-primary-100 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-2000"></div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Hero; 