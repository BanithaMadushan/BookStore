import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import googleBooksApi from '../services/googleBooksApi';
import { FiSearch, FiFilter, FiChevronDown, FiChevronUp, FiGrid, FiList, FiPlus } from 'react-icons/fi';

// Array of all available categories
const categoryList = [
  {
    id: 'fiction',
    name: 'Fiction',
    description: 'Immerse yourself in captivating stories',
    image: 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?q=80&w=1287&auto=format&fit=crop',
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    query: 'subject:fiction'
  },
  {
    id: 'non-fiction',
    name: 'Non-Fiction',
    description: 'Discover true stories and factual insights',
    image: 'https://images.unsplash.com/photo-1529148482759-b35b25c5f217?q=80&w=1287&auto=format&fit=crop',
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    query: 'subject:non-fiction+history'
  },
  {
    id: 'mystery',
    name: 'Mystery & Thriller',
    description: 'Unravel suspenseful tales and puzzling cases',
    image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=1287&auto=format&fit=crop',
    color: 'from-red-500 to-rose-600',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    query: 'subject:mystery+thriller'
  },
  {
    id: 'fantasy',
    name: 'Fantasy & Sci-Fi',
    description: 'Explore magical worlds and future possibilities',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1287&auto=format&fit=crop',
    color: 'from-purple-500 to-violet-600',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    query: 'subject:fantasy+science fiction'
  },
  {
    id: 'romance',
    name: 'Romance',
    description: 'Experience love stories and passionate relationships',
    image: 'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?q=80&w=1287&auto=format&fit=crop',
    color: 'from-pink-500 to-rose-400',
    bgColor: 'bg-pink-50',
    textColor: 'text-pink-700',
    query: 'subject:romance'
  },
  {
    id: 'biography',
    name: 'Biography & Memoir',
    description: 'Discover remarkable lives and personal journeys',
    image: 'https://images.unsplash.com/photo-1521714161819-15534968fc5f?q=80&w=1287&auto=format&fit=crop',
    color: 'from-amber-500 to-yellow-600',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    query: 'subject:biography+memoir'
  },
  {
    id: 'history',
    name: 'History',
    description: 'Journey through time and human civilization',
    image: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=1287&auto=format&fit=crop',
    color: 'from-stone-500 to-stone-700',
    bgColor: 'bg-stone-50',
    textColor: 'text-stone-700',
    query: 'subject:history'
  },
  {
    id: 'science',
    name: 'Science & Technology',
    description: 'Explore scientific discoveries and technological innovations',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1287&auto=format&fit=crop',
    color: 'from-cyan-500 to-blue-500',
    bgColor: 'bg-cyan-50',
    textColor: 'text-cyan-700',
    query: 'subject:science+technology'
  }
];

// Function to fetch sample books for a category
const fetchCategoryBooks = async (category, maxResults = 4) => {
  try {
    const books = await googleBooksApi.getBooksByCategory(category.query, maxResults);
    return books;
  } catch (error) {
    console.error(`Error fetching books for ${category.name}:`, error);
    return [];
  }
};

// Category card component
const CategoryCard = ({ category, books, expanded, onToggleExpand }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="overflow-hidden rounded-xl shadow-md"
    >
      {/* Category Header */}
      <div 
        className={`${category.bgColor} p-6 cursor-pointer`}
        onClick={onToggleExpand}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className={`w-12 h-12 rounded-md overflow-hidden mr-4 bg-gradient-to-br ${category.color} flex items-center justify-center`}>
              <img 
                src={category.image} 
                alt={category.name} 
                className="w-full h-full object-cover" 
              />
            </div>
            <div>
              <h3 className={`text-xl font-display font-bold ${category.textColor}`}>
                {category.name}
              </h3>
              <p className="text-sm text-gray-600">{category.description}</p>
            </div>
          </div>
          <button className="p-2 rounded-full hover:bg-white/50 transition-colors">
            {expanded ? 
              <FiChevronUp className={category.textColor} size={20} /> : 
              <FiChevronDown className={category.textColor} size={20} />
            }
          </button>
        </div>
      </div>

      {/* Books Section */}
      {expanded && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }} 
          animate={{ opacity: 1, height: 'auto' }} 
          exit={{ opacity: 0, height: 0 }}
          className="bg-white p-6"
        >
          {books && books.length > 0 ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-gray-800">Popular in {category.name}</h4>
                <Link 
                  to={`/categories/${category.id}`} 
                  state={{ categoryQuery: category.query }}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center"
                >
                  View All <FiChevronDown className="ml-1 rotate-270" />
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {books.map(book => (
                  <Link key={book._id} to={`/books/${book._id}`} className="group">
                    <div className="h-48 overflow-hidden rounded-md shadow-sm relative mb-2">
                      {book.coverImage ? (
                        <img 
                          src={book.coverImage} 
                          alt={book.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            e.target.parentNode.classList.add('flex', 'items-center', 'justify-center', 'bg-gradient-to-br');
                            e.target.parentNode.classList.add(category.color);
                            
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
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No books available in this category.</p>
              <Link 
                to={`/categories/${category.id}`} 
                state={{ categoryQuery: category.query }}
                className="inline-block mt-2 text-blue-600 hover:text-blue-800"
              >
                Browse All {category.name} Books
              </Link>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

const AllCategoriesPage = () => {
  const [categoryData, setCategoryData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadCategoryBooks = async () => {
      setLoading(true);
      try {
        const results = {};
        
        // Fetch sample books for each category
        await Promise.all(
          categoryList.map(async (category) => {
            const books = await fetchCategoryBooks(category);
            results[category.id] = books;
          })
        );
        
        setCategoryData(results);
        // Expand the first category by default
        setExpandedCategories([categoryList[0].id]);
      } catch (err) {
        console.error('Failed to fetch category books:', err);
        setError('Failed to load category books. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadCategoryBooks();
  }, []);

  const toggleCategoryExpand = (categoryId) => {
    setExpandedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  // Filter categories based on search term
  const filteredCategories = categoryList.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow py-12">
        <div className="container-custom">
          <header className="mb-12">
            <h1 className="text-4xl font-display font-bold text-gray-900 mb-4">Book Categories</h1>
            <p className="text-gray-600 max-w-2xl mb-8">
              Explore our extensive collection of books across different genres and topics. 
              Click on a category to see featured books or browse all books within a specific category.
            </p>
            
            {/* Search Categories */}
            <div className="relative max-w-md">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search categories..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </header>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-600">Loading categories...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-md">
              {error}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredCategories.length > 0 ? (
                filteredCategories.map(category => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    books={categoryData[category.id]}
                    expanded={expandedCategories.includes(category.id)}
                    onToggleExpand={() => toggleCategoryExpand(category.id)}
                  />
                ))
              ) : (
                <div className="text-center py-12 bg-white rounded-md shadow-sm">
                  <p className="text-gray-600">No categories found matching your search.</p>
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="mt-2 text-blue-600 hover:text-blue-800"
                  >
                    Show all categories
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AllCategoriesPage; 