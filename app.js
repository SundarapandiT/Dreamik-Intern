const express = require('express');
const path = require('path');
const fs = require('fs');
const { Client } = require("basic-ftp");
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const app = express();
const uploadDir = path.join(__dirname, 'uploads'); // Specify your upload directory

// FTP upload function
const uploadToFTP = async (fileBuffer, fileName) => {
  const client = new Client();
  client.ftp.verbose = true;

  try {
    await client.access({
      host: "46.202.138.82",
      user: "u709132829.dreamikAi",
      password: "dreamikAi@123", // No password
      secure: false, // Non-FTPS, set to true for FTPS
    });

    await client.uploadFrom(fileBuffer, fileName); // Upload file to FTP server
    console.log(`File ${fileName} uploaded to FTP`);
  } catch (err) {
    console.error("FTP upload failed", err);
    throw err;
  } finally {
    client.close();
  }
};

app.post('/upload', upload.single('file'), async (req, res) => {
  const { productName, quantity, orderId } = req.body;

  try {
    if (req.file) {
      console.log(`File uploaded: ${req.file.filename}`);

      // Upload the file to FTP server
      const fileBuffer = fs.readFileSync(req.file.path); // Read the uploaded file into buffer
      await uploadToFTP(fileBuffer, req.file.filename); // Upload to FTP
    }

    const productDetails = `Order ID: ${orderId}\nProduct: ${productName}\nQuantity: ${quantity}\n\n`;

    // Append product details to a text file
    const detailsPath = path.join(uploadDir, `orderdetails_${orderId}.txt`);
    fs.appendFileSync(detailsPath, productDetails);

    res.status(200).json({
      message: 'Order uploaded successfully!',
      fileName: req.file?.filename || 'No file uploaded',
    });
  } catch (error) {
    console.error('Error processing the upload:', error);
    res.status(500).json({
      message: 'Failed to upload order.',
      error: error.message,
    });
  }
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
