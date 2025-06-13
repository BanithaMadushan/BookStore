import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiFilter, FiX, FiGrid, FiList, FiStar, FiRefreshCw } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import googleBooksApi from '../services/googleBooksApi';

const BookCard = ({ book, isGridView }) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  const handleClick = () => {
    navigate(`/books/${book._id}`);
  };

  // Select a gradient color based on book category
  const getGradientColor = () => {
    const categories = book.categories || [];
    const category = categories[0]?.toLowerCase() || '';
    
    if (category.includes('fiction')) return 'from-blue-500 to-indigo-600';
    if (category.includes('mystery') || category.includes('thriller')) return 'from-red-500 to-rose-600';
    if (category.includes('fantasy') || category.includes('sci-fi')) return 'from-purple-500 to-violet-600';
    if (category.includes('biography') || category.includes('memoir')) return 'from-amber-500 to-yellow-600';
    if (category.includes('history')) return 'from-stone-500 to-stone-700';
    if (category.includes('science')) return 'from-cyan-500 to-blue-500';
    if (category.includes('romance')) return 'from-pink-500 to-rose-400';
    
    // Default gradient
    return 'from-emerald-500 to-teal-600';
  };

  // Grid view card
  if (isGridView) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        className="book-card bg-white shadow-md rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300"
        onClick={handleClick}
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
            <div className={`absolute h-full w-full bg-gradient-to-br ${getGradientColor()} flex items-center justify-center p-4`}>
              <span className="text-white text-center font-medium line-clamp-4">
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
          </div>
        </div>
      </motion.div>
    );
  }

  // List view card
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white shadow-md rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
      onClick={handleClick}
    >
      <div className="flex">
        <div className="flex-shrink-0 w-32 md:w-48 relative">
          {!imageError && book.coverImage ? (
          <img
              src={book.coverImage}
            alt={book.title}
            className="h-full w-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className={`h-full w-full bg-gradient-to-br ${getGradientColor()} flex items-center justify-center p-4`}>
              <span className="text-white text-center text-sm font-medium">
                {book.title.length > 40 ? book.title.substring(0, 40) + '...' : book.title}
              </span>
            </div>
          )}
        </div>
        <div className="p-4 md:p-6 flex-grow">
          <h3 className="text-lg font-bold font-display text-gray-900 mb-1">{book.title}</h3>
          <p className="text-sm text-gray-600 mb-2">by {book.author}</p>
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{book.description}</p>
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
            <button className="px-3 py-1 text-sm bg-primary-100 text-primary-700 rounded-md hover:bg-primary-200 transition-colors">
              View Details
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const FilterSection = ({ title, options, selected, onChange }) => {
  return (
    <div className="mb-6">
      <h3 className="text-gray-800 font-semibold mb-3">{title}</h3>
      <div className="space-y-2">
        {options.map((option) => (
          <label key={option.value} className="flex items-center">
            <input
              type="checkbox"
              checked={selected.includes(option.value)}
              onChange={() => onChange(option.value)}
              className="form-checkbox h-4 w-4 text-primary-600 rounded"
            />
            <span className="ml-2 text-gray-700">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

const BrowseBooks = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { category } = useParams();
  
  // Get query params
  const queryParams = new URLSearchParams(location.search);
  
  // State for books data
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // State for pagination
  const [page, setPage] = useState(parseInt(queryParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(12);
  
  // State for search and filters
  const [searchQuery, setSearchQuery] = useState(queryParams.get('search') || '');
  const [selectedCategories, setSelectedCategories] = useState(
    category ? [category] : (queryParams.get('categories')?.split(',') || [])
  );
  const [selectedPriceRanges, setSelectedPriceRanges] = useState(
    queryParams.get('price')?.split(',') || []
  );
  const [selectedRatings, setSelectedRatings] = useState(
    queryParams.get('rating')?.split(',') || []
  );
  const [sortBy, setSortBy] = useState(queryParams.get('sort') || 'random');
  
  // View mode (grid or list)
  const [isGridView, setIsGridView] = useState(true);
  
  // Mobile filter visibility
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  
  const categoryOptions = [
    { label: 'Fiction', value: 'fiction' },
    { label: 'Non-Fiction', value: 'non-fiction' },
    { label: 'Science Fiction', value: 'sci-fi' },
    { label: 'Fantasy', value: 'fantasy' },
    { label: 'Mystery', value: 'mystery' },
    { label: 'Biography', value: 'biography' },
    { label: 'History', value: 'history' },
    { label: 'Romance', value: 'romance' },
    { label: 'Science & Technology', value: 'science' },
    { label: 'Self-Help', value: 'self-help' },
  ];
  
  const priceRangeOptions = [
    { label: 'Under $10', value: 'under-10' },
    { label: '$10 - $20', value: '10-20' },
    { label: '$20 - $30', value: '20-30' },
    { label: 'Over $30', value: 'over-30' },
  ];
  
  const ratingOptions = [
    { label: '4 Stars & Up', value: '4-up' },
    { label: '3 Stars & Up', value: '3-up' },
    { label: '2 Stars & Up', value: '2-up' },
    { label: '1 Star & Up', value: '1-up' },
  ];
  
  const sortOptions = [
    { label: 'Random', value: 'random' },
    { label: 'Newest Arrivals', value: 'newest' },
    { label: 'Price: Low to High', value: 'price-asc' },
    { label: 'Price: High to Low', value: 'price-desc' },
    { label: 'Average Rating', value: 'rating' },
    { label: 'Popularity', value: 'popularity' },
  ];
  
  // Update URL query params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategories.length > 0) params.set('categories', selectedCategories.join(','));
    if (selectedPriceRanges.length > 0) params.set('price', selectedPriceRanges.join(','));
    if (selectedRatings.length > 0) params.set('rating', selectedRatings.join(','));
    if (page > 1) params.set('page', page.toString());
    if (sortBy !== 'random') params.set('sort', sortBy);
    
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  }, [searchQuery, selectedCategories, selectedPriceRanges, selectedRatings, page, sortBy, navigate, location.pathname]);
  
  // Fetch books with filters
    const fetchBooks = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Construct query based on filters
        let query = searchQuery || 'popular books';
        
        // Add category filter if selected
        if (selectedCategories.length) {
          query = `${query} subject:${selectedCategories[0]}`;
        }
        
        // Fetch books using our Google Books API service
        const books = await googleBooksApi.searchBooks(query, limit);
        
      // Randomize books order before applying other sorting
      const randomizedBooks = sortBy === 'random' 
        ? [...books].sort(() => Math.random() - 0.5) 
        : [...books];
      
        // Client-side sorting since Google Books API has limited sorting options
      let sortedBooks = [...randomizedBooks];
        
        if (sortBy === 'price-asc') {
          sortedBooks.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
        } else if (sortBy === 'price-desc') {
          sortedBooks.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
        } else if (sortBy === 'rating') {
          sortedBooks.sort((a, b) => b.rating - a.rating);
        }
        
        // Client-side filtering for price ranges
        if (selectedPriceRanges.length > 0) {
          sortedBooks = sortedBooks.filter(book => {
            const price = book.discountPrice || book.price;
            
            return selectedPriceRanges.some(range => {
              if (range === 'under-10') return price < 10;
              if (range === '10-20') return price >= 10 && price < 20;
              if (range === '20-30') return price >= 20 && price < 30;
              if (range === 'over-30') return price >= 30;
              return true;
            });
          });
        }
        
        // Client-side filtering for ratings
        if (selectedRatings.length > 0) {
          sortedBooks = sortedBooks.filter(book => {
            return selectedRatings.some(range => {
              if (range === '4-up') return book.rating >= 4;
              if (range === '3-up') return book.rating >= 3;
              if (range === '2-up') return book.rating >= 2;
              if (range === '1-up') return book.rating >= 1;
              return true;
            });
          });
        }
        
        setBooks(sortedBooks);
      setTotalPages(Math.ceil(sortedBooks.length / limit) || 1);
      } catch (err) {
        console.error('Error fetching books:', err);
      setError('Failed to fetch books. Please try again later.');
      } finally {
        setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [searchQuery, selectedCategories, selectedPriceRanges, selectedRatings, sortBy, page, limit]);

  const handleRefresh = () => {
    setRefreshing(true);
    // Set sorting to random when refreshing to guarantee a new random order
    setSortBy('random');
    fetchBooks();
  };
  
  const toggleCategory = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
    setPage(1); // Reset to first page when changing filters
  };
  
  const togglePriceRange = (range) => {
    setSelectedPriceRanges(prev => 
      prev.includes(range)
        ? prev.filter(r => r !== range) 
        : [...prev, range]
    );
    setPage(1);
  };
  
  const toggleRating = (rating) => {
    setSelectedRatings(prev => 
      prev.includes(rating)
        ? prev.filter(r => r !== rating) 
        : [...prev, rating]
    );
    setPage(1);
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };
  
  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedPriceRanges([]);
    setSelectedRatings([]);
    setSearchQuery('');
    setSortBy('random');
    setPage(1);
  };
  
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setPage(1);
  };

  // Display paginated books
  const paginatedBooks = books.slice((page - 1) * limit, page * limit);
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow py-8 md:py-12">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row">
            {/* Left sidebar - Filters (desktop) */}
            <div className="hidden lg:block lg:w-1/4 pr-8">
              <div className="sticky top-24 bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Filters</h2>
                  <button 
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Clear All
                  </button>
              </div>
              
              <FilterSection
                  title="Categories" 
                options={categoryOptions}
                selected={selectedCategories}
                onChange={toggleCategory}
              />
              
              <FilterSection
                title="Price Range"
                options={priceRangeOptions}
                selected={selectedPriceRanges}
                onChange={togglePriceRange}
              />
              
              <FilterSection
                title="Rating"
                options={ratingOptions}
                selected={selectedRatings}
                onChange={toggleRating}
              />
            </div>
          </div>
          
            {/* Mobile filter button */}
            <div className="lg:hidden mb-4">
                <button
                onClick={() => setShowMobileFilter(!showMobileFilter)}
                className="w-full flex items-center justify-center px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm"
              >
                <FiFilter className="mr-2" />
                <span>Filters</span>
                {showMobileFilter ? <FiX className="ml-2" /> : null}
              </button>
            </div>
            
            {/* Mobile filters */}
            <AnimatePresence>
              {showMobileFilter && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="lg:hidden bg-white p-6 rounded-lg shadow-sm mb-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800">Filters</h2>
                    <button 
                      onClick={clearFilters}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Clear All
              </button>
            </div>
            
            <FilterSection
                    title="Categories" 
              options={categoryOptions}
              selected={selectedCategories}
              onChange={toggleCategory}
            />
            
            <FilterSection
              title="Price Range"
              options={priceRangeOptions}
              selected={selectedPriceRanges}
              onChange={togglePriceRange}
            />
            
            <FilterSection
              title="Rating"
              options={ratingOptions}
              selected={selectedRatings}
              onChange={toggleRating}
            />
            
                <button 
                    onClick={() => setShowMobileFilter(false)}
                    className="w-full mt-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                    Apply Filters
                </button>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Main content */}
            <div className="lg:w-3/4">
              {/* Search and sort */}
              <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
                  <div className="flex-grow relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiSearch className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search for books..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Search
                  </button>
                </form>
                
                <div className="flex flex-wrap justify-between items-center">
                  <div className="flex items-center mb-4 md:mb-0">
                    <div className="mr-4">
                      <select
                        value={sortBy}
                        onChange={handleSortChange}
                        className="pl-3 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {sortOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex items-center space-x-1 bg-gray-100 rounded-md p-1">
                      <button
                        onClick={() => setIsGridView(true)}
                        className={`p-2 rounded-md ${isGridView ? 'bg-white shadow-sm' : ''}`}
                        aria-label="Grid view"
                      >
                        <FiGrid className={isGridView ? 'text-blue-600' : 'text-gray-500'} />
                      </button>
                      <button
                        onClick={() => setIsGridView(false)}
                        className={`p-2 rounded-md ${!isGridView ? 'bg-white shadow-sm' : ''}`}
                        aria-label="List view"
                      >
                        <FiList className={!isGridView ? 'text-blue-600' : 'text-gray-500'} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="text-gray-600 mr-2">
                      {books.length} {books.length === 1 ? 'book' : 'books'} found
                    </span>
                    <button 
                      onClick={handleRefresh}
                      className="flex items-center p-2 rounded-md hover:bg-gray-100 transition-colors text-sm"
                      disabled={refreshing}
                      title="Show different random books"
                    >
                      <FiRefreshCw className={`${refreshing ? 'animate-spin text-blue-600' : 'text-gray-500'} mr-1`} />
                      <span className="hidden sm:inline">Randomize</span>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Books grid/list */}
              {loading && !refreshing ? (
                <div className="flex justify-center items-center py-12">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-3 text-gray-600">Loading books...</span>
                </div>
              ) : error ? (
                <div className="bg-red-50 text-red-700 p-6 rounded-lg text-center">
                  {error}
                  <button 
                    onClick={handleRefresh}
                    className="ml-4 underline"
                  >
                    Try again
                  </button>
                </div>
              ) : books.length === 0 ? (
                <div className="bg-white p-6 rounded-lg shadow-sm text-center py-12">
                  <p className="text-gray-600 mb-4">No books found matching your criteria.</p>
                  <button 
                    onClick={clearFilters}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <>
                  <div className={isGridView ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-6"}>
                    {paginatedBooks.map((book, index) => (
                      <BookCard key={book._id} book={book} isGridView={isGridView} />
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-12">
                      <nav className="flex items-center space-x-2">
                        <button
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          disabled={page === 1}
                          className={`px-3 py-1 rounded-md ${page === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}
                        >
                          Previous
                        </button>
                        
                        {Array.from({ length: totalPages }).map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setPage(i + 1)}
                            className={`w-8 h-8 rounded-md ${
                              page === i + 1
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-700 hover:bg-blue-50'
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                        
              <button 
                          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                          disabled={page === totalPages}
                          className={`px-3 py-1 rounded-md ${page === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}
              >
                          Next
              </button>
                      </nav>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BrowseBooks; 