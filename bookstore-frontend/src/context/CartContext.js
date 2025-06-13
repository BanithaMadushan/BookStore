import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  
  // Get cart key based on user
  const getCartKey = () => {
    return currentUser ? `cart_${currentUser._id}` : 'cart_guest';
  };

  // Get temporary cart key for storing cart during logout
  const getTempCartKey = () => {
    return currentUser ? `temp_cart_${currentUser._id}` : 'temp_cart_guest';
  };
  
  // Load cart from localStorage on initial render or when user changes
  useEffect(() => {
    const loadCart = () => {
      try {
        const cartKey = getCartKey();
        const tempCartKey = getTempCartKey();
        
        // Try to load from main cart first
        let savedCart = JSON.parse(localStorage.getItem(cartKey) || '[]');
        
        // If no items in main cart, try to load from temp cart
        if (savedCart.length === 0) {
          const tempCart = JSON.parse(localStorage.getItem(tempCartKey) || '[]');
          if (tempCart.length > 0) {
            savedCart = tempCart;
            // Restore temp cart to main cart
            localStorage.setItem(cartKey, JSON.stringify(tempCart));
            localStorage.removeItem(tempCartKey);
          }
        }
        
        setCartItems(savedCart);
        
        // Calculate total items in cart
        const count = savedCart.reduce((total, item) => total + item.quantity, 0);
        setCartCount(count);
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        setCartItems([]);
        setCartCount(0);
      }
    };
    
    loadCart();
  }, [currentUser]); // Reload cart when user changes

  // Save cart to both main and temp storage
  const saveCart = (cart) => {
    const cartKey = getCartKey();
    const tempCartKey = getTempCartKey();
    localStorage.setItem(cartKey, JSON.stringify(cart));
    localStorage.setItem(tempCartKey, JSON.stringify(cart));
  };
  
  // Add item to cart
  const addToCart = (book, quantity) => {
    const existingCart = [...cartItems];
    
    // Check if the book is already in the cart
    const existingItemIndex = existingCart.findIndex(item => item.book._id === book._id);
    
    if (existingItemIndex >= 0) {
      // Update quantity if the book is already in the cart
      existingCart[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      existingCart.push({
        _id: `cart-item-${Date.now()}`,
        book: {
          _id: book._id,
          title: book.title,
          author: book.author,
          coverImage: book.coverImage,
          price: book.price,
          discountPrice: book.discountPrice
        },
        quantity: quantity
      });
    }
    
    // Update state and localStorage
    setCartItems(existingCart);
    saveCart(existingCart);
    
    // Update cart count
    const newCount = existingCart.reduce((total, item) => total + item.quantity, 0);
    setCartCount(newCount);
    
    return existingCart;
  };
  
  // Update quantity of an item in cart
  const updateCartItemQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return cartItems;
    
    const updatedCart = cartItems.map(item => 
      item._id === itemId ? { ...item, quantity: newQuantity } : item
    );
    
    // Update state and localStorage
    setCartItems(updatedCart);
    saveCart(updatedCart);
    
    // Update cart count
    const newCount = updatedCart.reduce((total, item) => total + item.quantity, 0);
    setCartCount(newCount);
    
    return updatedCart;
  };
  
  // Remove item from cart
  const removeFromCart = (itemId) => {
    const updatedCart = cartItems.filter(item => item._id !== itemId);
    
    // Update state and localStorage
    setCartItems(updatedCart);
    saveCart(updatedCart);
    
    // Update cart count
    const newCount = updatedCart.reduce((total, item) => total + item.quantity, 0);
    setCartCount(newCount);
    
    return updatedCart;
  };
  
  // Clear the entire cart
  const clearCart = () => {
    setCartItems([]);
    setCartCount(0);
    const cartKey = getCartKey();
    const tempCartKey = getTempCartKey();
    localStorage.setItem(cartKey, JSON.stringify([]));
    localStorage.setItem(tempCartKey, JSON.stringify([]));
  };
  
  // Calculate cart totals
  const calculateTotals = () => {
    const subtotal = cartItems.reduce((total, item) => {
      const price = item.book.discountPrice || item.book.price;
      return total + (price * item.quantity);
    }, 0);
    
    const shipping = subtotal > 50 ? 0 : 4.99;
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shipping + tax;
    
    return { subtotal, shipping, tax, total };
  };
  
  const value = {
    cartItems,
    cartCount,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    calculateTotals
  };
  
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext; 