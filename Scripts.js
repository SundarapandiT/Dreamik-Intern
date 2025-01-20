const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors");

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware to parse incoming JSON requests
app.use(bodyParser.json());

// Enable CORS
app.use(cors());

// Set up MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || "127.0.0.1",
  port: process.env.DB_PORT || "3306",
  user: process.env.DB_USER || "u709132829_sundarapandit",
  password: process.env.DB_PASSWORD || "tsK17072004",
  database: process.env.DB_NAME || "u709132829_order_details",
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
