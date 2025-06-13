import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiStar, FiShoppingCart, FiHeart, FiShare2, FiChevronDown, FiChevronUp, FiAlertCircle } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import googleBooksApi from '../services/googleBooksApi';

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { addToCart } = useCart();
  
  const [book, setBook] = useState(null);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for UI controls
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        setLoading(true);
        
        // Use our Google Books API service
        const bookData = await googleBooksApi.getBookById(id);
        setBook(bookData);
        
        // Fetch related books based on the book's category or subject
        if (bookData.categories && bookData.categories.length > 0) {
          const category = bookData.categories[0];
          const relatedBooksData = await googleBooksApi.getBooksByCategory(category, 4);
          
          // Filter out the current book from related books
          const filteredRelatedBooks = relatedBooksData.filter(book => book._id !== id);
          setRelatedBooks(filteredRelatedBooks.slice(0, 4));
        }
        
        // Generate mock reviews for demonstration
        const mockReviews = Array(5).fill(null).map((_, i) => ({
          _id: `review-${i + 1}`,
          userId: {
            _id: `user-${i + 1}`,
            name: `User ${i + 1}`,
            avatar: `https://randomuser.me/api/portraits/${i % 2 ? 'women' : 'men'}/${i + 1}.jpg`,
          },
          rating: 3 + Math.floor(Math.random() * 3),
          reviewText: 'This book was amazing! I couldn\'t put it down. The characters were well-developed and the plot kept me engaged throughout.',
          createdAt: new Date(Date.now() - i * 86400000).toISOString(),
        }));
        
        setReviews(mockReviews);
      } catch (err) {
        console.error('Error fetching book details:', err);
        setError('Failed to load book details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookDetails();
  }, [id]);
  
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= 10) {
      setQuantity(value);
    }
  };
  
  const increaseQuantity = () => {
    if (quantity < 10) {
      setQuantity(quantity + 1);
    }
  };
  
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const handleAddToCart = async () => {
    if (!currentUser) {
      navigate('/login', { state: { from: `/books/${id}` } });
      return;
    }
    
    try {
      setAddingToCart(true);
      
      // In a real implementation with a backend, you'd use:
      // await cartApi.addToCart(id, quantity);
      
      // Add to cart using CartContext
      addToCart(book, quantity);
      
      setSuccessMessage('Book added to cart successfully!');
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError('Failed to add book to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="loader"></div>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (error || !book) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <FiAlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h1>
            <p className="text-gray-600 mb-6">{error || 'Book not found'}</p>
            <button
              onClick={() => navigate('/books')}
              className="btn btn-primary"
            >
              Browse Books
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow container-custom py-12">
        {/* Success message */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{successMessage}</span>
          </motion.div>
        )}
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-10">
            {/* Book Cover and Gallery */}
            <div>
              <div className="mb-8 overflow-hidden rounded-lg">
                <img 
                  src={book.coverImage} 
                  alt={book.title} 
                  className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-500 shadow-lg"
                />
              </div>
            </div>
            
            {/* Book Details */}
            <div>
              <div className="mb-6">
                <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-2">
                  {book.title}
                </h1>
                <p className="text-xl text-gray-600 mb-4">by {book.author}</p>
                
                <div className="flex items-center mb-6">
                  <div className="flex items-center mr-2">
                    {[...Array(5)].map((_, i) => (
                      <FiStar 
                        key={i} 
                        className={`w-5 h-5 ${i < Math.floor(Number(book.rating)) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                      />
                    ))}
                    {(Number(book.rating) % 1) !== 0 && (
                      <div className="relative">
                        <FiStar className="w-5 h-5 text-gray-300" />
                        <div 
                          className="absolute top-0 left-0 overflow-hidden"
                          style={{ width: `${(Number(book.rating) % 1) * 100}%` }}
                        >
                          <FiStar className="w-5 h-5 text-yellow-400 fill-current" />
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="text-gray-600">{Number(book.rating).toFixed(1)} ({book.reviewCount} reviews)</span>
                </div>
                
                <div className="mb-6">
                  <div className="flex items-baseline mb-2">
                    {book.discountPrice && book.discountPrice < book.price ? (
                      <>
                        <span className="text-3xl font-bold text-blue-600">${parseFloat(book.discountPrice).toFixed(2)}</span>
                        <span className="text-lg text-gray-500 line-through ml-2">${parseFloat(book.price).toFixed(2)}</span>
                        <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded">
                          {Math.round((1 - parseFloat(book.discountPrice) / parseFloat(book.price)) * 100)}% OFF
                        </span>
                      </>
                    ) : (
                      <span className="text-3xl font-bold text-blue-600">${parseFloat(book.price).toFixed(2)}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {book.inStock ? (
                      <span className="text-green-600 font-semibold">In Stock</span>
                    ) : (
                      <span className="text-red-600 font-semibold">Out of Stock</span>
                    )}
                  </p>
                </div>
                
                <div className="mb-8">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <button 
                        onClick={decreaseQuantity}
                        className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                      >
                        -
                      </button>
                      <input 
                        type="number" 
                        min="1" 
                        max="10" 
                        value={quantity}
                        onChange={handleQuantityChange}
                        className="w-12 text-center border-0 focus:ring-0"
                      />
                      <button 
                        onClick={increaseQuantity}
                        className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                    
                    <button
                      onClick={handleAddToCart}
                      disabled={addingToCart || !book.inStock}
                      className="btn btn-primary flex-grow flex items-center justify-center py-3 disabled:opacity-50"
                    >
                      <FiShoppingCart className="mr-2" />
                      {addingToCart ? 'Adding...' : 'Add to Cart'}
                    </button>
                  </div>
                  
                  <div className="flex space-x-4">
                    <button className="flex items-center text-gray-600 hover:text-primary-600">
                      <FiHeart className="mr-1" />
                      <span>Wishlist</span>
                    </button>
                    <button className="flex items-center text-gray-600 hover:text-primary-600">
                      <FiShare2 className="mr-1" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Format</p>
                      <p className="font-medium">{book.format}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Pages</p>
                      <p className="font-medium">{book.pages}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Language</p>
                      <p className="font-medium">{book.language}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">ISBN</p>
                      <p className="font-medium">{book.isbn}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="border-t border-gray-200">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('description')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'description'
                    ? 'border-b-2 border-primary-600 text-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('details')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'details'
                    ? 'border-b-2 border-primary-600 text-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Details
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'reviews'
                    ? 'border-b-2 border-primary-600 text-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Reviews ({reviews.length})
              </button>
            </div>
            
            <div className="p-6">
              {activeTab === 'description' && (
                <div>
                  <p className="text-gray-700 mb-4">
                    {showFullDescription 
                      ? book.description 
                      : `${book.description.slice(0, 300)}${book.description.length > 300 ? '...' : ''}`
                    }
                  </p>
                  {book.description.length > 300 && (
                    <button
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      className="text-primary-600 font-medium flex items-center"
                    >
                      {showFullDescription ? (
                        <>Read Less <FiChevronUp className="ml-1" /></>
                      ) : (
                        <>Read More <FiChevronDown className="ml-1" /></>
                      )}
                    </button>
                  )}
                </div>
              )}
              
              {activeTab === 'details' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Book Details</h3>
                    <table className="w-full">
                      <tbody>
                        <tr>
                          <td className="py-2 text-gray-600">Title</td>
                          <td className="py-2 font-medium">{book.title}</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-gray-600">Author</td>
                          <td className="py-2 font-medium">{book.author}</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-gray-600">Format</td>
                          <td className="py-2 font-medium">{book.format}</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-gray-600">Pages</td>
                          <td className="py-2 font-medium">{book.pages}</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-gray-600">Language</td>
                          <td className="py-2 font-medium">{book.language}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Publishing</h3>
                    <table className="w-full">
                      <tbody>
                        <tr>
                          <td className="py-2 text-gray-600">Publisher</td>
                          <td className="py-2 font-medium">{book.publisher}</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-gray-600">Publication Date</td>
                          <td className="py-2 font-medium">{new Date(book.publicationDate).toLocaleDateString()}</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-gray-600">ISBN</td>
                          <td className="py-2 font-medium">{book.isbn}</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-gray-600">Category</td>
                          <td className="py-2 font-medium capitalize">{book.category}</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-gray-600">Tags</td>
                          <td className="py-2 font-medium">
                            {book.tags.map((tag, index) => (
                              <span key={tag} className="inline-block bg-gray-100 rounded-full px-3 py-1 text-xs font-semibold text-gray-700 mr-2 mb-2">
                                {tag}
                              </span>
                            ))}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {activeTab === 'reviews' && (
                <div>
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-2">Customer Reviews</h3>
                    <div className="flex items-center mb-4">
                      <div className="flex items-center mr-4">
                        {[...Array(5)].map((_, i) => (
                          <FiStar 
                            key={i} 
                            className={`w-5 h-5 ${i < Math.floor(Number(book.rating)) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-lg font-semibold">{Number(book.rating).toFixed(1)} out of 5</span>
                    </div>
                    <p className="text-gray-600">{book.reviewCount} global ratings</p>
                  </div>
                  
                  {reviews.length > 0 ? (
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div key={review._id} className="border-b border-gray-200 pb-6 last:border-b-0">
                          <div className="flex items-center mb-3">
                            <img 
                              src={review.userId.avatar} 
                              alt={review.userId.name} 
                              className="w-10 h-10 rounded-full mr-3"
                            />
                            <div>
                              <p className="font-medium">{review.userId.name}</p>
                              <p className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center mb-3">
                            {[...Array(5)].map((_, i) => (
                              <FiStar 
                                key={i} 
                                className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                          <p className="text-gray-700">{review.reviewText}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">No reviews yet. Be the first to review this book!</p>
                  )}
                  
                  {currentUser && (
                    <div className="mt-8">
                      <button className="btn btn-primary">Write a Review</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Related Books */}
        {relatedBooks.length > 0 && (
          <div>
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedBooks.map((relatedBook) => (
                <div 
                  key={relatedBook._id}
                  className="book-card cursor-pointer"
                  onClick={() => navigate(`/books/${relatedBook._id}`)}
                >
                  <div className="relative pb-3/4">
                    <img 
                      src={relatedBook.coverImage} 
                      alt={relatedBook.title} 
                      className="absolute h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold font-display text-gray-900 mb-1 truncate">{relatedBook.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">by {relatedBook.author}</p>
                    <div className="flex items-baseline">
                      <span className="text-lg font-bold text-primary-600">
                        ${relatedBook.discountPrice ? parseFloat(relatedBook.discountPrice).toFixed(2) : parseFloat(relatedBook.price).toFixed(2)}
                      </span>
                      {relatedBook.discountPrice && relatedBook.discountPrice < relatedBook.price && (
                        <span className="text-xs text-gray-500 line-through ml-2">${parseFloat(relatedBook.price).toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default BookDetails; 