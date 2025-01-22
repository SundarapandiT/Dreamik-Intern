import React, { useContext, useState, useRef, useEffect } from 'react';
import ResellerLogin from './ResellerLogin';
import logo from '../assets/logo.png';
import menuIcon from '../assets/menu.png';
import cartLogo from '../assets/cartlogo1.png';
import { useNavigate, useLocation } from 'react-router-dom';
import { CartContext } from './CartContext';
import './Nav.css'
function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { cartCount } = useContext(CartContext);
  const [showResellerLogin, setShowResellerLogin] = useState(false);
  const [showProductsDropdown, setShowProductsDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // Get current route
  const dropdownRef = useRef(null);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleCartClick = () => {
    navigate('/Order'); // Navigate to the order/cart page
  };

  const toggleProductsDropdown = () => {
    setShowProductsDropdown((prev) => !prev);
  };

  const handleProductClick = (route) => {
    navigate(route);
    setShowProductsDropdown(false); // Close the dropdown after clicking an item
  };

  // Close dropdown when clicking outside of it
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowProductsDropdown(false); // Close dropdown
      }
    };

    // Add event listener for clicks outside
    document.addEventListener('click', handleOutsideClick);

    return () => {
      // Cleanup event listener on component unmount
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  const isProductsPage = location.pathname === '/'; // Check if the current page is "Products"

  return (
    <nav id="header">
      <a href="#" className="logo-section">
        <img src={logo} alt="logo" className="logo" />
        <h2>DreamikAI</h2>
      </a>

      <div id="menu" onClick={toggleMenu}>
        <img src={menuIcon} alt="menu" id="menubar" />
      </div>

      <div id={menuOpen ? 'nav-active' : 'nav'}>
        <ul id="navbar">
          <li>
            <a href="#" onClick={() => navigate('/')} className="active">
              Go To Shop
            </a>
          </li>

          {/* Show Reseller Login in Products Page */}
          {isProductsPage && (
            <li>
              <h3
                className="active"
                id="reseller"
                onClick={() => setShowResellerLogin(true)}
              >
                Reseller Login
              </h3>
              {showResellerLogin && (
                <ResellerLogin onClose={() => setShowResellerLogin(false)} />
              )}
            </li>
          )}

          <li className="active" onClick={() => navigate('/BulkOrder')}>
            <h3 id="bulk-order" style={{ cursor: 'pointer' }}>Bulk-Order</h3>
          </li>

          {/* Conditionally render "Other Products" */}
          {!isProductsPage && (
            <li
              className={`dropdown ${showProductsDropdown ? 'dropdown-active' : ''}`}
              ref={dropdownRef}
            >
              <h3
                className="active"
                id="products"
                style={{ cursor: 'pointer' }}
                onClick={toggleProductsDropdown}
              >
                Other Products
              </h3>
              {showProductsDropdown && (
                <ul className="dropdown-menu">
                  <li onClick={() => handleProductClick('/NameSlips')}>Name Slip</li>
                  <li onClick={() => handleProductClick('/BagTag')}>Bag Tag</li>
                  <li onClick={() => handleProductClick('/Poster')}>Poster</li>
                  <li onClick={() => handleProductClick('/Sticker')}>Sticker</li>
                  {/* Reseller Login inside dropdown for other pages */}
                  <li onClick={() => setShowResellerLogin(true)}>Reseller Login</li>
                </ul>
              )}
            </li>
          )}

          <li>
            <input type="text" placeholder="Search..." id="search" />
          </li>
          <li>
            <a href="#" onClick={handleCartClick} className="cart-link">
              <img src={cartLogo} alt="cart logo" id="cartlogo" />
              <h3 id="cartnm">{cartCount}</h3>
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;