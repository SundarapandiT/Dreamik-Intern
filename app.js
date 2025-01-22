const express = require('express');
const cors = require('cors');
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

// Upload Endpoint
app.post('/upload', async (req, res) => {
  const { orderId, orderData, paymentDetails, priceDetails, formContainer } = req.body;

  try {
    if (!orderId || !orderData || !paymentDetails || !priceDetails || !formContainer) {
      throw new Error('Missing required fields in the order details.');
    }

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

    const client = new Client();
    client.ftp.verbose = true;

    try {
      await client.access({
        host: '46.202.138.82',
        user: 'u709132829.dreamikAi',
        password: 'dreamikAi@123',
        secure: false,
      });

      const folderName = `uploads/${formContainer.name}_ORDER_${new Date().getTime()}`;
      await client.ensureDir(folderName);
      console.log(`Navigated to folder: ${folderName}`);

      // Upload customer details directly
      const customerDetailsData = JSON.stringify(customerDetails, null, 2);
      await client.uploadFrom(Buffer.from(customerDetailsData), `customer_${orderId}.txt`);
      console.log(`Uploaded customer details: customer_${orderId}.txt`);

      // Directly upload each image
      for (const [index, item] of orderData.entries()) {
        const orderImageBase64 = item.image;
        if (!orderImageBase64 || typeof orderImageBase64 !== 'string') {
          console.warn(`No valid image data for item ${index + 1}. Skipping.`);
          continue;
        }

        const imageFileName = `orderdetails_${orderId}_image${index + 1}.png`;
        const base64Data = orderImageBase64.replace(/^data:image\/\w+;base64,/, '');
        const imageBuffer = Buffer.from(base64Data, 'base64');

        await client.uploadFrom(imageBuffer, `${imageFileName}`);
        console.log(`Uploaded image: ${imageFileName}`);

        orderDetails.images.push({
          name: imageFileName,
          quantity: item.quantity || 1, // Default to 1 if quantity is not provided
        });
      }

      // Upload order details
      const orderDetailsData = JSON.stringify(orderDetails, null, 2);
      await client.uploadFrom(Buffer.from(orderDetailsData), `orderdetails_${orderId}.txt`);
      console.log(`Uploaded order details: orderdetails_${orderId}.txt`);
    } catch (error) {
      console.error('FTP Upload Error:', error.message);
      throw error;
    } finally {
      client.close();
    }

    res.status(200).json({
      message: `Order details, customer details, and images uploaded successfully!`,
      orderId,
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
