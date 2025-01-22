import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './Payment.css';

const Payment = () => {
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState([]);
  const [priceDetails, setPriceDetails] = useState({});
  const [deliveryMode, setDeliveryMode] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [testPayCode, setTestPayCode] = useState("");
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [formContainer, setFormContainer] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const generateOrderID = () => {
    const now = new Date();
    return `ORD${now.toISOString().replace(/[-:.TZ]/g, "")}`;
  };

  const loadRazorpaySDK = () => {
    if (sdkLoaded) return;
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => setSdkLoaded(true);
    script.onerror = () => {
      console.error("Failed to load Razorpay SDK");
      alert("Error loading payment gateway. Please try again later.");
    };
    document.body.appendChild(script);
  };

  useEffect(() => {
    loadRazorpaySDK();

    const storedOrderData = JSON.parse(localStorage.getItem("OrderData")) || [];
    const storedPriceDetails = JSON.parse(localStorage.getItem("PriceData")) || {};
    const storedPaymentDetails = JSON.parse(localStorage.getItem("PaymentDetails")) || {};
    const storedFormContainer = JSON.parse(localStorage.getItem("FormContainer")) || {};

    setOrderData(storedOrderData);
    setPriceDetails(storedPriceDetails);
    setPaymentMode(storedPaymentDetails?.paymentMode || "");
    setDeliveryMode(storedPaymentDetails?.deliveryMode || "");
    setFormContainer(storedFormContainer);
  }, []);

  const handlePayment = async () => {
    if (!sdkLoaded) {
      alert("Payment gateway not loaded. Please try again later.");
      return;
    }
    setIsLoading(true);
    let finalAmount = priceDetails.totalPrice || 0;

    if (testPayCode.startsWith("$TESTPAY") && testPayCode.length === 19) {
      finalAmount = finalAmount > 100 ? finalAmount / 100 : finalAmount / 10;
    }

    const currentDomain = window.location.hostname;

    const saveOrderDetails = async (paymentData) => {
      const orderId = generateOrderID();
      
      const orderDetails = {
        orderId,
        orderData,
        paymentDetails: paymentData,
        formContainer,
        priceDetails,
      };

      // Save the combined order and payment details in local storage
      localStorage.setItem("OrderConfirmationData", JSON.stringify(orderDetails));

      try {
  // Prepare the data to be sent as JSON
  const orderDetails = {
    orderId: orderId,
    orderData: orderData,
    paymentDetails: paymentData,
    priceDetails: {
      prodPrice: priceDetails.prodPrice,
      delPrice: priceDetails.delPrice,
      cod: priceDetails.cod,
      totalPrice: priceDetails.totalPrice
    },
    formContainer: formContainer,
  };

  // Send the POST request with JSON data
  const response = await fetch("https://dreamik-intern.onrender.com/upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderDetails),
  });

  if (response.ok) {
    alert("Payment successful! Order saved.");
    navigate("/orderconfirmation");
  } else {
    alert("Failed to save order. Please try again.");
  }
} catch (error) {
  console.error("Error saving order:", error);
  alert("Error occurred. Please try again later.");
}finally
{
  setIsLoading(false);
}

    };

    if (currentDomain === "www.dreamik.com" || currentDomain === "dreamik.com") {
      const options = {
        key: "rzp_test_7y77238",
        amount: finalAmount * 100,
        currency: "INR",
        name: "DreamikAI",
        description: "Payment for your order",
        image: "/image/logo.png",
        handler: async (response) => {
          const paymentData = {
            PaymentID: response.razorpay_payment_id,
            PaymentAmount: finalAmount,
            PaymentMode: paymentMode,
            DeliveryMode: deliveryMode,
          };

          await saveOrderDetails(paymentData);
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
    } else {
      const paymentData = {
        PaymentID: "TEST123456789",
        PaymentAmount: finalAmount,
        PaymentMode: paymentMode,
        DeliveryMode: deliveryMode,
      };

      await saveOrderDetails(paymentData);
    }
  };

  return (
    <div>
      <h1>Dreamik AI Payment Gateway</h1>
      {isLoading ? (
        <div className="loading-message">
          <p>Please wait, confirming your order...</p>
        </div>
      ) : (
        <>
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
              onChange={(e) => setTestPayCode(e.target.value)}
            />
          </div>
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
          </div>

          <button id="pay-button" onClick={handlePayment}>
            Pay Now
          </button>
        </>
      )}
    </div>
  );
};

export default Payment;