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
const bodyParser = require("body-parser");
const mysql = require("mysql");
const axios = require("axios");
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
app.use(express.json());  // ✅ This is required to parse JSON body
app.use(express.urlencoded({ extended: true }));  // ✅ For form data
app.use(bodyParser.json());


// Multer configuration for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

const FTP_CONFIG = {
  host: '46.202.138.82',
  user: 'u709132829.dreamik',
  password: 'dreamiK@123',
  secure: false,
};

// Remote Excel File Path
const FTP_FOLDER = '/SearchLogs';
const EXCEL_FILE_NAME = 'search_history.xlsx';
const LOCAL_EXCEL_FILE = 'search_history.xlsx';

// Function to download the existing Excel file from FTP
const downloadFromFTP = async (client) => {
  try {
    await client.ensureDir(FTP_FOLDER);
    await client.downloadTo(LOCAL_EXCEL_FILE, `${FTP_FOLDER}/${EXCEL_FILE_NAME}`);
    console.log('✅ Existing search history downloaded');
    return true;
  } catch (error) {
    console.log('⚠️ No existing search history found, creating new file.');
    return false;
  }
};

// Function to upload file to FTP
const uploadToFTP = async (buffer) => {
  const client = new Client();
  try {
    await client.access(FTP_CONFIG);
    await client.ensureDir(FTP_FOLDER);
    const stream = new PassThrough();
    stream.end(buffer);
    await client.uploadFrom(stream, `${FTP_FOLDER}/${EXCEL_FILE_NAME}`);
    console.log(`✅ Uploaded: ${FTP_FOLDER}/${EXCEL_FILE_NAME}`);
  } catch (error) {
    console.error('🚨 FTP Upload Error:', error.message);
  } finally {
    client.close();
  }
};

// Function to read and update search history in Excel
const updateSearchHistory = async (searchTerm) => {
  const client = new Client();
  await client.access(FTP_CONFIG);

  let searchData = [];

  // Try downloading the existing file
  const fileExists = await downloadFromFTP(client);
  if (fileExists) {
    const workbook = XLSX.readFile(LOCAL_EXCEL_FILE);
    const sheet = workbook.Sheets['SearchHistory'];
    searchData = XLSX.utils.sheet_to_json(sheet);
  }

  // Update search count
  const existingEntry = searchData.find((entry) => entry['Search Term'] === searchTerm);
  if (existingEntry) {
    existingEntry.Count += 1;
  } else {
    searchData.push({ 'Search Term': searchTerm, Count: 1 });
  }

  // Convert to worksheet and save
  const newWorkbook = XLSX.utils.book_new();
  const newWorksheet = XLSX.utils.json_to_sheet(searchData);
  XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'SearchHistory');

  XLSX.writeFile(newWorkbook, LOCAL_EXCEL_FILE);

  // Upload updated file to FTP
  await uploadToFTP(fs.readFileSync(LOCAL_EXCEL_FILE));
};

// API to store search history
app.post('/search', async (req, res) => {
  const { searchTerm } = req.body;

  if (!searchTerm) {
    return res.status(400).json({ error: 'Search term is required' });
  }

  // Update and save search history
  await updateSearchHistory(searchTerm);

  res.json({ message: 'Search saved successfully!' });
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
//reseller db
const pool = mysql.createPool({
  connectionLimit: 20,
  host: "153.92.15.45",
  port: "3306",
  user: "u709132829_dreamik",
  password: "dreamiK@123",
  database: "u709132829_resellerlogin",
  waitForConnections: true,
  queueLimit: 0,
  connectTimeout: 10000,
  acquireTimeout: 10000,
});

// **Login API (Without Hashing)**
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  const sql = "SELECT * FROM Reseller WHERE name = ? AND password = ?";
  
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Database connection error:", err);
      return res.status(500).json({ error: "Database connection error" });
    }

    connection.query(sql, [username, password], (queryErr, result) => {
      connection.release();

      if (queryErr) {
        console.error("Database query error:", queryErr);
        return res.status(500).json({ error: "Database query error" });
      }

      if (result.length > 0) {
        res.json({ success: true, message: "Login successful", user: result[0] });
      } else {
        res.json({ success: false, message: "Invalid username or password" });
      }
    });
  });
});

