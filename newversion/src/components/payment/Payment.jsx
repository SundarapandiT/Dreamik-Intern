import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './Payment.css';

const Payment = () => {
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState([]);
  const [priceDetails, setPriceDetails] = useState({});
  const [deliveryMode, setDeliveryMode] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [paymentDetails, setPaymentDetails] = useState({});
  const [testPayCode, setTestPayCode] = useState("");
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [formContainer, setFormContainer] = useState({});

  useEffect(() => {
    // Load Razorpay SDK dynamically
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => setSdkLoaded(true);
    script.onerror = () => console.error("Failed to load Razorpay SDK");
    document.body.appendChild(script);

    // Retrieve data from localStorage
    const storedOrderData = JSON.parse(localStorage.getItem("OrderData")) || [];
    const storedPriceDetails = JSON.parse(localStorage.getItem("PriceData")) || {};
    const storedPaymentDetails = JSON.parse(localStorage.getItem("PaymentDetails")) || {};
    const storedFormContainer = JSON.parse(localStorage.getItem("FormContainer")) || {};

    // Set retrieved data to state
    setOrderData(storedOrderData);
    setPriceDetails(storedPriceDetails);
    setPaymentMode(storedPaymentDetails?.paymentMode || "");
    setPaymentDetails(storedPaymentDetails);
    setDeliveryMode(storedPaymentDetails?.deliveryMode || "");
    setFormContainer(storedFormContainer);
  }, []);

  const handleTestPayCodeChange = (e) => {
    setTestPayCode(e.target.value);
  };

  const handlePayment = () => {
    if (!sdkLoaded) {
      alert("Payment gateway not loaded. Please try again later.");
      return;
    }

    let finalAmount = priceDetails.totalPrice || 0;

    // Adjust payment amount for valid test coupon codes
    if (testPayCode.startsWith("$TESTPAY") && testPayCode.length === 19) {
      finalAmount = finalAmount > 100 ? finalAmount / 100 : finalAmount / 10;
    }

    const options = {
      key: "rzp_test_7y77238", // Replace with your Razorpay Key ID
      amount: finalAmount * 100, // Convert amount to the smallest unit (paisa)
      currency: "INR",
      name: "DreamikAI",
      description: "Payment for your order",
      image: "/image/logo.png", // Replace with your logo URL
      handler: async (response) => {
        // Save payment details in localStorage
        const paymentData = {
          PaymentID: response.razorpay_payment_id,
          PaymentAmount: finalAmount,
          PaymentMode: paymentMode,
          DeliveryMode: deliveryMode,
        };

        await localStorage.setItem("PaymentDetails", JSON.stringify(paymentData));
        alert("Payment successful! Payment ID: " + response.razorpay_payment_id);
        navigate("/OrderConfirmation/OrderConfirmation");
      },
      prefill: {
        name: formContainer?.name || "",
        email: formContainer?.email || "",
        contact: formContainer?.phone || "",
      },
      theme: {
        color: "#3399cc",
      },
    };

    const razorpayInstance = new window.Razorpay(options);
    razorpayInstance.open();
  };

  return (
    <div>
      <h1>Dreamik AI Payment Gateway</h1>

      {/* optdiv section */}
      <div id="optdiv">
        <h2>Payment Gateways</h2>
        <select name="paymentgateway" id="paymentgateway" disabled>
          <option value="razorpay">Razor Pay</option>
        </select>

        <input
          type="text"
          id="testpay"
          placeholder="Test Payment Coupon"
          value={testPayCode}
          onChange={handleTestPayCodeChange}
        />
      </div>

      {/* Other sections in flex layout */}
      <div id="details-container" style={{ display: "flex", gap: "20px" }}>
        <div id="order-details">
          <h2>Order Details</h2>
          <ul>
            {orderData.map((prod, index) => (
              <li key={index}>
                {prod.Name} - Rs. {prod.price} x {prod.quantity}
              </li>
            ))}
          </ul>
        </div>

        <div id="price">
          <h2>Price Details</h2>
          <p>Product Price: Rs. {priceDetails.prodPrice || 0}</p>
          <p>Delivery Charge: Rs. {priceDetails.delPrice || 0}</p>
          <p>CoD Charge: Rs. {priceDetails.cod || 0}</p>
          <p>Total Payment: Rs. {priceDetails.totalPrice || 0}</p>
        </div>

        <div id="delivery-options">
          <h2>Delivery Mode</h2>
          <p>{deliveryMode}</p>
        </div>

        <div id="payment-options">
          <h2>Payment Mode</h2>
          <p>{paymentMode}</p>
        </div>

        {/* <div id="payment-details">
          <h2>Payment Details</h2>
          {paymentDetails.PaymentID ? (
            <>
              <p>Payment ID: {paymentDetails.PaymentID}</p>
              <p>Amount Paid: Rs. {paymentDetails.PaymentAmount}</p>
            </>
          ) : (
            <p>No payment details available</p>
          )}
        </div> */}
      </div>

      <button id="pay-button" onClick={handlePayment}>
        Pay Now
      </button>
    </div>
  );
};

export default Payment;
