import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [orderData, setOrderData] = useState([]);
  const navigate=useNavigate();

  // Fetch product data
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const response = await fetch('../products.json');
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        setProducts(data);

        // Render product samples after fetching data
        renderProductSamples(data);
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
  const view = product.name.replace(/\s+/g, '');
  console.log(view);
  
  if (view) {
    navigate("/"+view);
  } else {
    console.log('Product not found:', product.name);
  }
};


  // Render product samples dynamically
  const renderProductSamples = (productData) => {
    const psample = document.getElementById('productsample');
  
    // ✅ Clear existing products to prevent duplicates
    psample.innerHTML = '';
  
    Object.keys(productData).forEach((key) => {
      const product = productData[key];
  
      if (product.status === 1) {
        // Create product div
        const prod = document.createElement('div');
        prod.className = 'sampleprod';
  
        // Create sample image
        const sampleimg = document.createElement('img');
        sampleimg.src = product.logo;
        sampleimg.className = 'sampleimg';
        sampleimg.loading = 'lazy';
  
        // Create product name/title
        const title = document.createElement('h5');
        title.className = 'sampletitle';
        title.innerHTML = product.name;
  
        // ✅ Add out-of-stock overlay if applicable
        if (product.outOfStock) {
          const overlay = document.createElement('div');
          overlay.className = 'out-of-stock-overlay';
          overlay.innerHTML = 'Out of Stock';
  
          prod.style.pointerEvents = 'none';
          prod.style.opacity = '0.6';
  
          // Append overlay to product
          prod.appendChild(overlay);
        }
  
        // Append elements
        prod.appendChild(sampleimg);
        prod.appendChild(title);
        prod.onclick = () => handleProductClick(product);

        psample.appendChild(prod);
      }
    });
  };
  
  

  return (
    <div>
      <div id="productsample"></div>

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
