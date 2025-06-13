import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { googleBooksApi } from '../services/googleBooksApi';

const categories = [
  {
    id: 'fiction',
    name: 'Fiction',
    description: 'Immerse yourself in captivating stories',
    image: 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?q=80&w=1287&auto=format&fit=crop',
    color: 'from-blue-500 to-indigo-600',
    query: 'subject:fiction',
    startIndex: 0
  },
  {
    id: 'non-fiction',
    name: 'Non-Fiction',
    description: 'Discover true stories and factual insights',
    image: 'https://images.unsplash.com/photo-1529148482759-b35b25c5f217?q=80&w=1287&auto=format&fit=crop',
    color: 'from-emerald-500 to-teal-600',
    query: 'subject:non-fiction+history',
    startIndex: 0
  },
  {
    id: 'mystery',
    name: 'Mystery & Thriller',
    description: 'Unravel suspenseful tales and puzzling cases',
    image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=1287&auto=format&fit=crop',
    color: 'from-red-500 to-rose-600',
    query: 'subject:mystery+thriller',
    startIndex: 0
  },
  {
    id: 'fantasy',
    name: 'Fantasy & Sci-Fi',
    description: 'Explore magical worlds and future possibilities',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1287&auto=format&fit=crop',
    color: 'from-purple-500 to-violet-600',
    query: 'subject:fantasy+science fiction',
    startIndex: 0
  }
];

// Add function to customize book searches for each category
const searchBooksByCategory = async (category, maxResults = 4) => {
  const apiUrl = 'https://www.googleapis.com/books/v1/volumes';
  const API_KEY = 'AIzaSyB1dLl831oCkchvCJepHCi6x_bVA_rlkOM'; // Using the API key from googleBooksApi.js
  
  try {
    const queryParams = new URLSearchParams({
      q: category.query,
      maxResults: maxResults,
      startIndex: category.startIndex,
      orderBy: 'relevance', // Using relevance for better results
      key: API_KEY
    });
    
    const response = await fetch(`${apiUrl}?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch books for category: ${category.name}`);
    }
    
    const data = await response.json();
    const books = data.items || [];
    
    // Process the books to match our app's format
    return books.map(item => {
      const volumeInfo = item.volumeInfo || {};
      
      // Generate a random price between 10 and 30
      const originalPrice = Math.floor(Math.random() * 20) + 10 + 0.99;
      // Apply a random discount (0-30%)
      const discountPercent = Math.floor(Math.random() * 30);
      const discountPrice = discountPercent > 0 
        ? parseFloat((originalPrice * (1 - (discountPercent / 100))).toFixed(2)) 
        : null;
      
      // Generate a random rating and review count
      const rating = (Math.random() * 2 + 3).toFixed(1); // Between 3.0 and 5.0
      const reviewCount = Math.floor(Math.random() * 1000) + 50; // Between 50 and 1050
      
      // Get a more reliable image URL or provide fallback
      let coverImage = null;
      
      // Try different image sources from the API
      if (volumeInfo.imageLinks) {
        // Try to get the highest resolution available
        coverImage = volumeInfo.imageLinks.extraLarge || 
                    volumeInfo.imageLinks.large || 
                    volumeInfo.imageLinks.medium || 
                    volumeInfo.imageLinks.small || 
                    volumeInfo.imageLinks.thumbnail || 
                    volumeInfo.imageLinks.smallThumbnail;
        
        // If we have an image URL, make sure it's HTTPS
        if (coverImage && coverImage.startsWith('http:')) {
          coverImage = coverImage.replace('http:', 'https:');
        }
      }
      
      return {
        _id: item.id,
        title: volumeInfo.title || 'Unknown Title',
        author: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Unknown Author',
        description: volumeInfo.description || 'No description available',
        coverImage: coverImage,
        categories: volumeInfo.categories || [],
        publishedDate: volumeInfo.publishedDate || null,
        publisher: volumeInfo.publisher || 'Unknown Publisher',
        pageCount: volumeInfo.pageCount || 0,
        price: originalPrice,
        discountPrice: discountPrice,
        rating: parseFloat(rating),
        reviewCount: reviewCount,
        language: volumeInfo.language || 'en',
        previewLink: volumeInfo.previewLink || '',
        infoLink: volumeInfo.infoLink || '',
        isbn: volumeInfo.industryIdentifiers?.[0]?.identifier || 'Unknown ISBN',
        stock: Math.floor(Math.random() * 100) + 1,
        format: 'Paperback',
        inStock: true,
        tags: volumeInfo.categories || [category.id],
      };
    });
  } catch (error) {
    console.error(`Error fetching books for ${category.name}:`, error);
    return [];
  }
};

