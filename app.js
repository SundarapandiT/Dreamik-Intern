const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const { Client } = require('basic-ftp');

const app = express();
const PORT = 3000;

// Allowed Origins for CORS
const allowedOrigins = [
  'http://localhost:5173',
  'https://www.dreamikai.com',
  'https://dreamikai.com',
  'https://www.dreamik.com',
  'https://dreamik.com',
];

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Directory for storing uploaded files
const uploadDir = path.join(__dirname, 'uploads');
(async () => {
  try {
    await fs.mkdir(uploadDir, { recursive: true });
    console.log(`Upload directory created at: ${uploadDir}`);
  } catch (err) {
    console.error('Failed to create upload directory:', err);
  }
})();

// Upload Endpoint
app.post('/upload', async (req, res) => {
  const { orderId, orderData, paymentDetails, priceDetails, formContainer } = req.body;

  try {
    if (!orderId || !orderData || !paymentDetails || !priceDetails || !formContainer) {
      throw new Error('Missing required fields in the order details.');
    }

    // Create a unique folder for the order
    const folderName = `uploads/${formContainer.name}_ORDER_${new Date().getTime()}`;
    const orderFolderPath = path.join(uploadDir, folderName);

    await fs.mkdir(orderFolderPath, { recursive: true });

    // Prepare order and customer details
    const orderDetails = {
      orderId,
      paymentDetails,
      priceDetails: {
        prodPrice: priceDetails.prodPrice,
        delPrice: priceDetails.delPrice,
        cod: priceDetails.cod,
        totalPrice: priceDetails.totalPrice,
      },
      images: [],
    };

    const customerDetails = {
      name: formContainer.name,
      email: formContainer.email,
      contact: formContainer.phone,
      address: formContainer.address1,
    };

    // Write order and customer details as text files
    const orderDetailsPath = path.join(orderFolderPath, `orderdetails_${orderId}.txt`);
    const customerDetailsPath = path.join(orderFolderPath, `customer_${orderId}.txt`);

    await Promise.all([
      fs.writeFile(orderDetailsPath, JSON.stringify(orderDetails, null, 2)), // Save JSON as text
      fs.writeFile(customerDetailsPath, JSON.stringify(customerDetails, null, 2)), // Save JSON as text
    ]);

    // Save all images and populate the images array
    const imageWritePromises = orderData.map(async (item, index) => {
      const orderImageBase64 = item.image;
      const imageFileName = `orderdetails_${orderId}_image${index + 1}.png`;

      if (!orderImageBase64 || typeof orderImageBase64 !== 'string') {
        console.warn(`No valid image data for item ${index + 1}. Skipping.`);
        return; // Skip this image
      }

      try {
        const base64Data = orderImageBase64.replace(/^data:image\/\w+;base64,/, '');
        const imageBuffer = Buffer.from(base64Data, 'base64');
        const imagePath = path.join(orderFolderPath, imageFileName);

        await fs.writeFile(imagePath, imageBuffer);
        console.log(`Saved image: ${imageFileName}`);
        orderDetails.images.push(imageFileName); // Add to images array
      } catch (err) {
        console.error(`Failed to save image ${imageFileName}:`, err.message);
      }
    });

    await Promise.all(imageWritePromises); // Wait for all images to be processed

    // FTP Upload Section
    const client = new Client();
    client.ftp.verbose = true;

    try {
      await client.access({
        host: '46.202.138.82',
        user: 'u709132829.dreamikAi',
        password: 'dreamikAi@123',
        secure: false,
      });

      await client.ensureDir(folderName);
      console.log(`Navigated to folder: ${folderName}`);

      // Upload files sequentially
      await client.uploadFrom(orderDetailsPath, `orderdetails_${orderId}.txt`);
      console.log(`Uploaded order details file: orderdetails_${orderId}.txt`);

      await client.uploadFrom(customerDetailsPath, `customer_${orderId}.txt`);
      console.log(`Uploaded customer details file: customer_${orderId}.txt`);

      for (const imageFileName of orderDetails.images) {
        const localImagePath = path.join(orderFolderPath, imageFileName);
        console.log(`Uploading image: ${imageFileName}`);
        await client.uploadFrom(localImagePath, imageFileName);
        console.log(`Uploaded image: ${imageFileName}`);
      }

      console.log('All files uploaded successfully.');
    } catch (error) {
      console.error('FTP Upload Error:', error.message);
    } finally {
      client.close();
    }

    res.status(200).json({
      message: `Order details, customer details, and images uploaded successfully!`,
      orderId,
      folderName,
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
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
