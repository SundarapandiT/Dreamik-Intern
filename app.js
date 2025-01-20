const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Client } = require('basic-ftp');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON request bodies and handle larger payloads
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Enable CORS for localhost and your domain
const corsOptions = {
  origin: ["http://localhost:5173", "https://dreamikai.com"],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

// FTP upload function
const uploadToFTP = async (fileBuffer, fileName) => {
  const client = new Client();
  client.ftp.verbose = true;

  try {
    await client.access({
      host: 'dreamikai.com',
      user: 'u709132829.dreamikai.com',
      password: '', // No password
      secure: false, // Non-FTPS, set to true for FTPS
    });

    await client.ensureDir('public_html/uploads');
    await client.uploadFrom(fileBuffer, fileName);

    console.log(`Successfully uploaded ${fileName} to FTP server.`);
  } catch (err) {
    console.error('FTP upload failed', err);
    throw err;
  } finally {
    client.close();
  }
};

// API to store order and upload order confirmation JSON
app.post('/api/storeOrder', async (req, res) => {
  const orderDetails = req.body;

  try {
    // Create the JSON string for the order confirmation file
    const orderConfirmationContent = JSON.stringify(orderDetails, null, 2);
    const fileName = `${orderDetails.orderId}-orderconfirmation.json`;

    // Convert JSON string to Buffer for FTP upload
    const fileBuffer = Buffer.from(orderConfirmationContent);

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
