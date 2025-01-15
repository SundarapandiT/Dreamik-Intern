// ProductList.jsx
import React, { useEffect, useState } from 'react';

const ProductList = ({ navigateTo }) => {
  const [products, setProducts] = useState([]);
  const [orderData, setOrderData] = useState([]);

  // Fetch product data
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const response = await fetch('../products.json');
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        localStorage.setItem('ProductData', JSON.stringify(data));
        setProducts(data);
      } catch (error) {
        console.error('Error fetching product data:', error);
      }
    };

    const loadOrderData = () => {
      const orderData = JSON.parse(localStorage.getItem('OrderData')) || [];
      setOrderData(orderData);
    };

    fetchProductData();
    loadOrderData();
  }, []);

  // Handle product click
  const handleProductClick = (product) => {
    if (product.name === "Cutout Nameslip") {
      navigateTo('CutOutNameSlip');
    } else {
      alert('Other product clicked!');
    }
  };

  return (
    <div>
      <h2>Product List</h2>
      <div id="products">
        {Object.keys(products).map((key) => {
          const product = products[key];
          return (
            <div
              key={key}
              className="product"
              onClick={() => handleProductClick(product)}
              style={product.outOfStock ? { pointerEvents: 'none', opacity: 0.5 } : {}}
            >
              <img src={product.image} alt={product.name} className="productimg" loading="lazy" />
              <h3 className="productname">{product.name}</h3>
              <h3 className="productprice">Rs. {product.price}</h3>
              {product.outOfStock && <div className="out-of-stock-badge">Out of Stock</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductList;
