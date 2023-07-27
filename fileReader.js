const AWS = require('aws-sdk');
const csvParser = require('csv-parser');
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const properties = require('properties-parser');

const environment = process.env.NODE_ENV || 'development';
const propertiesFilePath = path.join(__dirname, 'config');
const config = properties.read(`${propertiesFilePath}/config.${environment}.properties`);

const mongoURI = config.mongoURI;

// Configure the AWS region (replace 'your_region' with your desired region)
AWS.config.update({
  accessKeyId: 'AKIAX45MY3KT3UWBVEUH',
  secretAccessKey: 'pRrOCJFRtCbUxUBs9oKsO6PL3v5qEby75uknHnDg',
  region: 'us-east-2',
});

// MongoDB Connection URI (replace 'your_mongodb_uri' with your MongoDB connection string)
//const mongoURI = 'mongodb://127.0.0.1:27017';

// Create a new S3 instance
const s3 = new AWS.S3();

const pinpoint = new AWS.Pinpoint();

// Function to read S3 bucket .txt file data and insert into MongoDB
async function readS3TxtFileAndInsertToMongoDB(bucketName, fileKey) {
  try {
    const params = {
      Bucket: bucketName,
      Key: fileKey,
    };

    // Use the getObject method to read the file content from S3
    const data = await s3.getObject(params).promise();

    // Convert the binary data to a string
    const fileContent = data.Body.toString();
console.log("S3 bucket file data fileContent:",fileContent);
    // Use the csv-parser module to parse the CSV data with '|' as the delimiter


     // Use the csv-parser module to parse the CSV data with '|' as the delimiter
     const records = [];
     const rows = fileContent.split('\n');
     const headers = rows[0].split('|');
     for (let i = 1; i < rows.length; i++) {
       const rowValues = rows[i].split('|');
       if (rowValues.length === headers.length) {
         const record = {};
         for (let j = 0; j < headers.length; j++) {
           record[headers[j]] = rowValues[j];
         }
         records.push(record);
       }
     }
        // Connect to MongoDB
        const client = new MongoClient(mongoURI);
        await client.connect();

        try {
          const db = client.db('pinpointemail'); // Replace 'your_database_name' with your MongoDB database name
          const collection = db.collection('s3bucketfile'); // Replace 'your_collection_name' with your MongoDB collection name

          // Insert each record into MongoDB
          const result=await collection.insertMany(records);

          console.log('Data inserted into MongoDB successfully!',result.insertedIds);

//AWS Pinpoint for sending email

const emailParams = {
  ApplicationId: '2ec1e03cc2274792a299069d8757056f',
  MessageRequest: {
    MessageConfiguration: {
      EmailMessage: {
        FromAddress: 'pusapatibharghavi@gmail.com',
        SimpleEmail: {
          Subject: {
            Charset: 'UTF-8',
            Data: 'Hello from Pinpoint email service!'
          },
          HtmlPart: {
            Charset: 'UTF-8',
            Data: '<html><body><h1>Hello!</h1><p>This is the content of the email through nodejs code.Sent by Raja.</p></body></html>'
          }
        }
      }
    },
    Addresses: {
      'rajsomu1988@gmail.com': {
        ChannelType: 'EMAIL'
      } 
    }
  }
};

const sendEmailResult = await pinpoint.sendMessages(emailParams).promise();
      console.log('Pinpoint email sent:', sendEmailResult.MessageResponse);


        } catch (err) {
          console.error('Error inserting data into MongoDB:', err);
        } finally {
          // Close the MongoDB connection
          client.close();
        }
  } catch (err) {
    console.error('Error reading S3 bucket data:', err);
  }
}

// Call the function with your S3 bucket name and file key (path)
const bucketName = 'pinpoints3bucketemail';
const fileKey = 'feb_detal.txt'; // Example: 'folder/subfolder/file.txt'
readS3TxtFileAndInsertToMongoDB(bucketName, fileKey);
