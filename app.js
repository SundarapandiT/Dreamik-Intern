const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Define allowed origins
const allowedOrigins = [
  'http://localhost:5173',
  'https://www.dreamikai.com',
  'https://dreamikai.com',
  'https://www.dreamik.com',
  'https://dreamik.com',
];

// Middleware to check the origin of the request
const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.includes(origin) || !origin) {
      // Allow requests with no origin (e.g., mobile apps or Postman)
      callback(null, true);
    } else {
      // Reject requests from disallowed origins
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'],  // Allowed headers
};

// Initialize Express app
const app = express();

// Enable CORS with custom options
app.use(cors(corsOptions));

// Define the storage and upload logic for multer
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir); // Create the directory if it doesn't exist
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Specify the upload directory
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Use the original file name
  },
});

const upload = multer({ storage: storage });

// Upload route to handle file upload and order details
app.post('/upload', upload.single('file'), async (req, res) => {
  const { productName, quantity, orderId } = req.body;

  try {
    if (req.file) {
      console.log(`File uploaded: ${req.file.filename}`);
    }

    const productDetails = `Order ID: ${orderId}\nProduct: ${productName}\nQuantity: ${quantity}\n\n`;

    // Append product details to a text file
    const detailsPath = path.join(uploadDir, `orderdetails_${orderId}.txt`);
    fs.appendFileSync(detailsPath, productDetails);

    // If needed, implement FTP upload logic here
    const { Client } = require("basic-ftp");
    const client = new Client();
    client.ftp.verbose = true;

    const fileBuffer = fs.readFileSync(req.file.path); // Read file to upload
    const fileName = req.file.filename; // Get file name from multer

    try {
      await client.access({
        host: '46.202.138.82',
        user: 'u709132829.dreamikAi',
        password: 'dreamikAi@123', // No password
        secure: false, // Non-FTPS, set to true for FTPS
      });

      // Upload file to FTP server
      await client.uploadFrom(fileBuffer, fileName);
      console.log(`File ${fileName} uploaded to FTP`);
    } catch (err) {
      console.error("FTP upload failed", err);
      throw err;
    } finally {
      client.close();
    }

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
