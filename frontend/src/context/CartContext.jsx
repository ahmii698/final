import { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [previousUserId, setPreviousUserId] = useState(null);

  // Get storage key based on user
  const getCartKey = (userId = null) => {
    if (userId) {
      return `cart_user_${userId}`;
    }
    if (isAuthenticated && user) {
      return `cart_user_${user.id}`;
    }
    return null; // No key for guest - don't save guest cart
  };

  const getWishlistKey = (userId = null) => {
    if (userId) {
      return `wishlist_user_${userId}`;
    }
    if (isAuthenticated && user) {
      return `wishlist_user_${user.id}`;
    }
    return null;
  };

  // Load data when user changes or on mount
  useEffect(() => {
    const loadData = () => {
      try {
        if (isAuthenticated && user) {
          // User is logged in - load their cart
          const savedCart = localStorage.getItem(getCartKey(user.id));
          const savedWishlist = localStorage.getItem(getWishlistKey(user.id));
          
          if (savedCart) {
            setCartItems(JSON.parse(savedCart));
          } else {
            setCartItems([]);
          }
          if (savedWishlist) {
            setWishlistItems(JSON.parse(savedWishlist));
          } else {
            setWishlistItems([]);
          }
        } else {
          // Not logged in - empty cart (don't show other user's cart)
          setCartItems([]);
          setWishlistItems([]);
        }
      } catch (error) {
        console.error('Error loading from localStorage:', error);
        setCartItems([]);
        setWishlistItems([]);
      }
      setIsLoaded(true);
    };
    
    loadData();
  }, [isAuthenticated, user?.id]); // Reload when user changes

  // Save to localStorage whenever cart changes (only when logged in)
  useEffect(() => {
    if (isLoaded && isAuthenticated && user) {
      try {
        localStorage.setItem(getCartKey(user.id), JSON.stringify(cartItems));
        const totalCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
        setCartCount(totalCount);
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }
  }, [cartItems, isLoaded, isAuthenticated, user]);

  // Save to localStorage whenever wishlist changes (only when logged in)
  useEffect(() => {
    if (isLoaded && isAuthenticated && user) {
      try {
        localStorage.setItem(getWishlistKey(user.id), JSON.stringify(wishlistItems));
        setWishlistCount(wishlistItems.length);
      } catch (error) {
        console.error('Error saving wishlist to localStorage:', error);
      }
    }
  }, [wishlistItems, isLoaded, isAuthenticated, user]);

  // Add to cart (only works when logged in)
  const addToCart = (product, quantity = 1) => {
    if (!isAuthenticated) {
      // Redirect to login or show message
      alert('Please login to add items to cart');
      return false;
    }
    
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: (item.quantity || 1) + quantity }
            : item
        );
      } else {
        return [...prevItems, { ...product, quantity }];
      }
    });
    return true;
  };

  // Remove from cart
  const removeFromCart = (productId) => {
    if (!isAuthenticated) return;
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  // Update quantity
  const updateQuantity = (productId, quantity) => {
    if (!isAuthenticated) return;
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  // Add to wishlist (only works when logged in)
  const addToWishlist = (product) => {
    if (!isAuthenticated) {
      alert('Please login to add items to wishlist');
      return false;
    }
    
    setWishlistItems(prevItems => {
      const exists = prevItems.find(item => item.id === product.id);
      if (exists) {
        return prevItems;
      }
      return [...prevItems, product];
    });
    return true;
  };

  // Remove from wishlist
  const removeFromWishlist = (productId) => {
    if (!isAuthenticated) return;
    setWishlistItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  // Check if in wishlist
  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.id === productId);
  };

  // Check if in cart
  const isInCart = (productId) => {
    return cartItems.some(item => item.id === productId);
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <CartContext.Provider value={{
      cartItems,
      wishlistItems,
      cartCount,
      wishlistCount,
      addToCart,
      removeFromCart,
      updateQuantity,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      isInCart
    }}>
      {children}
    </CartContext.Provider>
  );
};