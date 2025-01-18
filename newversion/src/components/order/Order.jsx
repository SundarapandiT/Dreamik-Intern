import React, { useEffect, useState, useContext } from 'react';
import "./Order.css";
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../CartContext';

const Order = () => {
  const navigate = useNavigate();

  const [orderData, setOrderData] = useState([]);
  const [deliveryMode, setDeliveryMode] = useState('normal-delivery');
  const [paymentMode, setPaymentMode] = useState('online-payment');
  const [isReseller, setIsReseller] = useState(false);
  const [prodPrice, setProdPrice] = useState(0);
  const [delPrice, setDelPrice] = useState(50); // Default to normal delivery charge
  const [cod, setCod] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const { cartCount, removeFromCart } = useContext(CartContext);

  useEffect(() => {
    const storedOrderData = JSON.parse(localStorage.getItem('OrderData')) || [];
    setOrderData(storedOrderData);
    getPrice(storedOrderData);

    const resellerStatus = JSON.parse(localStorage.getItem('isReseller'));
    setIsReseller(resellerStatus);
  }, []);

  useEffect(() => {
    // Recalculate total whenever relevant states change
    const total = prodPrice + delPrice + cod;
    setTotalPrice(total);
  }, [prodPrice, delPrice, cod]);

  const getPrice = (data) => {
    let productTotal = 0;
    data.forEach((prod) => {
      const productPrice = parseInt(prod.price, 10);
      const productQuantity = parseInt(prod.quantity, 10);

      if (!isNaN(productPrice) && !isNaN(productQuantity)) {
        productTotal += productPrice;
      }
    });
    setProdPrice(productTotal);
  };

  const removeProduct = (prod) => {
    const updatedCart = orderData.filter((item) => item !== prod);
    localStorage.setItem('OrderData', JSON.stringify(updatedCart));
    setOrderData(updatedCart);
    getPrice(updatedCart);
    removeFromCart();
  };

  const handleDeliveryChange = (e) => {
    const selectedDeliveryMode = e.target.value;
    setDeliveryMode(selectedDeliveryMode);

    // Update delivery price based on selected mode
    if (selectedDeliveryMode === 'normal-delivery') {
      setDelPrice(50);
    } else if (selectedDeliveryMode === 'express-delivery') {
      setDelPrice(100);
    }
  };

  const handlePaymentChange = (e) => {
    setPaymentMode(e.target.value);
  };

  const handleCouponChange = () => {
    // Add coupon-related logic here if needed
  };

  const handleProceedToPayment = () => {
    const deliveryDetails = {
      deliveryMode,
      paymentMode,
      prodPrice,
      delPrice,
      cod,
      totalPrice,
    };

    const form = document.getElementById('address-form');
    const formData = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      address1: form.address1.value.trim(),
      pincode: form.pincode.value.trim(),
    };

    localStorage.setItem('PriceData', JSON.stringify({ prodPrice, delPrice, cod, totalPrice }));
    localStorage.setItem('PaymentDetails', JSON.stringify(deliveryDetails));
    localStorage.setItem('FormContainer', JSON.stringify(formData));

    navigate('/payment');
  };

  const handleAddProduct = () => {
    window.location.href = '/'; // Redirect to add product page
  };

  return (
    <div id="container">
      <div id="product-display">
        {orderData.map((prod, index) => (
          <div key={index} className="product-container">
            <img src={prod.image} alt={prod.Name} className="prod-image" />
            <h2 className="prod-name">{prod.Name}</h2>
            {prod.type === 'nameslip' && <h2 className="prod-type">Type: {prod.labeltype}</h2>}
            <h2 className="prod-price">Price: Rs. {parseInt(prod.price, 10)}.00</h2>
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
          <form
            id="address-form"
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.target;

              const name = form.name.value.trim();
              const phone = form.phone.value.trim();
              const address1 = form.address1.value.trim();
              const pincode = form.pincode.value.trim();

              if (!name || !phone || !address1 || !pincode) {
                alert("Please fill in all required fields!");
                return;
              }

              if (phone.length !== 10 || !/^\d+$/.test(phone)) {
                alert("Please enter a valid 10-digit phone number!");
                return;
              }

              if (pincode.length !== 6 || !/^\d+$/.test(pincode)) {
                alert("Please enter a valid 6-digit pincode!");
                return;
              }
              if (orderData.length===0)
              {
                alert("Select atleast One Product!!!");
                return;
              }
              handleProceedToPayment();
            }}
          >
            <label htmlFor="name">
              Name: <span className="astrics">*</span>
            </label>
            <input type="text" id="name" name="name" required />

            <label htmlFor="email">Email:</label>
            <input type="email" id="email" name="email" />

            <label htmlFor="phone">
              Phone Number: <span className="astrics">*</span>
            </label>
            <input type="tel" id="phone" name="phone" maxLength="10" required />

            <label htmlFor="address1">
              Address Line 1: <span className="astrics">*</span>
            </label>
            <input type="text" id="address1" name="address1" required />

            <label htmlFor="pincode">
              Pincode: <span className="astrics">*</span>
            </label>
            <input type="text" id="pincode" name="pincode" maxLength="6" required />

            <button id="proceedtopay" type="submit">
              Proceed To Payment
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Order;