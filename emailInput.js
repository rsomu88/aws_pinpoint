const AWS = require('aws-sdk');
const express = require('express');
const bodyParser = require('body-parser');

// Initialize AWS SDK with your credentials and region
//AWS.config.update({ region: 'us-east-1' }); // Change to your region

AWS.config.update({
    accessKeyId: 'AKIAX45MY3KT3UWBVEUH',
    secretAccessKey: 'pRrOCJFRtCbUxUBs9oKsO6PL3v5qEby75uknHnDg',
    region: 'us-east-2',
  });

const pinpoint = new AWS.Pinpoint();
const app = express();
app.use(bodyParser.json());

// Endpoint to send an email using AWS Pinpoint
app.post('/sendEmail', async (req, res) => {
  try {
    console.log("send Email start:",req.body);
    const { applicationId, emailId, templateId } = req.body;

    // Validate if all required fields are present in the request
    if (!applicationId || !emailId || !templateId) {
      return res.status(400).json({ error: 'applicationId, emailId, and templateId are required' });
    }

    // Create the message request
    const messageRequest = {
      ApplicationId: applicationId,
      MessageRequest: {
        Addresses: {
          [emailId]: {
            ChannelType: 'EMAIL'
          }
        },
        MessageConfiguration: {
          EmailMessage: {
            FromAddress: 'pusapatibharghavi@gmail.com', // Replace with your sender email
            SimpleEmail: {
              Subject: {
                Charset: 'UTF-8',
                Data: 'Your Email Subject'
              },
              HtmlPart: {
                Charset: 'UTF-8',
                Data: 'HTML body of your email'
              }
            }
          }
        }
      }
    };

    // Send the email using AWS Pinpoint
    const result = await pinpoint.sendMessages(messageRequest).promise();

    // Respond with success or appropriate data
    return res.status(200).json({ message: 'Email sent successfully', result });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'An error occurred' });
  }
});

// Start the server
const port = 3000; // Change to your desired port
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
