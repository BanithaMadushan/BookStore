import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import googleBooksApi from '../services/googleBooksApi';
import { FiStar, FiFilter, FiGrid, FiList, FiChevronDown, FiChevronUp, FiRefreshCw } from 'react-icons/fi';
import { Link } from 'react-router-dom';

// Book card component with better error handling
const BookCard = ({ book, index, categoryColor }) => {
  const [imageError, setImageError] = useState(false);
  
  // Extract the main category color class
  const colorClass = categoryColor ? categoryColor.split(' ')[1] : 'to-blue-600';
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="book-card overflow-hidden bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
    >
      <div className="relative pb-[140%]">
        {!imageError && book.coverImage ? (
          <img 
            src={book.coverImage} 
            alt={book.title} 
            className="absolute h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className={`absolute h-full w-full bg-gradient-to-br from-gray-200 ${colorClass} flex items-center justify-center p-4`}>
            <span className="text-white text-center font-medium">
              {book.title}
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold font-display text-gray-900 mb-1 line-clamp-2">{book.title}</h3>
        <p className="text-sm text-gray-600 mb-2 line-clamp-1">by {book.author}</p>
        <div className="flex items-center mb-3">
          <div className="flex items-center mr-2">
            {[...Array(5)].map((_, i) => (
              <FiStar 
                key={i} 
                className={`w-4 h-4 ${i < Math.round(book.rating || 4) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">({book.reviewCount || 0})</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline">
            <span className="text-lg font-bold text-primary-600">${book.discountPrice?.toFixed(2) || book.price?.toFixed(2) || '19.99'}</span>
            {book.discountPrice && book.price && book.discountPrice < book.price && (
              <span className="text-xs text-gray-500 line-through ml-2">${book.price.toFixed(2)}</span>
            )}
          </div>
          <Link to={`/books/${book._id}`} className="px-3 py-1 text-sm rounded-md bg-primary-100 text-primary-700 hover:bg-primary-200 transition-colors">
            View
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

// List view for books
const BookListItem = ({ book, index, categoryColor }) => {
  const [imageError, setImageError] = useState(false);
  
  // Extract the main category color class
  const colorClass = categoryColor ? categoryColor.split(' ')[1] : 'to-blue-600';
  
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="flex items-center bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-4 space-x-4"
    >
      <div className="flex-shrink-0 w-20 h-28 relative">
        {!imageError && book.coverImage ? (
          <img 
            src={book.coverImage} 
            alt={book.title} 
            className="w-full h-full object-cover rounded"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br from-gray-200 ${colorClass} flex items-center justify-center p-2 rounded`}>
            <span className="text-white text-xs text-center font-medium">
              {book.title.length > 30 ? book.title.substring(0, 30) + '...' : book.title}
            </span>
          </div>
        )}
      </div>
      <div className="flex-grow">
        <h3 className="text-lg font-bold font-display text-gray-900 mb-1">{book.title}</h3>
        <p className="text-sm text-gray-600 mb-1">by {book.author}</p>
        <div className="flex items-center mb-2">
          <div className="flex items-center mr-2">
            {[...Array(5)].map((_, i) => (
              <FiStar 
                key={i} 
                className={`w-3 h-3 ${i < Math.round(book.rating || 4) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">({book.reviewCount || 0} reviews)</span>
        </div>
        {book.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-2">{book.description}</p>
        )}
      </div>
      <div className="flex-shrink-0 flex flex-col items-end">
        <div className="flex items-baseline mb-2">
          <span className="text-lg font-bold text-primary-600">${book.discountPrice?.toFixed(2) || book.price?.toFixed(2) || '19.99'}</span>
          {book.discountPrice && book.price && book.discountPrice < book.price && (
            <span className="text-xs text-gray-500 line-through ml-2">${book.price.toFixed(2)}</span>
          )}
        </div>
        <Link to={`/books/${book._id}`} className="px-3 py-1 text-sm rounded-md bg-primary-100 text-primary-700 hover:bg-primary-200 transition-colors">
          View Details
        </Link>
      </div>
    </motion.div>
  );
};

const CategoryPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const categoryQuery = location.state?.categoryQuery || `subject:${id}`;
  
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [sortOption, setSortOption] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Sorting and filtering states
  const [priceRange, setPriceRange] = useState([0, 50]);
  const [ratingFilter, setRatingFilter] = useState(0);
  
  // Category details with expanded list matching AllCategoriesPage
  const categoryDetails = {
    fiction: {
      name: 'Fiction',
      description: 'Immerse yourself in captivating stories',
      color: 'from-blue-500 to-indigo-600',
      bgClass: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    'non-fiction': {
      name: 'Non-Fiction',
      description: 'Discover true stories and factual insights',
      color: 'from-emerald-500 to-teal-600',
      bgClass: 'bg-emerald-50',
      textColor: 'text-emerald-700'
    },
    mystery: {
      name: 'Mystery & Thriller',
      description: 'Unravel suspenseful tales and puzzling cases',
      color: 'from-red-500 to-rose-600',
      bgClass: 'bg-red-50',
      textColor: 'text-red-700'
    },
    fantasy: {
      name: 'Fantasy & Sci-Fi',
      description: 'Explore magical worlds and future possibilities',
      color: 'from-purple-500 to-violet-600',
      bgClass: 'bg-purple-50',
      textColor: 'text-purple-700'
    },
    romance: {
      name: 'Romance',
      description: 'Experience love stories and passionate relationships',
      color: 'from-pink-500 to-rose-400',
      bgClass: 'bg-pink-50',
      textColor: 'text-pink-700'
    },
    biography: {
      name: 'Biography & Memoir',
      description: 'Discover remarkable lives and personal journeys',
      color: 'from-amber-500 to-yellow-600',
      bgClass: 'bg-amber-50',
      textColor: 'text-amber-700'
    },
    history: {
      name: 'History',
      description: 'Journey through time and human civilization',
      color: 'from-stone-500 to-stone-700',
      bgClass: 'bg-stone-50',
      textColor: 'text-stone-700'
    },
    science: {
      name: 'Science & Technology',
      description: 'Explore scientific discoveries and technological innovations',
      color: 'from-cyan-500 to-blue-500',
      bgClass: 'bg-cyan-50',
      textColor: 'text-cyan-700'
    }
  };
  
  const category = categoryDetails[id] || {
    name: id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, ' '),
    description: `Browse our collection of ${id.replace(/-/g, ' ')} books.`,
    color: 'from-gray-500 to-gray-600',
    bgClass: 'bg-gray-50',
    textColor: 'text-gray-700'
  };

  const fetchCategoryBooks = async () => {
    try {
      setLoading(true);
      const data = await googleBooksApi.getBooksByCategory(categoryQuery.replace('subject:', ''), 20);
      setBooks(data || []);
    } catch (err) {
      console.error(`Error fetching ${id} books:`, err);
      setError(`Failed to load ${category.name} books. Please try again later.`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCategoryBooks();
  }, [id, categoryQuery]);

  // Handle refresh of books
  const handleRefresh = () => {
    setRefreshing(true);
    fetchCategoryBooks();
  };

  // Apply sorting to books
  const sortedBooks = [...books].sort((a, b) => {
    switch (sortOption) {
      case 'price-low-high':
        return (a.discountPrice || a.price) - (b.discountPrice || b.price);
      case 'price-high-low':
        return (b.discountPrice || b.price) - (a.discountPrice || a.price);
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
        return new Date(b.publishedDate || 0) - new Date(a.publishedDate || 0);
      default:
        return 0;
    }
  });

  // Apply filters to sorted books
  const filteredBooks = sortedBooks.filter(book => {
    const price = book.discountPrice || book.price;
    return (
      price >= priceRange[0] &&
      price <= priceRange[1] &&
      book.rating >= ratingFilter
    );
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Category Header */}
        <div className={`py-12 ${category.bgClass}`}>
          <div className="container-custom">
            <h1 className="text-4xl font-display font-bold text-gray-900 mb-4">{category.name}</h1>
            <p className="text-gray-600 max-w-2xl mb-8">{category.description}</p>
          </div>
        </div>

        {/* Books Grid */}
        <section className="py-8">
          <div className="container-custom">
            {loading && !refreshing ? (
              <div className="flex justify-center py-12">
                <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-3 text-gray-600">Loading books...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-500">{error}</div>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
                  <div className="flex items-center">
                    <h2 className="text-xl font-display font-bold text-gray-900">
                      {filteredBooks.length} {filteredBooks.length === 1 ? 'Book' : 'Books'} Found
                    </h2>
                    <button 
                      onClick={handleRefresh}
                      className="ml-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                      disabled={refreshing}
                    >
                      <FiRefreshCw className={`${refreshing ? 'animate-spin text-primary-600' : 'text-gray-500'}`} />
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {/* View Mode Toggle */}
                    <div className="flex items-center bg-white rounded-md shadow-sm">
                      <button 
                        onClick={() => setViewMode('grid')}
                        className={`p-2 ${viewMode === 'grid' ? 'bg-primary-100 text-primary-700' : 'text-gray-500'} rounded-l-md`}
                      >
                        <FiGrid />
                      </button>
                      <button 
                        onClick={() => setViewMode('list')}
                        className={`p-2 ${viewMode === 'list' ? 'bg-primary-100 text-primary-700' : 'text-gray-500'} rounded-r-md`}
                      >
                        <FiList />
                      </button>
                    </div>
                    
                    {/* Sort Dropdown */}
                    <div className="relative z-10">
                      <select
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value)}
                        className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="relevance">Sort by: Relevance</option>
                        <option value="price-low-high">Price: Low to High</option>
                        <option value="price-high-low">Price: High to Low</option>
                        <option value="rating">Customer Rating</option>
                        <option value="newest">Newest Arrivals</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                        <FiChevronDown className="h-4 w-4" />
                      </div>
                    </div>
                    
                    {/* Filter Button */}
                    <button 
                      onClick={() => setShowFilters(!showFilters)}
                      className={`flex items-center px-3 py-2 text-sm border rounded-md ${showFilters ? 'bg-primary-100 text-primary-700 border-primary-300' : 'border-gray-300 text-gray-700'}`}
                    >
                      <FiFilter className="mr-2" />
                      Filters
                      {showFilters ? <FiChevronUp className="ml-2" /> : <FiChevronDown className="ml-2" />}
                    </button>
                  </div>
                </div>
                
                {/* Filter Panel */}
                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-white rounded-lg shadow-md p-4 mb-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Price Range Filter */}
                        <div>
                          <h3 className="text-sm font-medium text-gray-700 mb-2">Price Range</h3>
                          <div className="flex items-center space-x-4">
                            <div className="flex-1">
                              <input
                                type="range"
                                min="0"
                                max="50"
                                step="5"
                                value={priceRange[1]}
                                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                                className="w-full"
                              />
                              <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>${priceRange[0]}</span>
                                <span>${priceRange[1]}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Rating Filter */}
                        <div>
                          <h3 className="text-sm font-medium text-gray-700 mb-2">Minimum Rating</h3>
                          <div className="flex items-center space-x-2">
                            {[0, 1, 2, 3, 4].map((rating) => (
                              <button
                                key={rating}
                                onClick={() => setRatingFilter(rating + 1)}
                                className={`flex items-center space-x-1 px-2 py-1 rounded ${
                                  ratingFilter === rating + 1 ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                <span>{rating + 1}+</span>
                                <FiStar className={ratingFilter === rating + 1 ? 'text-yellow-400 fill-current' : ''} />
                              </button>
                            ))}
                            <button
                              onClick={() => setRatingFilter(0)}
                              className="text-xs text-primary-600 hover:text-primary-800"
                            >
                              Clear
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredBooks.map((book, index) => (
                      <BookCard key={book._id} book={book} index={index} categoryColor={category.color} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredBooks.map((book, index) => (
                      <BookListItem key={book._id} book={book} index={index} categoryColor={category.color} />
                    ))}
                  </div>
                )}
                
                {filteredBooks.length === 0 && !loading && !error && (
                  <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                    <p className="text-gray-600 mb-4">No books found matching your filters.</p>
                    <button 
                      onClick={() => {
                        setPriceRange([0, 50]);
                        setRatingFilter(0);
                        setSortOption('relevance');
                      }}
                      className="px-4 py-2 bg-primary-100 text-primary-700 rounded-md hover:bg-primary-200 transition-colors"
                    >
                      Reset Filters
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CategoryPage;

 