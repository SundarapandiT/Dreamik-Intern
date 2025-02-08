const express = require('express');
const cors = require('cors');
const { Client } = require('basic-ftp');
const multer = require('multer');
const PassThrough = require('stream').PassThrough;;
const fs = require('fs');
const unzipper = require('unzipper'); 
const archiver = require('archiver');
const path = require('path');
const XLSX = require('xlsx');

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

const FTP_CONFIG = {
  host: '46.202.138.82',
  user: 'u709132829.dreamik',
  password: 'dreamiK@123',
  secure: false,
};

// Search History Object (Stored in Memory)
let searchHistory = {};

// Function to upload a file to FTP
const uploadToFTP = async (buffer, filename, folder) => {
  const client = new Client();
  try {
    await client.access(FTP_CONFIG);
    await client.ensureDir(folder); // Ensure directory exists
    const stream = new PassThrough();
    stream.end(buffer);
    await client.uploadFrom(stream, `${folder}/${filename}`);
    console.log(`Uploaded: ${folder}/${filename}`);
  } catch (error) {
    console.error('FTP Upload Error:', error.message);
  } finally {
    client.close();
  }
};

// Function to save search history as an Excel file
const saveSearchHistoryToExcel = async () => {
  const wsData = [['Search Term', 'Count']]; // Excel Headers
  for (const term in searchHistory) {
    wsData.push([term, searchHistory[term]]);
  }

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'SearchHistory');

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

  // Upload to FTP
  await uploadToFTP(excelBuffer, 'search_history.xlsx', '/SearchLogs');
};

// API to store search history
app.post('/search', async (req, res) => {
  const { searchTerm } = req.body;

  if (!searchTerm) {
    return res.status(400).json({ error: 'Search term is required' });
  }

  // Update search count
  searchHistory[searchTerm] = (searchHistory[searchTerm] || 0) + 1;

  // Save to FTP
  await saveSearchHistoryToExcel();

  res.json({ message: 'Search saved', searchHistory });
});


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
    { name: 'bulkzip' },
     { name: 'excelfile' } 
  ]),
  async (req, res) => {
    const client = new Client();
    client.ftp.verbose = true;

    // const generateRandomString = (length = 5) => {
    //   const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    //   let result = '';
    //   for (let i = 0; i < length; i++) {
    //     result += characters.charAt(Math.floor(Math.random() * characters.length));
    //   }
    //   return result;
    // };

    try {
      // Connect to the FTP server
      await client.access({
        host: '46.202.138.82',
        user: 'u709132829.dreamik',
        password: 'dreamiK@123',
        secure: false,
      });

      // const string = generateRandomString();
      // const f = `${req.body.orderId}-${string}-v1`;
       const f = `${req.body.orderId}`;

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
       if (req.files['excelfile']) {
        const excelFile = req.files['excelfile'][0];
        await uploadFileToBothFolders(excelFile.buffer, `excelfile-${f}.xlsx`);
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

      if (req.files['bulkzip']) {
        for (const [index, zipFile] of req.files['bulkzip'].entries()) {
          const filename = `${f}-Bulk_${index + 1}.zip`;
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
app.get('/retrieve/:orderId', async (req, res) => {
  const { orderId } = req.params;
  const client = new Client();
  client.ftp.verbose = true;

  try {
    // Connect to the FTP server
    await client.access({
      host: '46.202.138.82',
      user: 'u709132829.dreamik',
      password: 'dreamiK@123',
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

    // Find the ZIP file in the folder
    const zipFile = files.find((file) => file.name.endsWith('.zip'));
    if (!zipFile) {
      console.error(`No ZIP file found in folder: ${matchingFolder.name}`);
      return res.status(404).json({ error: `No ZIP file found in folder: ${matchingFolder.name}` });
    }

    const zipFilePath = `${folderPath}/${zipFile.name}`;
    const localZipPath = path.join(__dirname, zipFile.name);

    console.log(`Downloading ZIP file from: ${zipFilePath} to ${localZipPath}`);

    // Download the ZIP file using client.downloadTo
    await client.downloadTo(localZipPath, zipFilePath);

    // Extract the ZIP file
    const extractedFolderPath = path.join(__dirname, `extracted_${orderId}`);
    await fs.promises.mkdir(extractedFolderPath, { recursive: true });
    await fs.createReadStream(localZipPath)
      .pipe(unzipper.Extract({ path: extractedFolderPath }))
      .promise();

    // Now we check for the .txt file in the folder (not inside the ZIP)
    const folderFiles = await client.list(folderPath); // List files in the folder (outside the ZIP)
    const textFile = folderFiles.find((file) => file.name.endsWith('.txt')); // Look for the .txt file

    let productDetails = {};

    if (textFile) {
      const textFilePath = `${folderPath}/${textFile.name}`;
      const localTextFilePath = path.join(__dirname, textFile.name);

      console.log(`Downloading text file from: ${textFilePath} to ${localTextFilePath}`);

      // Download the .txt file containing product details
      await client.downloadTo(localTextFilePath, textFilePath);

      // Read the content of the .txt file
      const buffer = await fs.promises.readFile(localTextFilePath, 'utf-8');
      console.log('Product details (raw):', buffer); // Log the raw content
      try {
        productDetails = JSON.parse(buffer); // Parse the JSON content
        console.log('Product details (parsed):', productDetails); // Log parsed content
      } catch (error) {
        console.error(`Error parsing JSON from file ${textFile.name}:`, error);
      }
    }

    // Read the extracted images and convert to Base64
    const extractedFiles = await fs.promises.readdir(extractedFolderPath);
    const imageData = [];

    for (const file of extractedFiles) {
      const filePath = path.join(extractedFolderPath, file);

      // Only process image files (e.g., .png, .jpg)
      if (file.endsWith('.png') || file.endsWith('.jpg')) {
        const buffer = await fs.promises.readFile(filePath);
        imageData.push({
          name: file,
          type: 'image',
          content: buffer.toString('base64'),
        });
      }
    }

    // Clean up local files (optional)
    fs.promises.unlink(localZipPath).catch(console.error); // Delete the ZIP file
    fs.promises.rm(extractedFolderPath, { recursive: true, force: true }).catch(console.error); // Delete the extracted folder

    // Send the response with both images and product details
    res.status(200).json({
      folderName: matchingFolder.name,
      files: [
        ...imageData,
        {
          name: 'productDetails.txt',
          type: 'text',
          content: productDetails,
        },
      ],
    });
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
