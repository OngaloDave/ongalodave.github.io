const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const AfricasTalking = require('africastalking');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Configure Africa's Talking
const username = 'kopado_sms';
const apiKey = 'eec98fd2f3d7a5689f6861bbc335fefa976f3c4091b84aa12c0341653f4e399a';

const africasTalking = new AfricasTalking({
  apiKey: apiKey,
  username: username,
});

// Serve the HTML form
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'pay.html'));
});

app.post('/send-sms', upload.single('excelFile'), async (req, res) => {
  try {
    const file = xlsx.readFile(req.file.path);
    const sheetName = file.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(file.Sheets[sheetName]);

    const smsPromises = sheetData.map(async (row) => {
      const { name, phoneNumber, balance, loan } = row;
      const message = `Dear ${name}, your NOYOFO savings scheme account balance is Kes. ${balance} and loan balance is Kes ${loan}.`;

      const options = {
        to: phoneNumber,
        message: message,
        //from
      };

      try {
        console.log(phoneNumber);
        await africasTalking.SMS.send(options);
        console.log(`SMS sent to ${phoneNumber}`);
        return Promise.resolve(); // Add this line to return a resolved Promise
      } catch (error) {
        console.error(`Failed to send SMS to ${phoneNumber}:`, error);
        return Promise.reject(error); // Add this line to return a rejected Promise
      }
    });

    await Promise.all(smsPromises);

    res.status(200).send('SMS messages sent successfully');
  } catch (error) {
    console.error('Failed to send SMS messages:', error);
    res.status(500).send('An error occurred while sending SMS messages');
  }
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
