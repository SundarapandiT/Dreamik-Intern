const express = require('express');
const bodyParser = require('body-parser');
const cors = require("cors");
const { Client } = require('basic-ftp');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// Specific CORS configuration
const corsOptions = {
  origin: ["https://dreamikai.com", "https://www.dreamikai.com", "http://localhost:5173"], // Restrict to specific domains
  methods: ["GET", "POST"], // Allow only GET and POST methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allow specific headers
};
app.use(cors(corsOptions)); // Apply CORS middleware

// FTP upload function
const uploadToFTP = async (fileBuffer, fileName) => {
  const client = new Client();
  client.ftp.verbose = true;

  try {
    // Connect to FTP server
    await client.access({
      host: 'dreamikai.com',
      user: 'u709132829.dreamikai.com',
      password: '', // No password
      secure: false, // Non-FTPS, set to true for FTPS
    });

    // Ensure the directory exists
    await client.ensureDir('public_html/uploads');

    // Upload file buffer to FTP
    await client.uploadFrom(fileBuffer, fileName);

    console.log(`Successfully uploaded ${fileName} to FTP server.`);
  } catch (err) {
    console.error('FTP upload failed', err);
    throw err; // Re-throw the error to handle it in the route
  } finally {
    client.close();
  }
};

// Handle POST request to store order and upload order confirmation JSON
app.post('/api/storeOrder', async (req, res) => {
  const orderDetails = req.body;

  // Generate order confirmation file content
  const orderConfirmationFileContent = JSON.stringify(orderDetails, null, 2);
  const fileName = `${orderDetails.orderId}-orderconfirmation.json`;

  // Upload the file to FTP
  try {
    // Convert the JSON content to a buffer
    const fileBuffer = Buffer.from(orderConfirmationFileContent, 'utf-8');

    await uploadToFTP(fileBuffer, fileName);

    res.status(200).send('Order saved and confirmation file uploaded.');
  } catch (error) {
    console.error('Error uploading confirmation file:', error);
    res.status(500).send('Error uploading confirmation file to FTP.');
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
