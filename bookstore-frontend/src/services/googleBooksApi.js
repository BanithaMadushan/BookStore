// Google Books API service
// AIzaSyBmLIGfFnUuDZ2qYP7x8ymg25LI0DydHt0
const API_KEY = '';
const BASE_URL = 'https://www.googleapis.com/books/v1/volumes';

export const googleBooksApi = {
  // Fetch books by query
  searchBooks: async (query, maxResults = 12) => {
    try {
      // Add a random parameter to get more varied results each time
      const randomParam = Math.floor(Math.random() * 1000);
      const startIndex = Math.floor(Math.random() * 40); // Random start index for more variety
      
      const response = await fetch(
        `${BASE_URL}?q=${encodeURIComponent(query)}&maxResults=${maxResults}&startIndex=${startIndex}&key=${API_KEY}&random=${randomParam}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch books from Google Books API');
      }
      
      const data = await response.json();
      return formatBookData(data.items || []);
    } catch (error) {
      console.error('Error fetching books from Google Books API:', error);
      throw error;
    }
  },
  
  // Fetch featured/new books (using "new releases" as a query)
  getFeaturedBooks: async (maxResults = 8) => {
    return await googleBooksApi.searchBooks('new popular fiction', maxResults);
  },
  
  // Fetch books by category
  getBooksByCategory: async (category, maxResults = 12) => {
    const randomStartIndex = Math.floor(Math.random() * 30); // Random start index for variety within categories
    return await googleBooksApi.searchBooks(`subject:${category}`, maxResults);
  },
  
  // Get book details by ID
  getBookById: async (bookId) => {
    try {
      const response = await fetch(`${BASE_URL}/${bookId}?key=${API_KEY}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch book details from Google Books API');
      }
      
      const data = await response.json();
      return formatSingleBookData(data);
    } catch (error) {
      console.error('Error fetching book details from Google Books API:', error);
      throw error;
    }
  }
};

// Helper function to format book data from Google Books API to match our app's format
const formatBookData = (items) => {
  return items.map(item => formatSingleBookData(item));
};

// Format a single book
const formatSingleBookData = (item) => {
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
  
  const volumeInfo = item.volumeInfo || {};
  
  return {
    _id: item.id,
    title: volumeInfo.title || 'Unknown Title',
    author: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Unknown Author',
    description: volumeInfo.description || 'No description available',
    coverImage: volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail || null,
    categories: volumeInfo.categories || [],
    publishedDate: volumeInfo.publishedDate || null,
    publisher: volumeInfo.publisher || 'Unknown Publisher',
    pageCount: volumeInfo.pageCount || 0,
    price: originalPrice,
    discountPrice: discountPrice,
    rating: parseFloat(rating),
    reviewCount: reviewCount,
    // Additional data from Google Books
    language: volumeInfo.language || 'en',
    previewLink: volumeInfo.previewLink || '',
    infoLink: volumeInfo.infoLink || '',
    // Add some extra fields to match our application's expected format
    isbn: volumeInfo.industryIdentifiers?.[0]?.identifier || 'Unknown ISBN',
    stock: Math.floor(Math.random() * 100) + 1, // Random stock between 1 and 100
    format: 'Paperback',
    inStock: true, // Set books to be in stock by default
    tags: volumeInfo.categories || ['fiction'],
    publicationDate: volumeInfo.publishedDate || new Date().toISOString().split('T')[0],
  };
};

export default googleBooksApi; 