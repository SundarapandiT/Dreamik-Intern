const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { Client } = require('basic-ftp');

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
  const { orderId, orderData, paymentDetails, priceDetails, formContainer, orderImageBase64 } = req.body;

  try {
    console.log('Incoming order details:', req.body);

    if (!orderId || !orderData || !paymentDetails || !priceDetails || !formContainer || !orderImageBase64) {
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

    // Save order details to a text file
    const detailsPath = path.join(uploadDir, `orderdetails_${orderId}.txt`);
    fs.appendFileSync(detailsPath, orderDetails); // Append content to the text file
    console.log(`Order details saved to: ${detailsPath}`);

    // Convert base64 image to buffer and save as PNG
    const imageBuffer = Buffer.from(orderImageBase64, 'base64');
    const imagePath = path.join(uploadDir, `orderdetails_${orderId}.png`);
    fs.writeFileSync(imagePath, imageBuffer);
    console.log('Image saved at path:', imagePath);

    // Upload the files to FTP
    const client = new Client();
    client.ftp.verbose = true;

    await client.access({
      host: '46.202.138.82',
      user: 'u709132829.dreamikAi',
      password: 'dreamikAi@123',
      secure: false,
    });

    // Upload order details file
    await client.uploadFrom(detailsPath, `orderdetails_${orderId}.txt`);
    console.log(`Order details for Order ID: ${orderId} uploaded to FTP`);

    // Upload image file
    await client.uploadFrom(imagePath, `orderdetails_${orderId}.png`);
    console.log(`Order image for Order ID: ${orderId} uploaded to FTP`);

    client.close();

    res.status(200).json({
      message: 'Order details and image uploaded successfully!',
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
