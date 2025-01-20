const express = require('express');
const bodyParser = require('body-parser');
const { Client } = require('basic-ftp');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

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
  } finally {
    client.close();
  }
};

// Handle POST request to store order and upload order confirmation JSON
app.post('/api/storeOrder', async (req, res) => {
  const orderDetails = req.body;

  // Generate order confirmation file
  const orderConfirmationFile = new Blob([JSON.stringify(orderDetails, null, 2)], { type: 'application/json' });
  const fileName = `${orderDetails.orderId}-orderconfirmation.json`;

  // Upload the file to FTP
  try {
    await uploadToFTP(orderConfirmationFile, fileName);
    res.status(200).send('Order saved and confirmation file uploaded.');
  } catch (error) {
    res.status(500).send('Error uploading confirmation file to FTP.');
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
