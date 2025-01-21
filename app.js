const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { Client } = require('basic-ftp');
const base64Img = require('base64-img'); // You can use a library for easier base64 to image conversion

const app = express();
const allowedOrigins = ['http://localhost:5173', 'https://www.dreamikai.com', 'https://dreamikai.com', 'https://www.dreamik.com', 'https://dreamik.com'];

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' })); // For parsing JSON bodies

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

app.post('/upload', async (req, res) => {
  const { orderId, orderData, paymentDetails, priceDetails, formContainer } = req.body;

  try {
    console.log('Incoming order details:', req.body);

    if (!orderId || !orderData || !paymentDetails || !priceDetails || !formContainer) {
      throw new Error('Missing required fields in the order details.');
    }

    const formattedOrderData = orderData
      .map(
        (item, index) =>
          `  ${index + 1}. Product Name: ${item.name}, Quantity: ${item.quantity}, Price: ${item.price}`
      )
      .join('\n');

    const orderDetails = `
      Order ID: ${orderId}
      Payment Mode: ${paymentDetails.PaymentMode}
      Delivery Mode: ${paymentDetails.DeliveryMode}
      Total Price: ${priceDetails.totalPrice}
      Customer Name: ${formContainer.name}
      Customer Email: ${formContainer.email}
      Customer Contact: ${formContainer.phone}

      Order Data:
${formattedOrderData}
    `;

    const detailsPath = path.join(uploadDir, `orderdetails_${orderId}.txt`);
    fs.appendFileSync(detailsPath, orderDetails); // Append content to the text file
    console.log(`Order details saved to: ${detailsPath}`);

    // Handle the base64 image and save it as a PNG
    const orderImageBase64 = orderData[0]?.image; // Assuming the image is part of the first order item
    if (!orderImageBase64) {
      throw new Error('No base64 image data found in order.');
    }

    // Convert base64 to PNG and save it
    const imagePath = path.join(uploadDir, `orderdetails_${orderId}.png`);
    const base64Data = orderImageBase64.replace(/^data:image\/png;base64,/, ''); // Remove data URI part
    fs.writeFileSync(imagePath, Buffer.from(base64Data, 'base64'));

    const client = new Client();
    client.ftp.verbose = true;

    await client.access({
      host: '46.202.138.82',
      user: 'u709132829.dreamikAi',
      password: 'dreamikAi@123',
      secure: false,
    });

    console.log('Connected to FTP server.');

    // Verify local file existence
    if (!fs.existsSync(detailsPath)) {
      throw new Error(`Text file does not exist at path: ${detailsPath}`);
    }
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image file does not exist at path: ${imagePath}`);
    }

    // Upload text file directly to the uploads directory
    await client.uploadFrom(detailsPath, `uploads/orderdetails_${orderId}.txt`);
    console.log(`Text file uploaded: uploads/orderdetails_${orderId}.txt`);

    // Upload image file directly to the uploads directory
    await client.uploadFrom(imagePath, `uploads/orderdetails_${orderId}.png`);
    console.log(`Image file uploaded: uploads/orderdetails_${orderId}.png`);

    client.close();

    res.status(200).json({
      message: 'Order details uploaded successfully!',
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

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
