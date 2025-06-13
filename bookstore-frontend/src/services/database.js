// Mock Database Service
// This simulates a database with localStorage but with additional logging

const DB = {
  // Cart Operations
  cart: {
    getCart: (userId) => {
      try {
        console.log(`[DB] Getting cart for user ${userId}`);
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        console.log(`[DB] Found cart with ${cart.length} items`);
        return cart;
      } catch (error) {
        console.error('[DB] Error getting cart:', error);
        return [];
      }
    },
    
    saveCart: (userId, cart) => {
      try {
        console.log(`[DB] Saving cart for user ${userId} with ${cart.length} items`);
        localStorage.setItem('cart', JSON.stringify(cart));
        console.log('[DB] Cart saved successfully');
        return true;
      } catch (error) {
        console.error('[DB] Error saving cart:', error);
        return false;
      }
    },
    
    addItem: (userId, item) => {
      try {
        console.log(`[DB] Adding item to cart for user ${userId}`);
        const cart = DB.cart.getCart(userId);
        const existingItemIndex = cart.findIndex(cartItem => cartItem.book._id === item.book._id);
        
        if (existingItemIndex >= 0) {
          cart[existingItemIndex].quantity += item.quantity;
          console.log(`[DB] Updated existing item quantity to ${cart[existingItemIndex].quantity}`);
        } else {
          cart.push({
            _id: `cart-item-${Date.now()}`,
            book: item.book,
            quantity: item.quantity
          });
          console.log('[DB] Added new item to cart');
        }
        
        DB.cart.saveCart(userId, cart);
        return cart;
      } catch (error) {
        console.error('[DB] Error adding item to cart:', error);
        return [];
      }
    },
    
    updateItemQuantity: (userId, itemId, quantity) => {
      try {
        console.log(`[DB] Updating item quantity in cart for user ${userId}`);
        const cart = DB.cart.getCart(userId);
        const updatedCart = cart.map(item => 
          item._id === itemId ? { ...item, quantity } : item
        );
        
        DB.cart.saveCart(userId, updatedCart);
        console.log(`[DB] Item quantity updated to ${quantity}`);
        return updatedCart;
      } catch (error) {
        console.error('[DB] Error updating item quantity:', error);
        return [];
      }
    },
    
    removeItem: (userId, itemId) => {
      try {
        console.log(`[DB] Removing item from cart for user ${userId}`);
        const cart = DB.cart.getCart(userId);
        const updatedCart = cart.filter(item => item._id !== itemId);
        
        DB.cart.saveCart(userId, updatedCart);
        console.log('[DB] Item removed from cart');
        return updatedCart;
      } catch (error) {
        console.error('[DB] Error removing item from cart:', error);
        return [];
      }
    },
    
    clearCart: (userId) => {
      try {
        console.log(`[DB] Clearing cart for user ${userId}`);
        DB.cart.saveCart(userId, []);
        console.log('[DB] Cart cleared successfully');
        return true;
      } catch (error) {
        console.error('[DB] Error clearing cart:', error);
        return false;
      }
    }
  },
  
  // Orders Operations
  orders: {
    getOrders: (userId) => {
      try {
        console.log(`[DB] Getting orders for user ${userId}`);
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const userOrders = orders.filter(order => order.userId === userId);
        console.log(`[DB] Found ${userOrders.length} orders for user`);
        return userOrders;
      } catch (error) {
        console.error('[DB] Error getting orders:', error);
        return [];
      }
    },
    
    getOrderById: (orderId) => {
      try {
        console.log(`[DB] Getting order with ID ${orderId}`);
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const order = orders.find(o => o._id === orderId);
        
        if (order) {
          console.log('[DB] Order found');
          return order;
        } else {
          console.log('[DB] Order not found');
          return null;
        }
      } catch (error) {
        console.error('[DB] Error getting order by ID:', error);
        return null;
      }
    },
    
    createOrder: (order) => {
      try {
        console.log(`[DB] Creating new order for user ${order.userId}`);
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        orders.push(order);
        localStorage.setItem('orders', JSON.stringify(orders));
        console.log(`[DB] Order ${order._id} created successfully`);
        return order;
      } catch (error) {
        console.error('[DB] Error creating order:', error);
        return null;
      }
    },
    
    updateOrderStatus: (orderId, status) => {
      try {
        console.log(`[DB] Updating order ${orderId} status to ${status}`);
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const updatedOrders = orders.map(order => 
          order._id === orderId ? { ...order, status } : order
        );
        
        localStorage.setItem('orders', JSON.stringify(updatedOrders));
        console.log('[DB] Order status updated successfully');
        return true;
      } catch (error) {
        console.error('[DB] Error updating order status:', error);
        return false;
      }
    }
  }
};

export default DB; 