const Categories = () => {
  const [categoryBooks, setCategoryBooks] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBooksForCategories = async () => {
      setLoading(true);
      try {
        const results = {};
        
        // Fetch books for each category in parallel with custom search function
        await Promise.all(
          categories.map(async (category) => {
            // Use custom search function instead of googleBooksApi service
            const books = await searchBooksByCategory(category, 4);
            results[category.id] = books;
          })
        );
        
        setCategoryBooks(results);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch category books:', err);
        setError('Failed to load books. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBooksForCategories();
  }, []);

  // Function to reload a specific category with new books
  const reloadCategory = async (categoryId) => {
    try {
      // Find the category
      const category = categories.find(cat => cat.id === categoryId);
      if (!category) return;
      
      // Update start index to get different books
      category.startIndex += 4;
      
      // Fetch new books
      const books = await searchBooksByCategory(category, 4);
      
      // Update state with new books
      setCategoryBooks(prev => ({
        ...prev,
        [categoryId]: books
      }));
    } catch (err) {
      console.error(`Failed to reload category ${categoryId}:`, err);
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="container-custom">
        <h2 className="text-3xl font-display font-bold text-gray-900 mb-8 text-center">Browse by Category</h2>
        <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
          Discover books across various genres and topics. Find exactly what you're looking for or explore something new.
        </p>

        {loading && (
          <div className="text-center py-10">
            <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="mt-2 text-gray-600">Loading books...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-10">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative overflow-hidden rounded-xl shadow-md"
            >
              <div className="relative group h-64 rounded-t-xl overflow-hidden">
              <div className="absolute inset-0 bg-black opacity-40 group-hover:opacity-30 transition-opacity z-10"></div>
              <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-60 group-hover:opacity-70 transition-opacity z-0`}></div>
              <img 
                src={category.image} 
                alt={category.name} 
                className="w-full h-full object-cover absolute inset-0 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 text-white">
                <h3 className="text-2xl font-display font-bold mb-1">{category.name}</h3>
                <p className="text-sm text-white/90 mb-4">{category.description}</p>
                  <div className="flex gap-2">
                <Link 
                  to={`/categories/${category.id}`} 
                  state={{ categoryQuery: category.query }}
                      className="inline-block bg-white/20 backdrop-blur-sm text-white font-medium px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
                    >
                      View All
                    </Link>
                    <button
                      onClick={() => !loading && reloadCategory(category.id)}
                      className="inline-block bg-white/20 backdrop-blur-sm text-white font-medium px-3 py-2 rounded-lg hover:bg-white/30 transition-colors"
                      disabled={loading}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Books section - display 4 books per category */}
              <div className="bg-white p-4 rounded-b-xl">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-lg font-semibold text-gray-800">Popular in {category.name}</h4>
                </div>
                
                {!loading && categoryBooks[category.id] && categoryBooks[category.id].length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {categoryBooks[category.id].map((book) => (
                      <Link key={book._id} to={`/books/${book._id}`} className="group">
                        <div className="h-40 overflow-hidden rounded-md shadow-sm relative mb-2">
                          {book.coverImage ? (
                            <img 
                              src={book.coverImage} 
                              alt={book.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                // If image fails to load, replace with a generated cover
                                e.target.onerror = null;
                                e.target.style.display = 'none';
                                e.target.parentNode.classList.add('flex', 'items-center', 'justify-center', 'bg-gradient-to-br');
                                e.target.parentNode.classList.add(category.color);
                                
                                // Create and append text node if it doesn't exist
                                if (!e.target.parentNode.querySelector('.fallback-title')) {
                                  const titleSpan = document.createElement('span');
                                  titleSpan.className = 'fallback-title text-white text-xs font-medium px-2 text-center';
                                  titleSpan.textContent = book.title;
                                  e.target.parentNode.appendChild(titleSpan);
                                }
                              }}
                            />
                          ) : (
                            <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${category.color}`}>
                              <span className="fallback-title text-white text-xs font-medium px-2 text-center">
                                {book.title.length > 30 ? book.title.substring(0, 30) + '...' : book.title}
                              </span>
                            </div>
                          )}
                          
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                            <span className="text-white text-xs font-medium line-clamp-1">{book.title}</span>
                          </div>
                        </div>
                        <h5 className="text-xs font-medium text-gray-900 truncate">{book.title}</h5>
                        <p className="text-xs text-gray-500 truncate">{book.author}</p>
                </Link>
                    ))}
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center">
                    {loading ? (
                      <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                    ) : (
                      <div className="text-center">
                        <p className="text-sm text-gray-500 mb-2">No books available</p>
                        <button 
                          onClick={() => reloadCategory(category.id)}
                          className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded transition-colors"
                        >
                          Try Again
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories; 