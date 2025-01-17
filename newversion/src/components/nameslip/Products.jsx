import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Products = () => {
  const [product, setProduct] = useState(null);
  const navigate=useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const url = '../nameslip_data.json';
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();
        localStorage.setItem('data', JSON.stringify(data));
        return data;
      } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
      }
    };

    const loadProductDetails = async () => {
      const data = await fetchData();
      const key = localStorage.getItem('keyid');
      if (key && data[key]) {
        setProduct(data[key]);
        document.title = data[key].name;
      }
    };

    loadProductDetails();
  }, []);

  const handlePersonalizeAndAddToCart = (id) => {
    
      localStorage.setItem('keyid', id);
      navigate(`/NSPersonalize/:${id}`);  // Navigate to NSPersonalize view
    };
  

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <section id="prodetails" className="section-p1">
      <div className="single-pro-image">
        <img src={product.source} alt={product.name} width="100%" id="MainImg" />
      </div>
      <div className="single-pro-details" id="details">
        <h6>Home / Product</h6>
        <h4>{product.name}</h4>
        <h2>Rs. {product.price}</h2>

        <h4>Product Details</h4>
        <span>{product.name}</span>
        <br />
        <span>{product.props.join(', ')}</span>
        <br />
        <button className="P-btn" id="targetbtn" onClick={() => handlePersonalizeAndAddToCart(product.id)} >
          Personalize and Add To Cart
        </button>
      </div>
    </section>
  );
};

export default Products;