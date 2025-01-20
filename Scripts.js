const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors");

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware to parse incoming JSON requests and increase the size limit
app.use(bodyParser.json({ limit: '100mb' })); // Increase payload limit if needed

// Enable CORS (Update with your production frontend URL)
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Change to your frontend URL in production
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

// Set up MySQL connection
const db = mysql.createConnection({
  host:"153.92.15.45", // Your DB host, e.g., 'localhost' or your hosted database
  port:"3306", // DB port (default is 3306 for MySQL)
  user:"u709132829_sundarapandit", // DB username
  password:"tsK17072004", // DB password (ensure this is secured and not hardcoded)
  database:"u709132829_order_details", // DB name
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL database:", err);
    return;
  }
  console.log("Connected to MySQL database.");
});

// Route to store the order in the database
app.post("/api/storeOrder", (req, res) => {
  const { orderId, orderData, paymentDetails, formContainer, priceDetails } = req.body;

  const orderQuery = "INSERT INTO orders (orderId, orderData, paymentDetails, formContainer, priceDetails) VALUES (?, ?, ?, ?, ?)";
  const orderValues = [
    orderId,
    JSON.stringify(orderData),
    JSON.stringify(paymentDetails),
    JSON.stringify(formContainer),
    JSON.stringify(priceDetails),
  ];

  db.query(orderQuery, orderValues, (err, result) => {
    if (err) {
      console.error("Error storing order:", err);
      return res.status(500).json({ error: "Failed to store order" });
    }
    res.status(200).json({ message: "Order stored successfully", orderId });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
