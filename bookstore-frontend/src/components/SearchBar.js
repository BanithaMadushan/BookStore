import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';

const SearchBar = ({ className }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/books/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className={`relative ${className}`}>
      <input
        type="text"
        placeholder="Search for books, authors, categories..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="input pr-10 w-full"
        aria-label="Search"
      />
      <button
        type="submit"
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600"
        aria-label="Submit search"
      >
        <FiSearch className="w-5 h-5" />
      </button>
    </form>
  );
};

export default SearchBar; 