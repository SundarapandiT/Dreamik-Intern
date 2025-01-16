import React, { useState } from 'react';
// import './App.css';
import './index.css';
import "./style.css";
import Navbar from './components/Nav';
import Footer from './components/Footer';
import ProductList from './components/ProductList';
import Newsletter from './components/Newsletter';
import Advertisement from './components/Advertisement';
import NameSlips from './components/nameslip/NameSlips';
import Products from './components/nameslip/Products';
import CutOutNameSlip from './components/cutoutnameslip/CutoutNameslip'; 
import ProductDetails from './components/cutoutnameslip/ProductDetails'; 
import Order from './components/order/Order'; // Assuming you will create this component
import Template from './components/cutoutnameslip/Template';

function App() {
  const [cartCount, setCartCount] = useState(0);
  const [showResellerLogin, setShowResellerLogin] = useState(false);
  const [currentView, setCurrentView] = useState('ProductList');

  // Function to handle navigation between components
  const navigateTo = (view) => {
    setCurrentView(view);
  };

  return (
    <>
      <Navbar cartCount={cartCount} navigateTo={navigateTo} />
      <Advertisement />
      {currentView === 'ProductList' && <ProductList navigateTo={navigateTo} />}
      {currentView === 'NameSlips' && <NameSlips navigateTo={navigateTo}/>}
      {currentView === 'Products' && <Products navigateTo={navigateTo} />}
      {currentView === 'CutoutNameslip' && <CutOutNameSlip navigateTo={navigateTo} />}
      {currentView === 'ProductDetails' && <ProductDetails navigateTo={navigateTo} />}
      {currentView === 'Template' && <Template navigateTo={navigateTo}/>}
      {currentView === 'Order' && <Order />} {/* Add Order view here */}
      <Newsletter />
      <Footer />
    </>
  );
}

export default App;