// Add Reseller 
app.post("/addReseller", (req, res) => {
  const {
    name,
    id,
    email,
    password,
    mobileno,
    whatsappno,
    address1,
    address2,
    pincode,
    district,
    state,
    landmark,
    products,
    walkin,
    chekin,
    courier,
  } = req.body;

  if (!id || !email || !password) {
    return res.status(400).json({ error: "ID, Email, and Password are required" });
  }

  pool.query("SELECT * FROM Reseller WHERE id = ? OR email = ?", [id, email], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length > 0) {
      const existingReseller = results[0];
      if (existingReseller.id === id) {
        return res.status(400).json({ message: "Reseller ID already exists" });
      } else if (existingReseller.email === email) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    pool.query(
      "INSERT INTO Reseller (name, id, email, password, mobileno, whatsappno, address1, address2, pincode, district, state, landmark, products, walkin, chekin, courier) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        name,
        id,
        email,
        password, // **Plain text password for testing**
        mobileno,
        whatsappno,
        address1,
        address2,
        pincode,
        district,
        state,
        landmark,
        JSON.stringify(products),
        walkin,
        chekin,
        courier,
      ],
      (insertErr, result) => {
        if (insertErr) {
          console.error("Insert failed:", insertErr);
          return res.status(500).json({ error: "Insert failed" });
        }
        res.status(200).json({ message: "Reseller added successfully" });
      }
    );
  });
});
//update reseller db
app.put("/updateReseller/:id", (req, res) => {
  const resellerId = req.params.id;
  const {
    name,
    email,
    password,
    mobileno,
    whatsappno,
    address1,
    address2,
    pincode,
    district,
    state,
    landmark,
    products,
    walkin,
    chekin,
    courier,
  } = req.body;

  pool.query("SELECT * FROM Reseller WHERE id = ?", [resellerId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    pool.query(
      "UPDATE Reseller SET name = ?, email = ?, password = ?, mobileno = ?, whatsappno = ?, address1 = ?, address2 = ?, pincode = ?, district = ?, state = ?, landmark = ?, products = ?, walkin = ?, chekin = ?, courier = ? WHERE id = ?",
      [
        name,
        email,
        password,
        mobileno,
        whatsappno,
        address1,
        address2,
        pincode,
        district,
        state,
        landmark,
        JSON.stringify(products),
        walkin,
        chekin,
        courier,
        resellerId,
      ],
      (updateErr, result) => {
        if (updateErr) {
          console.error("Update failed:", updateErr);
          return res.status(500).json({ error: "Update failed" });
        }

        res.status(200).json({ message: "User updated successfully" });
      }
    );
  });
});
//delete reseller
app.delete("/deleteReseller/:id", (req, res) => {
  const resellerId = req.params.id;

  pool.query("SELECT * FROM Reseller WHERE id = ?", [resellerId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Reseller not found" });
    }

    pool.query("DELETE FROM Reseller WHERE id = ?", [resellerId], (deleteErr, result) => {
      if (deleteErr) {
        console.error("Delete failed:", deleteErr);
        return res.status(500).json({ error: "Delete failed" });
      }

      res.status(200).json({ message: "Reseller deleted successfully" });
    });
  });
});
app.post("/remove-bg", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const response = await axios.post(
      "https://api.remove.bg/v1.0/removebg",
      {
        image_file: req.file.buffer, // Send image buffer
        size: "auto",
      },
      {
        headers: {
          "X-Api-Key": "ZD9HfNEg8nTKnUiyGbXXZ48A", // Replace with your remove.bg API Key
          "Content-Type": "multipart/form-data",
        },
        responseType: "arraybuffer",
      }
    );

    res.set("Content-Type", "image/png");
    res.send(response.data);
  } catch (error) {
    console.error("Error removing background:", error);
    res.status(500).json({ error: "Failed to remove background" });
  }
});

//logs for user page visits
const FTP_CONF = {
    host: "46.202.138.82",
    user: "u709132829.dreamik",
    password: "dreamiK@123",
    secure: false,
};
const getUserIP = (req) => {
    return req.headers["x-forwarded-for"]?.split(",")[0] || req.connection.remoteAddress || "unknown";
};

const uploadTo = async (userIP, logs) => {
    const client = new Client();
    try {
        await client.access(FTP_CONF);
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const directory = "/Userlogs";
        const filename = `${directory}/${userIP}_${timestamp}.json`;
        const fileContent = JSON.stringify(logs, null, 2);

        await client.ensureDir(directory);
        await client.uploadFrom(Buffer.from(fileContent, "utf8"), filename);
        console.log("✅ Log uploaded successfully");
    } catch (error) {
        console.error("❌ FTP upload error:", error);
    } finally {
        client.close();
    }
};

app.post("/api/log", async (req, res) => {
    try {
        const logs = req.body;
        if (!logs || logs.length === 0) return res.status(400).json({ error: "No logs provided" });

        const userIP = getUserIP(req);
        await uploadTo(userIP, logs);
        res.json({ message: "Logs stored successfully" });
    } catch (error) {
        console.error("❌ Log upload failed:", error);
        res.status(500).json({ error: "Failed to store logs" });
    }
});
// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
