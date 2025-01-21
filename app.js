const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { Client } = require("basic-ftp");
const { createCanvas } = require('canvas'); // Importing canvas

const app = express();

// CORS setup should come before route handling
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

// Define your routes below

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

// Function to generate image from text using canvas
const generateImageFromText = (orderDetails, orderId) => {
  const canvas = createCanvas(600, 400);
  const ctx = canvas.getContext('2d');
  ctx.font = '14px Arial';
  ctx.fillStyle = 'black';
  ctx.fillText(orderDetails, 10, 30);

  const imagePath = path.join(uploadDir, `${orderId}_details.png`);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(imagePath, buffer);

  return imagePath;
};

app.post('/upload', upload.single('file'), async (req, res) => {
  const { orderId, productName, quantity, paymentDetails, priceDetails, formContainer } = req.body;

  try {
    // Generate order details text
    const orderDetails = `
      Order ID: ${orderId}
      Order Data: ${JSON.stringify(req.body.orderData, null, 2)}
      Payment Mode: ${paymentDetails.PaymentMode}
      Delivery Mode: ${paymentDetails.DeliveryMode}
      Total Price: ${priceDetails.totalPrice}
      Customer Name: ${formContainer.name}
      Customer Email: ${formContainer.email}
      Customer Contact: ${formContainer.phone}
    `;

    // Create a folder for the order (if not already exists)
    const orderFolderPath = path.join(uploadDir, orderId);
    if (!fs.existsSync(orderFolderPath)) {
      fs.mkdirSync(orderFolderPath);
    }

    // Generate image from order details text
    const imagePath = generateImageFromText(orderDetails, orderId);

    // Save the order details as a text file in the folder
    const detailsFilePath = path.join(orderFolderPath, 'orderdetails.txt');
    fs.writeFileSync(detailsFilePath, orderDetails);

    // Optionally, upload the image to FTP or handle it as needed
    const client = new Client();
    client.ftp.verbose = true;

    await client.access({
      host: '46.202.138.82',
      user: 'u709132829.dreamikAi',
      password: 'dreamikAi@123',
      secure: false,
    });

    // Upload the image file (example)
    await client.uploadFrom(imagePath, `${orderId}_details.png`);
    console.log(`Image for Order ID ${orderId} uploaded to FTP`);

    client.close();

    res.status(200).json({
      message: 'Order uploaded successfully!',
      orderFolder: orderFolderPath,
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
