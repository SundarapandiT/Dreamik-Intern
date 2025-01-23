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
  // Function to generate random 5-letter string
const generateRandomString = (length = 5) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};


  try {
    // Connect to the FTP server
    await client.access({
      host: '46.202.138.82',
      user: 'u709132829.dreamikaishop',
      password: 'dreamikAi@123',
      secure: false,
    });
  const string=generateRandomString();
    // Create a unique folder for the upload
    const f=`C${req.body.name || 'unknown_user'}-${req.body.orderId}-${string}-v1`
    const folderName = `CustomerUploads/${f}`; 
    await client.ensureDir(folderName);
    console.log(`Navigated to folder: ${folderName}`);

    // Upload `payment.json`
    if (req.files['payment']) {
      const paymentFile = req.files['payment'][0];
      const paymentStream = PassThrough();
      paymentStream.end(paymentFile.buffer);
      await uploadStreamToFTP(paymentStream, `Payment-${f}.txt`, client);
    }

    // Upload `info.json`
    if (req.files['info']) {
      const infoFile = req.files['info'][0];
      const infoStream = PassThrough();
      infoStream.end(infoFile.buffer);
      await uploadStreamToFTP(infoStream, `Info-${f}.txt`, client);
    }

    // Upload images
    if (req.files['images']) {
      for (const [index, imageFile] of req.files['images'].entries()) {
        const imageStream = PassThrough();
        imageStream.end(imageFile.buffer);
        const remoteFilePath = `${f}-${imageFile}.png`;
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
