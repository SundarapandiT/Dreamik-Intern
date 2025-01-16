import React, { useEffect, useState } from 'react';
import "./personal-style.css"

const NameSlips = ({ navigateTo }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchJSONData();
  }, []);

  const fetchJSONData = async () => {
    try {
      const response = await fetch('../nameslip_data.json');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const jsonData = await response.json();

      // Check if jsonData is an array
      setData(Array.isArray(jsonData) ? jsonData : Object.values(jsonData));
    } catch (error) {
      console.error('Unable to fetch data:', error);
    }
  };

  const handleProductClick = (id) => {
    localStorage.setItem('keyid', id);
    navigateTo('Products');
  };

  return (
    <section id="product-1" className="section-p1">
      <h2>Name Slips</h2>
      <p>Creative and Fun</p>
      <div className="pro-container">
        {data.map((product) => (
          product.status === 1 ? (
            <div
              key={product.id}
              className="pro"
              id={`label${product.id}`}
              onClick={() => handleProductClick(product.id)}
            >
              <img src={product.source} alt={product.name} />
              <div className="description">
                <span>DreamiKAI Label</span>
                <h5>{product.name}</h5>
                <div className="star">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className="fas fa-star" />
                  ))}
                </div>
                <h4>Rs. {product.price}</h4>
              </div>
              <a href="#">
                <i className="fa-solid fa-cart-shopping" />
              </a>
            </div>
          ) : (
            <div
              key={product.id}
              className="pro"
              style={{ backgroundColor: 'gray', opacity: '50%' }}
            >
              <img src={product.source} alt={product.name} />
              <div className="description">
                <span>DreamiKAI Label</span>
                <h5>{product.name}</h5>
                <div className="star">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className="fas fa-star" />
                  ))}
                </div>
                <h4>Rs. {product.price}</h4>
              </div>
              <h3>Not Available</h3>
            </div>
          )
        ))}
      </div>
    </section>
  );
};

export default NameSlips;
