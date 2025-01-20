const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware to parse incoming JSON requests
app.use(bodyParser.json({ limit: '100mb' })); // Increase payload limit if needed

// Enable CORS (Update with your production frontend URL)
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173' || 'https://dreamikai.com', // Change to your frontend URL in production
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  })
);

// Directory path to save JSON files
const uploadsDir = path.join(__dirname, "uploads");

// Ensure the directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Route to save client JSON file
app.post("/api/storeJsonFile", (req, res) => {
  const { filename, data } = req.body;

  // Validate request
  if (!filename || !data) {
    return res.status(400).json({ error: "Filename and data are required" });
  }

  // Create file path
  const filePath = path.join(uploadsDir, `${filename}.json`);

  // Write JSON data to the file
  fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
    if (err) {
      console.error("Error saving JSON file:", err);
      return res.status(500).json({ error: "Failed to save JSON file" });
    }
    res.status(200).json({ message: "JSON file saved successfully", filePath });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
