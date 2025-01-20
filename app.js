const ftp = require('basic-ftp');

async function uploadToFTP(fileBuffer, fileName) {
  const client = new ftp.Client();
  client.ftp.verbose = true; // Optional: Enable verbose logging for debugging

  try {
    // Connect to the FTP server without a password
    await client.access({
      host: 'dreamikai.com',
      user: 'u709132829.dreamikai.com',
      // password: '', // Empty password
      secure: false, // Set to 'true' if you are using FTPS
    });

    // Ensure the target directory exists
    await client.ensureDir('public_html/uploads');

    // Upload the file buffer
    await client.uploadFrom(fileBuffer, fileName);

    console.log(`Successfully uploaded ${fileName} to FTP server.`);
  } catch (err) {
    console.error('FTP upload failed', err);
  } finally {
    client.close();
  }
}
