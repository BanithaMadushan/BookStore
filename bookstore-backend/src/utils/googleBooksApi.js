const axios = require('axios');

/**
 * Search for books in the Google Books API
 * @param {String} query - Search query
 * @param {Number} maxResults - Maximum number of results (default: 10)
 * @returns {Promise<Array>} - Array of book objects
 */
exports.searchBooks = async (query, maxResults = 10) => {
  try {
    const response = await axios.get(
      `https://www.googleapis.com/books/v1/volumes`,
      {
        params: {
          q: query,
          maxResults
        },
      }
    );

    if (!response.data.items) {
      return [];
    }

    return response.data.items.map((item) => {
      const volumeInfo = item.volumeInfo;
      const saleInfo = item.saleInfo || {};
      
      // Structure the book data
      return {
        googleBooksId: item.id,
        title: volumeInfo.title || 'Unknown Title',
        authors: volumeInfo.authors || ['Unknown Author'],
        publisher: volumeInfo.publisher || 'Unknown Publisher',
        publishedDate: volumeInfo.publishedDate || null,
        description: volumeInfo.description || 'No description available',
        pageCount: volumeInfo.pageCount || 0,
        categories: volumeInfo.categories || ['Uncategorized'],
        averageRating: volumeInfo.averageRating || 0,
        ratingsCount: volumeInfo.ratingsCount || 0,
        imageLinks: volumeInfo.imageLinks || {
          thumbnail: 'https://via.placeholder.com/128x192?text=No+Image',
        },
        language: volumeInfo.language || 'en',
        previewLink: volumeInfo.previewLink || '',
        infoLink: volumeInfo.infoLink || '',
        isEbook: saleInfo.isEbook || false,
        saleability: saleInfo.saleability || 'NOT_FOR_SALE',
        listPrice: saleInfo.listPrice || { amount: 0, currencyCode: 'USD' },
        retailPrice: saleInfo.retailPrice || { amount: 0, currencyCode: 'USD' },
      };
    });
  } catch (error) {
    console.error('Error fetching books from Google API:', error);
    throw new Error('Failed to fetch books from Google API');
  }
};

/**
 * Get a book by its Google Books ID
 * @param {String} id - Google Books ID
 * @returns {Promise<Object>} - Book object
 */
exports.getBookById = async (id) => {
  try {
    const response = await axios.get(
      `https://www.googleapis.com/books/v1/volumes/${id}`
    );

    const volumeInfo = response.data.volumeInfo;
    const saleInfo = response.data.saleInfo || {};

    return {
      googleBooksId: response.data.id,
      title: volumeInfo.title || 'Unknown Title',
      authors: volumeInfo.authors || ['Unknown Author'],
      publisher: volumeInfo.publisher || 'Unknown Publisher',
      publishedDate: volumeInfo.publishedDate || null,
      description: volumeInfo.description || 'No description available',
      pageCount: volumeInfo.pageCount || 0,
      categories: volumeInfo.categories || ['Uncategorized'],
      averageRating: volumeInfo.averageRating || 0,
      ratingsCount: volumeInfo.ratingsCount || 0,
      imageLinks: volumeInfo.imageLinks || {
        thumbnail: 'https://via.placeholder.com/128x192?text=No+Image',
      },
      language: volumeInfo.language || 'en',
      previewLink: volumeInfo.previewLink || '',
      infoLink: volumeInfo.infoLink || '',
      isEbook: saleInfo.isEbook || false,
      saleability: saleInfo.saleability || 'NOT_FOR_SALE',
      listPrice: saleInfo.listPrice || { amount: 0, currencyCode: 'USD' },
      retailPrice: saleInfo.retailPrice || { amount: 0, currencyCode: 'USD' },
    };
  } catch (error) {
    console.error(`Error fetching book with ID ${id} from Google API:`, error);
    throw new Error('Failed to fetch book details from Google API');
  }
}; 