const express = require('express'); // Import Express
const cors = require('cors'); // Import CORS
const path = require('path'); // Import path module
const fs = require('fs'); // Import file system module
const { Client } = require('basic-ftp'); // Import FTP client

const app = express(); // Create the Express app
const allowedOrigins = [
  'http://localhost:5173',
  'https://www.dreamikai.com',
  'https://dreamikai.com',
  'https://www.dreamik.com',
  'https://dreamik.com',
];

// Configure CORS
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

app.use(cors(corsOptions)); // Use CORS
app.use(express.json({ limit: '50mb' })); // For parsing JSON bodies

const uploadDir = path.join(__dirname, 'uploads'); // Define the uploads directory
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir); // Create the uploads directory if it doesn't exist
}

app.post('/upload', async (req, res) => {
  const { orderId, orderData, paymentDetails, priceDetails, formContainer } = req.body;

  try {
    console.log('Incoming order details:', req.body);

    if (!orderId || !orderData || !paymentDetails || !priceDetails || !formContainer) {
      throw new Error('Missing required fields in the order details.');
    }

    const folderName = `${formContainer.name}ORDER_${new Date().getTime()}`;
    const orderFolderPath = path.join(uploadDir, folderName);

    fs.mkdirSync(orderFolderPath, { recursive: true });

    const formattedOrderData = orderData
      .map(
        (item, index) =>
          `  ${index + 1}. Product Name: ${item.Name}, Quantity: ${item.quantity}, Price: ${item.price}`
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
      Customer Address: ${formContainer.address1}

      Order Data:
${formattedOrderData}
    `;

    const detailsPath = path.join(orderFolderPath, `orderdetails_${orderId}.txt`);
    fs.writeFileSync(detailsPath, orderDetails);
    console.log(`Order details saved to: ${detailsPath}`);

    // Save all base64 images in the orderData array
    const imagePaths = [];
    for (const [index, item] of orderData.entries()) {
      const orderImageBase64 = item.image;
      if (!orderImageBase64 || typeof orderImageBase64 !== 'string') {
        console.warn(`No valid base64 image data found for item ${index + 1}. Skipping.`);
        continue;
      }

      const base64Data = orderImageBase64.replace(/^data:image\/\w+;base64,/, "");
      const imageBuffer = Buffer.from(base64Data, 'base64');

      const imagePath = path.join(orderFolderPath, `orderdetails_${orderId}_image${index + 1}.png`);
      fs.writeFileSync(imagePath, imageBuffer);
      imagePaths.push(imagePath);
      console.log(`Image ${index + 1} successfully saved at path:`, imagePath);
    }

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

      // Upload text file to FTP
      await client.uploadFrom(detailsPath, `${folderName}/orderdetails_${orderId}.txt`);
      console.log(`Order details for Order ID: ${orderId} uploaded to FTP`);

      // Upload all images to FTP
      for (const [index, imagePath] of imagePaths.entries()) {
        const remoteImagePath = `${folderName}/orderdetails_${orderId}_image${index + 1}.png`;
        await client.uploadFrom(imagePath, remoteImagePath);
        console.log(`Order image ${index + 1} for Order ID: ${orderId} uploaded to FTP`);
      }
    } finally {
      client.close();
    }

    res.status(200).json({
      message: `Order details and images uploaded successfully!`,
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
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
