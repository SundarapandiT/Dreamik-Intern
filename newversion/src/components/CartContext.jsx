import React, { createContext, useState } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartCount, setCartCount] = useState(() => {
      const storedCart = JSON.parse(localStorage.getItem('OrderData')) || [];
      return storedCart.length; // Initialize count based on stored data
    });
  
    const addToCart = () => {
      const newCartCount = cartCount + 1;
      setCartCount(newCartCount);
      localStorage.setItem('CartCount', JSON.stringify(newCartCount));
    };
  
    const removeFromCart = () => {
      const newCartCount = Math.max(cartCount - 1, 0); // Ensure count doesn't go negative
      setCartCount(newCartCount);
      localStorage.setItem('CartCount', JSON.stringify(newCartCount));
    };
  
    return (
      <CartContext.Provider value={{ cartCount, addToCart, removeFromCart }}>
        {children}
      </CartContext.Provider>
    );
  };
  