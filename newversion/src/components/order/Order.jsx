import React, { useEffect, useState } from 'react';
import "./Order.css";

const Order = () => {
  const [orderData, setOrderData] = useState([]);
  const [deliveryMode, setDeliveryMode] = useState('normal-delivery');
  const [paymentMode, setPaymentMode] = useState('online-payment');
  const [isReseller, setIsReseller] = useState(false);
  const [prodPrice, setProdPrice] = useState(0);
  const [delPrice, setDelPrice] = useState(0);
  const [cod, setCod] = useState(40);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const storedOrderData = JSON.parse(localStorage.getItem('OrderData')) || [];
    setOrderData(storedOrderData);
    const userDetails = JSON.parse(localStorage.getItem('UserDetails'));
    const resellerStatus = JSON.parse(localStorage.getItem('isReseller'));
    setIsReseller(resellerStatus);
    getPrice(storedOrderData);
  }, []);

  const getPrice = (data) => {
    let productTotal = 0;
    data.forEach((prod) => {
      productTotal += parseInt(prod.price.replace(/[^0-9]/g, ''), 10) * prod.quantity;
    });
    setProdPrice(productTotal);
    const total = productTotal + delPrice + cod;
    setTotalPrice(total);
  };

  const removeProduct = async (prodToRemove) => {
    const updatedOrderData = orderData.filter((prod) => prod !== prodToRemove);
    setOrderData(updatedOrderData);
    await localStorage.setItem('OrderData', JSON.stringify(updatedOrderData));
    getPrice(updatedOrderData);
  };

  const handleDeliveryChange = (e) => {
    setDeliveryMode(e.target.value);
    getPrice(orderData);
  };

  const handlePaymentChange = (e) => {
    setPaymentMode(e.target.value);
    getPrice(orderData);
  };

  const handleCouponChange = () => {
    // Add coupon-related logic here if needed
  };

  const handleProceedToPayment = () => {
    // Handle payment redirection or logic
  };

  const handleAddProduct = () => {
    window.location.href = '/index.html'; // Redirect to add product page
  };

  return (
    <div id="container">
      <div id="product-display">
        {orderData.map((prod, index) => (
          <div key={index} className="product-container">
            <img src={prod.image} alt={prod.Name} className="prod-image" />
            <h2 className="prod-name">{prod.Name}</h2>
            {prod.type === 'nameslip' && <h2 className="prod-type">Type: {prod.labeltype}</h2>}
            <h2 className="prod-price">Price: Rs. {parseInt(prod.price.replace(/[^0-9]/g, ''), 10)}.00</h2>
            <h2 className="prod-qtn">Quantity: {prod.quantity}</h2>
            {prod.size === 'medium One Extra Sheet' && <h3 className="prod-sheet">Sheets: 3 + 1</h3>}
            <button className="prod-remove" onClick={() => removeProduct(prod)}>
              Remove
            </button>
          </div>
        ))}
        <button id="addprod" onClick={handleAddProduct}>
          Add Product
        </button>
      </div>

      <div id="user-details">
        <div id="options">
          <div id="delivery">
            <div id="delivery-mode">
              <h2 className="topic">Delivery Mode</h2>
              <div className="mode">
                <label>
                  <input
                    type="radio"
                    name="delivery"
                    value="normal-delivery"
                    checked={deliveryMode === 'normal-delivery'}
                    onChange={handleDeliveryChange}
                  />
                  Normal Delivery
                </label>
                <label>
                  <input
                    type="radio"
                    name="delivery"
                    value="express-delivery"
                    checked={deliveryMode === 'express-delivery'}
                    onChange={handleDeliveryChange}
                  />
                  Express Delivery
                </label>
              </div>
            </div>
            <div id="payment-mode">
              <h2 className="topic">Payment Mode</h2>
              <div className="mode">
                <label>
                  <input
                    type="radio"
                    name="payment"
                    value="online-payment"
                    checked={paymentMode === 'online-payment'}
                    onChange={handlePaymentChange}
                  />
                  Online Payment
                </label>
                <label>
                  <input
                    type="radio"
                    name="payment"
                    value="partial-payment"
                    checked={paymentMode === 'partial-payment'}
                    onChange={handlePaymentChange}
                  />
                  Partial Cash On Delivery
                </label>
                <label>
                  <input
                    type="radio"
                    name="payment"
                    value="cashon-payment"
                    checked={paymentMode === 'cashon-payment'}
                    onChange={handlePaymentChange}
                  />
                  Full Cash On Delivery
                </label>
              </div>
            </div>
            <div id="Couponbox">
              <h2 className="topic">Coupons</h2>
              <div className="mode">
                <input type="text" id="coupon" name="coupon" onChange={handleCouponChange} />
                <button id="submitcoupon">Get Offer</button>
              </div>
            </div>
          </div>
          <div id="price">
            <h3 className="topic">Payment</h3>
            <h3>Product Price: Rs. {prodPrice}</h3>
            <h3 id="delivery-charge-h3">Delivery Charge: Rs. {delPrice}</h3>
            <h3 id="cod-charge-h3">CoD Charge: Rs. {cod}</h3>
            <h3>Total Payment: Rs. {totalPrice}</h3>
          </div>
        </div>

        <div id="form-container">
          <h2 className="topic">Delivery Details</h2>
        <div id="address-form">
          <label htmlFor="name">Name: <span className="astrics">*</span></label>
          <input type="text" id="name" name="name" required />
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" name="email" required />
          <label htmlFor="phone">Phone Number: <span className="astrics">*</span></label>
          <input type="tel" id="phone" name="phone" required />
          <label htmlFor="address1">Address Line 1: <span className="astrics">*</span></label>
          <input type="text" id="address1" name="address1" required />
          <label htmlFor="pincode">Pincode: <span className="astrics">*</span></label>
          <input type="text" id="pincode" name="pincode" maxLength="6" required />
          <button id="proceedtopay" onClick={handleProceedToPayment}>
            Proceed To Payment
          </button>
        </div>
      </div>

      </div>
    </div>
  );
};

export default Order;
