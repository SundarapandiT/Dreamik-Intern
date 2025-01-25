const express = require('express');
const cors = require('cors');
const { Client } = require('basic-ftp');
const multer = require('multer');
const { PassThrough } = require('stream');
const redis = require('redis'); // Redis client
const fs = require('fs'); 
const path = require('path');

const app = express();
const PORT = 3000;

// Initialize Redis Client
const redisClient = redis.createClient({ url: 'redis://localhost:6379' });
redisClient.connect().catch((err) => console.error('Failed to connect to Redis', err));

// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'https://www.dreamikai.com',
  'https://dreamikai.com',
  'https://www.dreamik.com',
  'https://dreamik.com',
];

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

app.use(cors(corsOptions));

const storage = multer.memoryStorage();
const upload = multer({ storage });

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

      const customerUploadFolder = `/CustomerUploads/${f}`;
      const customerDisplayFolder = `/CustomerDisplayItems/${f}`;

      await client.ensureDir(customerUploadFolder);
      await client.ensureDir(customerDisplayFolder);

      console.log(`Folders created: ${customerUploadFolder}, ${customerDisplayFolder}`);

      const uploadFileToBothFolders = async (buffer, filename) => {
        const stream1 = PassThrough();
        const stream2 = PassThrough();
        stream1.end(buffer);
        stream2.end(buffer);

        await uploadStreamToFTP(stream1, `${customerUploadFolder}/${filename}`, client);
        await uploadStreamToFTP(stream2, `${customerDisplayFolder}/${filename}`, client);
      };

      if (req.files['payment']) {
        const paymentFile = req.files['payment'][0];
        const paymentStream = PassThrough();
        paymentStream.end(paymentFile.buffer);
        await uploadStreamToFTP(paymentStream, `${customerUploadFolder}/Payment-${f}.txt`, client);
      }

      if (req.files['info']) {
        const infoFile = req.files['info'][0];
        await uploadFileToBothFolders(infoFile.buffer, `Info-${f}.txt`);
      }

      if (req.files['images']) {
        for (const [index, imageFile] of req.files['images'].entries()) {
          const filename = `${f}-image_${index + 1}.png`;
          await uploadFileToBothFolders(imageFile.buffer, filename);
        }
      }

      // Fetch files metadata (not the actual file content)
      const fileData = req.files['images'].map((file, index) => ({
        name: file.originalname,
        size: file.size,
        type: 'image',
      }));

      // Store data in Redis
      await redisClient.set(
        `order:${req.body.orderId}`,
        JSON.stringify({ folderName: f, files: fileData }),
        'EX',
        172800 // Expiry
      );

      res.status(200).json({ message: 'Files uploaded and cached successfully.' });
    } catch (error) {
      console.error('Error during upload:', error);
      res.status(500).json({ error: 'Failed to upload files.' });
    } finally {
      client.close();
    }
  }
);

// GET Endpoint to retrieve files by orderId from Redis (or FTP if not cached)
app.get('/retrieve/:orderId', async (req, res) => {
  const { orderId } = req.params;

  try {
    // Check Redis cache first
    const cachedData = await redisClient.get(`order:${orderId}`);
    if (cachedData) {
      // Return cached data
      const data = JSON.parse(cachedData);
      return res.status(200).json(data);
    }

    // If not in Redis, fetch from FTP
    const client = new Client();
    await client.access({
      host: '46.202.138.82',
      user: 'u709132829.dreamikaishop',
      password: 'dreamikAi@123',
      secure: false,
    });

    const customerDisplayFolder = '/CustomerDisplayItems';
    const folders = await client.list(customerDisplayFolder);

    const matchingFolder = folders.find((folder) => folder.name.includes(orderId));
    if (!matchingFolder) {
      return res.status(404).json({ error: `No folder found for Order ID: ${orderId}` });
    }

    const folderPath = `${customerDisplayFolder}/${matchingFolder.name}`;
    const files = await client.list(folderPath);

    const fileData = files.map((file) => ({
      name: file.name,
      size: file.size,
      type: file.name.endsWith('.png') || file.name.endsWith('.jpg') ? 'image' : 'text',
      modifiedAt: file.rawModifiedAt || null,
    }));

    // Store in Redis for future use
    await redisClient.set(
      `order:${orderId}`,
      JSON.stringify({ folderName: matchingFolder.name, files: fileData }),
      'EX',
      36000
    );

    res.status(200).json({ folderName: matchingFolder.name, files: fileData });
  } catch (error) {
    console.error('Error retrieving files:', error);
    res.status(500).json({ error: 'Failed to retrieve files.' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
