import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import '@fortawesome/fontawesome-free/css/all.min.css';


const Nameslip = () => {

  const [products, setProducts] = useState([]);
  const navigate=useNavigate();

  useEffect(() => {
    const fetchJSONData = () => {
      fetch('../nameslip_data.json')
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          const filteredProducts = Object.keys(data)
            .filter(key => data[key].status === 1)
            .map(key => ({
              ...data[key],
              id: key,
            }));
          setProducts(filteredProducts);
        })
        .catch((error) => console.error('Unable to fetch data:', error));
    };

    fetchJSONData();
  }, []);

  const handleProductClick = (id) => {
    localStorage.setItem('keyid', id);
    navigate(`/Products/:${id}`);  // Navigate to ProductDetails view
  };

  return (
    <section id="product-1" className="section-p1">
      <h2>Name Slips</h2>
      <p>Creative and Fun</p>
      <div className="pro-container">
        {products.map((product) => (
          <div className="pro" key={product.id} onClick={() => handleProductClick(product.id)}>
            <img src={product.source} alt={product.name} />
            <div className="description">
              <span>DreamiKAI Label</span>
              <h5>{product.name}</h5>
              <div className="star">
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
              </div>
              <h4>Rs.{product.price}</h4>
            </div>
            <a href="#" className="cart">
              <i className="fa-solid fa-cart-shopping"></i>
            </a>
          </div>
        ))}
      </div>
      
        
    </section>
  );
};

export default Nameslip;