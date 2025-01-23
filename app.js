const express = require('express');
const cors = require('cors');
const { Client } = require('basic-ftp');
const multer = require('multer');
const { PassThrough } = require('stream');

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

// Multer configuration for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// FTP Upload Logic using Streams
const uploadStreamToFTP = async (stream, remoteFilePath, client) => {
  const passThrough = new PassThrough();
  stream.pipe(passThrough);

  try {
    await client.uploadFrom(passThrough, remoteFilePath);
    console.log(`Uploaded: ${remoteFilePath}`);
  } catch (err) {
    console.error(`Failed to upload ${remoteFilePath}: ${err.message}`);
    throw new Error(`Failed to upload ${remoteFilePath}`);
  }
};

// POST Endpoint for uploading files directly to FTP
app.post('/upload', upload.fields([{ name: 'payment' }, { name: 'info' }, { name: 'images' }]), async (req, res) => {
  const client = new Client();
  client.ftp.verbose = true;

  try {
    // Connect to the FTP server
    await client.access({
      host: '46.202.138.82',
      user: 'u709132829.dreamikAi',
      password: 'dreamikAi@123',
      secure: false,
    });

    // Create a unique folder for the upload
    const folderName = `uploads/${req.body.name || 'unknown_user'}_ORDER_${req.body.orderId}`; 
    await client.ensureDir(folderName);
    console.log(`Navigated to folder: ${folderName}`);

    // Upload `payment.json`
    if (req.files['payment']) {
      const paymentFile = req.files['payment'][0];
      const paymentStream = PassThrough();
      paymentStream.end(paymentFile.buffer);
      await uploadStreamToFTP(paymentStream, `Payment-${folderName}.txt`, client);
    }

    // Upload `info.json`
    if (req.files['info']) {
      const infoFile = req.files['info'][0];
      const infoStream = PassThrough();
      infoStream.end(infoFile.buffer);
      await uploadStreamToFTP(infoStream, `Info-${folderName}.txt`, client);
    }

    // Upload images
    if (req.files['images']) {
      for (const [index, imageFile] of req.files['images'].entries()) {
        const imageStream = PassThrough();
        imageStream.end(imageFile.buffer);
        const remoteFilePath = `${folderName}image_${index + 1}.png`;
        await uploadStreamToFTP(imageStream, remoteFilePath, client);
      }
    }

    res.status(200).json({ message: 'Files uploaded successfully.' });
  } catch (error) {
    console.error('Error during upload:', error);
    res.status(500).json({ error: 'Failed to upload files.' });
  } finally {
    client.close();
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
