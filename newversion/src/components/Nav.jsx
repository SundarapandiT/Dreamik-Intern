import React, { useContext,useState, useEffect } from 'react';
import ResellerLogin from './ResellerLogin';
import logo from '../assets/logo.png';
import menuIcon from '../assets/menu.png';
import cartLogo from '../assets/cartlogo1.png';
import { useNavigate } from 'react-router-dom';
import { CartContext } from './CartContext';
// import "../style.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  // const [cartCount, setCartCount] = useState(0);
  const { cartCount,addCart } = useContext(CartContext);
  const [showResellerLogin, setShowResellerLogin] = useState(false);
  const navigate=useNavigate();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleCartClick = () => {
    // Use navigateTo to switch to the "Order" view or cart-related component
    navigate('/Order');  // 'Order' can be a custom component or state that represents your cart
  };
//  useEffect(() => {
//     const storedCartCount = JSON.parse(localStorage.getItem('CartCount')) || 0;
//     setCartCount(storedCartCount);
//  },[]);

  return (
    <nav id="header">
      <a href="#" className="logo-section">
        <img src={logo} alt="logo" className="logo" />
        <h2>DreamikAI</h2>
      </a>

      <div id="menu" onClick={toggleMenu}>
        <img src={menuIcon} alt="menu" id="menubar" />
      </div>

      <div id="nav" className={menuOpen ? "nav-active" : ""}>
        <ul id="navbar">
          <li>
            <a href="#" onClick={()=>navigate('/')} className="active">
              Go To Shop
            </a>
          </li>
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
          <li className="active" onClick={() => navigate('/BulkOrder')}>
          <h3 id="bulk-order" style={{ cursor: 'pointer' }}>Bulk-Order</h3>
          </li>

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

