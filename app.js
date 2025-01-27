const express = require('express');
const cors = require('cors');
const { Client } = require('basic-ftp');
const multer = require('multer');
const PassThrough = require('stream').PassThrough;;
// const { Client } = require('ftp');
const archiver = require('archiver');
const path = require('path');

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

// POST Endpoint for uploading files including ZIPs to FTP
app.post(
  '/upload',
  upload.fields([
    { name: 'payment' },
    { name: 'info' },
    { name: 'images' },
    { name: 'zipfiles' },
  ]),
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

      // Helper function to upload to both directories sequentially
      const uploadFileToBothFolders = async (buffer, filename) => {
        const stream1 = PassThrough();
        const stream2 = PassThrough();
        stream1.end(buffer);
        stream2.end(buffer);

        // Upload to the first directory
        await uploadStreamToFTP(stream1, `${customerUploadFolder}/${filename}`, client);

        // Upload to the second directory
        await uploadStreamToFTP(stream2, `${customerDisplayFolder}/${filename}`, client);
      };

      // Upload `payment.json` only to `CustomerUploads`
      if (req.files['payment']) {
        const paymentFile = req.files['payment'][0];
        const paymentStream = PassThrough();
        paymentStream.end(paymentFile.buffer);
        await uploadStreamToFTP(paymentStream, `${customerUploadFolder}/Payment-${f}.txt`, client);
      }

      // Upload `info.json` to both folders
      if (req.files['info']) {
        const infoFile = req.files['info'][0];
        await uploadFileToBothFolders(infoFile.buffer, `Info-${f}.txt`);
      }

      // Upload images to both folders
      if (req.files['images']) {
        for (const [index, imageFile] of req.files['images'].entries()) {
          const filename = `${f}-image_${index + 1}.png`;
          await uploadFileToBothFolders(imageFile.buffer, filename);
        }
      }

      // Upload ZIP files to both folders
      if (req.files['zipfiles']) {
        for (const [index, zipFile] of req.files['zipfiles'].entries()) {
          const filename = `${f}-file_${index + 1}.zip`;
          await uploadFileToBothFolders(zipFile.buffer, filename);
        }
      }

      res.status(200).json({ message: 'Files uploaded successfully.' });
    } catch (error) {
      console.error('Error during upload:', error);
      res.status(500).json({ error: 'Failed to upload files.' });
    } finally {
      client.close();
    }
  }
);

const FTP_CONFIG = {
  host: '46.202.138.82',
  user: 'u709132829.dreamikaishop',
  password: 'dreamikAi@123',
  secure: false,
};

app.get('/retrieve/:orderId', async (req, res) => {
  const { orderId } = req.params;
  const client = new Client();
  
  try {
    console.log('Connecting to FTP server...');
    await client.access(FTP_CONFIG);

    const customerDisplayFolder = '/CustomerDisplayItems';
    const folders = await client.list(customerDisplayFolder);

    console.log('All folders:', folders.map((folder) => folder.name));
    console.log('Searching for Order ID:', orderId);

    // Find the folder matching the orderId
    const matchingFolder = folders.find((folder) => folder.name.includes(orderId));
    if (!matchingFolder) {
      console.error(`No folder found for Order ID: ${orderId}`);
      return res.status(404).json({ error: `Folder for Order ID ${orderId} not found` });
    }

    console.log('Matching folder:', matchingFolder.name);

    // List files in the folder
    const folderPath = `${customerDisplayFolder}/${matchingFolder.name}`;
    const files = await client.list(folderPath);

    if (!files.length) {
      console.error(`No files found in folder: ${matchingFolder.name}`);
      return res.status(404).json({ error: `No files found in folder: ${matchingFolder.name}` });
    }

    console.log(`Found ${files.length} files in folder: ${matchingFolder.name}`);

    // Separate the .txt and .zip files
    const txtFiles = files.filter((file) => file.name.endsWith('.txt'));
    const zipFiles = files.filter((file) => file.name.endsWith('.zip'));

    if (txtFiles.length === 0 || zipFiles.length === 0) {
      console.error('Required files not found.');
      return res.status(404).json({ error: 'Required .txt or .zip files not found.' });
    }

    // Create a ZIP archive for all files
    const archive = archiver('zip', { zlib: { level: 1 } }); // Faster compression level

    // Set response headers for the ZIP file
    res.attachment(`${matchingFolder.name}.zip`);
    res.setHeader('Content-Type', 'application/zip');

    // Pipe the archive to the response
    archive.pipe(res);

    // Function to download a file as a stream
    const downloadFile = async (file) => {
      const filePath = `${folderPath}/${file.name}`;
      const stream = await client.downloadTo(PassThrough(), filePath);
      return stream;
    };

    // Download .txt and .zip files in parallel
    const streams = await Promise.all([...txtFiles, ...zipFiles].map(downloadFile));

    // Add each file to the archive
    streams.forEach((stream, index) => {
      const file = [...txtFiles, ...zipFiles][index];
      archive.append(stream, { name: file.name });
    });

    // Finalize the archive
    await archive.finalize();
    
  } catch (error) {
    console.error('Error retrieving files:', error.message);
    res.status(500).json({ error: 'Failed to retrieve files. Please try again later.' });
  } finally {
    client.close();
    console.log('FTP connection closed.');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
