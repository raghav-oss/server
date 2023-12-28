const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sql = require('mssql');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

const config = {
  user: 'himanshu',
  password: '130996',
  server: 'SAP-3-156',
  database: 'Orders_db',
  options: {
    encrypt: false,
    trustServerCertificate: true, // Accept self-signed certificate
  },
};

app.get('/api/fetchSubmittedData', async (req, res) => {
  try {
    await sql.connect(config);

    const result = await sql.query`SELECT Id, Name, ArticleCode, Color, Size, Quantity, Date FROM OrderData`;

    const submittedData = result.recordset;
    res.status(200).json({ submittedData });
  } catch (error) {
    console.error('Error Fetching Submitted data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await sql.close();
  }
});


app.post('/api/submitFormData', async (req, res) => {
  const { fullName, articleCode, color, size, quantity } = req.body;

  // Add date and time columns
  const scanDate = new Date().toISOString().split('T')[0];
  const currentTime = new Date();
  const options = { hour12: false, timeZone: 'Asia/Kolkata' };
  const formattedTime = currentTime.toLocaleTimeString('en-US', options).slice(0, 8);
  const scanTime = formattedTime;

  console.log('Formatted Time:', formattedTime); // Log the formatted time

  try {
    await sql.connect(config);

    // Update the SQL query to include date and time columns
    const result = await sql.query`INSERT INTO OrderData (Name, ArticleCode, Color, Size, Quantity, Date, Time) 
      VALUES (${fullName}, ${articleCode}, ${color}, ${size}, ${quantity}, ${scanDate}, ${scanTime})`;

    console.log('Form data inserted:', result);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error inserting form data:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    await sql.close();
  }
});