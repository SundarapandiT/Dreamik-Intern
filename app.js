const express = require('express');
const cors = require('cors');
const { Client } = require('basic-ftp');
const multer = require('multer');
const { PassThrough } = require('stream');
const fs = require('fs'); 
const path = require('path');
const zlib = require('zlib'); // Import the zlib module

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

// Compress data using zlib
const compressBuffer = async (buffer) => {
  return new Promise((resolve, reject) => {
    zlib.gzip(buffer, (err, compressedBuffer) => {
      if (err) {
        return reject(err);
      }
      resolve(compressedBuffer);
    });
  });
};

// Updated POST Endpoint for uploading files with compression
app.post(
  '/upload',
  upload.fields([{ name: 'payment' }, { name: 'info' }, { name: 'images' }]),
  async (req, res) => {
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
      const f = `${req.body.orderId}-${string}-v1`;

      // Define folder paths
      const customerUploadFolder = `/CustomerUploads/${f}`;
      const customerDisplayFolder = `/CustomerDisplayItems/${f}`;

      // Ensure directories exist
      await client.ensureDir(customerUploadFolder);
      await client.ensureDir(customerDisplayFolder);

      console.log(`Folders created: ${customerUploadFolder}, ${customerDisplayFolder}`);

      // Helper function to upload compressed data
      const uploadCompressedFile = async (buffer, filename, folderPath) => {
        const compressedBuffer = await compressBuffer(buffer); // Compress the buffer
        const stream = PassThrough();
        stream.end(compressedBuffer);

        // Upload the compressed file
        await uploadStreamToFTP(stream, `${folderPath}/${filename}.gz`, client);
        console.log(`Uploaded compressed file: ${folderPath}/${filename}.gz`);
      };

      // Upload and compress `payment.json`
      if (req.files['payment']) {
        const paymentFile = req.files['payment'][0];
        await uploadCompressedFile(paymentFile.buffer, `Payment-${f}`, customerUploadFolder);
      }

      // Upload and compress `info.json`
      if (req.files['info']) {
        const infoFile = req.files['info'][0];
        await uploadCompressedFile(infoFile.buffer, `Info-${f}`, customerUploadFolder);
        await uploadCompressedFile(infoFile.buffer, `Info-${f}`, customerDisplayFolder);
      }

      // Upload and compress images
      if (req.files['images']) {
        for (const [index, imageFile] of req.files['images'].entries()) {
          const filename = `${f}-image_${index + 1}`;
          await uploadCompressedFile(imageFile.buffer, filename, customerUploadFolder);
          await uploadCompressedFile(imageFile.buffer, filename, customerDisplayFolder);
        }
      }

      res.status(200).json({ message: 'Files uploaded and compressed successfully.' });
    } catch (error) {
      console.error('Error during upload:', error);
      res.status(500).json({ error: 'Failed to upload files.' });
    } finally {
      client.close();
    }
  }
);

// Endpoint to retrieve files by orderId and return actual file data
app.get('/retrieve/:orderId', async (req, res) => {
  const { orderId } = req.params;
  const client = new Client();
  client.ftp.verbose = true;

  try {
    // Connect to the FTP server
    await client.access({
      host: '46.202.138.82',
      user: 'u709132829.dreamikaishop',
      password: 'dreamikAi@123',
      secure: false,
    });

    const customerDisplayFolder = '/CustomerDisplayItems';
    const folders = await client.list(customerDisplayFolder);

    console.log('All folders:', folders.map((folder) => folder.name));
    console.log('Searching for Order ID:', orderId);

    // Find the folder matching the orderId
    const matchingFolder = folders.find((folder) => folder.name.includes(orderId));
    if (!matchingFolder) {
      console.error(`No folder found for Order ID: ${orderId}`);
      return res.status(404).json({ error: `No folder found for Order ID: ${orderId}` });
    }

    console.log('Matching folder:', matchingFolder.name);

    // List files in the folder
    const folderPath = `${customerDisplayFolder}/${matchingFolder.name}`;
    const files = await client.list(folderPath);

    if (!files.length) {
      console.error(`No files found in folder: ${matchingFolder.name}`);
      return res.status(404).json({ error: `No files found in folder: ${matchingFolder.name}` });
    }

    // Create an array to store the file data
    const fileData = [];

    // Download each file sequentially
    for (const file of files) {
      const filePath = `${folderPath}/${file.name}`;
      const localFilePath = path.join(__dirname, file.name);  // Ensure local path

      console.log(`Downloading file from: ${filePath} to ${localFilePath}`);
      await client.downloadTo(localFilePath, filePath);  // Download file using downloadTo

      // Read the downloaded file and convert it to base64
      const buffer = fs.readFileSync(localFilePath);
      const base64Content = buffer.toString('base64');
      const fileType = file.name.endsWith('.png') || file.name.endsWith('.jpg') ? 'image' : 'text';
      
      // Push the file data to the array
      fileData.push({ name: file.name, type: fileType, content: base64Content });
    }

    // Send the response with the folder and file data
    res.status(200).json({ folderName: matchingFolder.name, files: fileData });
  } catch (error) {
    console.error('Error retrieving files:', error);
    res.status(500).json({ error: 'Failed to retrieve files.' });
  } finally {
    client.close();
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// successfully woring /upload and /get both
