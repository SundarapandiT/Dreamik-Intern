import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './OrderConfirmation.css';

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState([]);
  const [paymentDetails, setPaymentDetails] = useState({});
  const [formContainer, setFormContainer] = useState({});
  const [priceDetails, setPriceDetails] = useState({});
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    // Retrieve the order details from localStorage
    const storedOrderDetails = JSON.parse(localStorage.getItem("OrderConfirmationData"));

    // Check if the stored order details exist
    if (storedOrderDetails) {
      setOrderData(storedOrderDetails.orderData);
      setPaymentDetails(storedOrderDetails.paymentDetails);
      setFormContainer(storedOrderDetails.formContainer);
      setPriceDetails(storedOrderDetails.priceDetails);
      setOrderId(storedOrderDetails.orderId);
    } else {
      // If no order details are found, navigate back to payment page
      navigate("/payment");
    }
  }, [navigate]);

  const handleBackToHome = () => {
    // Optional: Clear localStorage after confirmation to avoid stale data
    localStorage.removeItem("OrderData");
    localStorage.removeItem("PaymentDetails");
    localStorage.removeItem("FormContainer");
    localStorage.removeItem("PriceData");
    navigate("/");
    window.location.reload();
  };

  return (
    <div className="order-confirmation">
      <h1>Order Confirmation <i className="fas fa-check-circle" style={{ color: 'green', marginLeft: '10px' }}></i></h1>
      <p id="thank">Thank you for your purchase! Your order has been successfully placed.</p>

      <div className="order-summary">
        <h2>Order Summary</h2>
        <ul>
          {orderData.map((product, index) => (
            <li key={index}>
              {product.Name} - Rs. {product.price} x {product.quantity}
            </li>
          ))}
        </ul>
        <p><strong>Total Amount Paid:</strong> Rs. {priceDetails.totalPrice || 0}</p>
      </div>

      <div className="payment-details">
        <h2>Payment Details</h2>
        <p><strong>Payment ID:</strong> {paymentDetails.PaymentID || "N/A"}</p>
        <p><strong>Payment Mode:</strong> {paymentDetails.PaymentMode || "N/A"}</p>
      </div>

      <div className="delivery-details">
        <h2>Delivery Details</h2>
        <p><strong>Delivery Mode:</strong> {paymentDetails.DeliveryMode || "N/A"}</p>
        <p><strong>Name:</strong> {formContainer.name || "N/A"}</p>
        <p><strong>Email:</strong> {formContainer.email || "N/A"}</p>
        <p><strong>Phone:</strong> {formContainer.phone || "N/A"}</p>
        <p><strong>Address:</strong> {formContainer.address1 || "N/A"}</p>
      </div>

      <div className="order-id">
        <h2>Order ID</h2>
        <p>{orderId}</p>
      </div>

      <button className="back-to-home" onClick={handleBackToHome}>
        Back to Home
      </button>
    </div>
  );
};

export default OrderConfirmation;
