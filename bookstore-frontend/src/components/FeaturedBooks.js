import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiStar } from 'react-icons/fi';
import { motion } from 'framer-motion';
import googleBooksApi from '../services/googleBooksApi';

const BookCard = ({ book, index }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="book-card overflow-hidden"
    >
      <div className="relative pb-3/4">
        <img 
          src={book.coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1287&auto=format&fit=crop'} 
          alt={book.title} 
          className="absolute h-full w-full object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold font-display text-gray-900 mb-1 truncate">{book.title}</h3>
        <p className="text-sm text-gray-600 mb-2">by {book.author}</p>
        <div className="flex items-center mb-3">
          <div className="flex items-center mr-2">
            {[...Array(5)].map((_, i) => (
              <FiStar 
                key={i} 
                className={`w-4 h-4 ${i < Math.round(book.rating || 4) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">({book.reviewCount || 0} reviews)</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline">
            <span className="text-lg font-bold text-primary-600">${book.discountPrice?.toFixed(2) || book.price?.toFixed(2) || '19.99'}</span>
            {book.discountPrice && book.price && book.discountPrice < book.price && (
              <span className="text-xs text-gray-500 line-through ml-2">${book.price.toFixed(2)}</span>
            )}
          </div>
          <Link to={`/books/${book._id}`} className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

const FeaturedBooks = () => {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedBooks = async () => {
      try {
        setLoading(true);
        const data = await googleBooksApi.getFeaturedBooks();
        setFeaturedBooks(data || []);
      } catch (err) {
        console.error('Error fetching featured books:', err);
        setError('Failed to load featured books. Please try again later.');
        // Fallback data if API fails
        setFeaturedBooks([
          {
            _id: '1',
            title: 'The Midnight Library',
            author: 'Matt Haig',
            rating: 4.5,
            reviewCount: 1289,
            price: 24.99,
            discountPrice: 18.99,
            coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1287&auto=format&fit=crop'
          },
          {
            _id: '2',
            title: 'Educated',
            author: 'Tara Westover',
            rating: 4.7,
            reviewCount: 2156,
            price: 22.99,
            discountPrice: 17.99,
            coverImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=1287&auto=format&fit=crop'
          },
          {
            _id: '3',
            title: 'Where the Crawdads Sing',
            author: 'Delia Owens',
            rating: 4.8,
            reviewCount: 3541,
            price: 26.99,
            discountPrice: 21.99,
            coverImage: 'https://images.unsplash.com/photo-1495640452828-3df6795cf69b?q=80&w=1287&auto=format&fit=crop'
          },
          {
            _id: '4',
            title: 'The Silent Patient',
            author: 'Alex Michaelides',
            rating: 4.6,
            reviewCount: 1876,
            price: 23.99,
            discountPrice: 19.99,
            coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=1287&auto=format&fit=crop'
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedBooks();
  }, []);

  return (
    <section className="py-16 bg-gray-50">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-display font-bold text-gray-900">Featured Books</h2>
          <Link to="/books" className="flex items-center text-primary-600 hover:text-primary-700 font-medium">
            View all books <FiArrowRight className="ml-2" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="loader"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {featuredBooks.map((book, index) => (
              <BookCard key={book._id} book={book} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedBooks; 