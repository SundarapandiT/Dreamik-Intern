import React, { useState } from 'react';
// import './App.css';
import './index.css';
import "./style.css";
import Navbar from './components/Nav';
import Footer from './components/Footer';
import ProductList from './components/ProductList';
import Newsletter from './components/Newsletter';
import Advertisement from './components/Advertisement';
import CutoutNameslip from './components/cutoutnameslip/CutoutNameslip'; 
import ProductDetails from './components/cutoutnameslip/ProductDetails'; 
import Order from './components/order/Order'; // Assuming you will create this component
import Nameslips from './components/nameslip/NameSlips';
import CustamizableBagTage from './components/bagtag/CustamizableBagTage';
import Products from './components/nameslip/Products';
import NSPersonalize from './components/nameslip/NSPersonalize';
import BulkOrder from './components/bulkorder/BulkOrder'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
function App() {
  // const [cartCount, setCartCount] = useState(0);
  const [showResellerLogin, setShowResellerLogin] = useState(false);


  // Function to handle navigation between components
 

  return (
    <>
       <Router>
      <Navbar/>
      <Advertisement />
      <Routes>
        <Route path="/" element={<ProductList />} />
        <Route path="/CutoutNameslip" element={<CutoutNameslip />} />
        <Route path="/ProductDetails/:id" element={<ProductDetails />} />
        <Route path="/Nameslips" element={<Nameslips />} />
        <Route path="/Products/:id" element={<Products />} />
        <Route path="/CustamizableBagTage" element={<CustamizableBagTage />} /> {/* Route for Bagtag */}
        <Route path="/NSPersonalize/:id" element={<NSPersonalize />} />
        <Route path="/Order" element={<Order />} />
        <Route path="/BulkOrder" element={<BulkOrder />}/>
      </Routes>
      <Newsletter />
      <Footer />
    </Router>
    </>
  );
}

export default App;