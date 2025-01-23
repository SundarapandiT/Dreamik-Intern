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
// POST Endpoint for uploading files directly to FTP
app.post('/upload', upload.fields([{ name: 'payment' }, { name: 'info' }, { name: 'images' }]), async (req, res) => {
  const client = new Client();
  client.ftp.verbose = true;

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

    const string = generateRandomString();
    const f = `${req.body.name || 'unknown_user'}-${req.body.orderId}-${string}-v1`;

    // Define folder paths
    const customerUploadFolder = `/CustomerUploads/${f}`;
    const customerDisplayFolder = `/CustomerDisplayItems/${f}`;

    // Ensure directories exist
    await client.ensureDir(customerUploadFolder);
    await client.ensureDir(customerDisplayFolder);

    console.log(`Folders created: ${customerUploadFolder}, ${customerDisplayFolder}`);

    // Helper function to upload to both directories sequentially
    const uploadFileToBothFolders = async (stream, filename) => {
      // Upload to the first folder
      await uploadStreamToFTP(stream, `${filename}`, client);

      // Reset the stream for the second upload
      const secondStream = PassThrough();
      stream.pipe(secondStream); // Reuse the original stream data

      // Upload to the second folder
      await uploadStreamToFTP(secondStream, `{filename}`, client);
    };

    // Upload `payment.json` only to `CustomerUploads`
    if (req.files['payment']) {
      const paymentFile = req.files['payment'][0];
      const paymentStream = PassThrough();
      paymentStream.end(paymentFile.buffer);
      await uploadStreamToFTP(paymentStream, `Payment-${f}.txt`, client);
    }

    // Upload `info.json` to both folders
    if (req.files['info']) {
      const infoFile = req.files['info'][0];
      const infoStream = PassThrough();
      infoStream.end(infoFile.buffer);
      await uploadFileToBothFolders(infoStream, `Info-${f}.txt`);
    }

    // Upload images to both folders
    if (req.files['images']) {
      for (const [index, imageFile] of req.files['images'].entries()) {
        const imageStream = PassThrough();
        imageStream.end(imageFile.buffer);
        const filename = `image_${index + 1}.png`;
        await uploadFileToBothFolders(imageStream, filename);
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
