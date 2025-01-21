const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'https://www.dreamikai.com',
  'https://dreamikai.com',
  'https://www.dreamik.com',
  'https://dreamik.com',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define storage for Multer
const uploadDir = path.join(__dirname, '../public_html/upload');

// Ensure the directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const orderId = req.body.orderId || Date.now(); // Use provided orderId or timestamp
    const fileExt = path.extname(file.originalname);
    cb(null, `orderdetails_${orderId}${fileExt}`);
  },
});

// File filter for validation
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPEG, and PNG are allowed.'));
  }
};

const upload = multer({ storage, fileFilter });

// Route for file and data upload
app.post('/upload', upload.single('file'), (req, res) => {
  const { productName, quantity, orderId } = req.body;

  try {
    if (req.file) {
      console.log(`File uploaded: ${req.file.filename}`);
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

// Global error handler for multer
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    res.status(400).json({ message: 'Multer error', error: err.message });
  } else if (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  } else {
    next();
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
