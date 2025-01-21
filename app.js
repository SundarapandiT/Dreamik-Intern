const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { createCanvas } = require('canvas');
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
  const { orderId, orderData, paymentDetails, priceDetails, formContainer } = req.body;

  try {
    // Log incoming request body for debugging
    console.log('Incoming order details:', req.body);

    // Validate required fields
    if (!orderId || !orderData || !paymentDetails || !priceDetails || !formContainer) {
      throw new Error('Missing required fields in the order details.');
    }

    // Format the order data
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

    // Save the details to a text file
    const detailsPath = path.join(uploadDir,uploadDir, `orderdetails_${orderId}.txt`);
    fs.writeFileSync(detailsPath, orderDetails);
    console.log(detailsPath);

    // Generate an image of the order details
    const canvas = createCanvas(800, 1000); // Adjusted height for larger content
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 800, 1000);
    ctx.fillStyle = '#000000';
    ctx.font = '20px Arial';
    const lines = orderDetails.split('\n');

    lines.forEach((line, index) => {
      if (line.length > 90) {
        const parts = line.match(/.{1,90}/g) || []; // Wrap text
        parts.forEach((part, subIndex) => {
          ctx.fillText(part, 50, 50 + (index + subIndex) * 30);
        });
      } else {
        ctx.fillText(line, 50, 50 + index * 30);
      }
    });

    const imagePath = path.join(uploadDir,uploadDir, `orderdetails_${orderId}.png`);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(imagePath, buffer);

    // Upload the files to FTP
    const client = new Client();
    client.ftp.verbose = true;

    await client.access({
      host: '46.202.138.82',
      user: 'u709132829.dreamikAi',
      password: 'dreamikAi@123',
      secure: false,
    });

    const folderName = `uploads/order_${orderId}`;

    // Check if directory exists and create it if necessary
    await client.ensureDir('/');
    await client.ensureDir(folderName);
    console.log(`Folder ${folderName} created/verified on FTP`);

    // Upload files
    await client.uploadFrom(detailsPath, `${folderName}/orderdetails_${orderId}.txt`);
    await client.uploadFrom(imagePath, `${folderName}/orderdetails_${orderId}.png`);
    console.log(`Order details for Order ID: ${orderId} uploaded to FTP in folder: ${folderName}`);

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
