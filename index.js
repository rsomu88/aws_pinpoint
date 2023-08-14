const AWS = require('aws-sdk');
const { MongoClient } = require('mongodb');
const cron = require('node-cron');
const databaseUrl = 'mongodb://127.0.0.1:27017';

AWS.config.update({
  accessKeyId: 'AKIAX45MY3KT3UWBVEUH',
  secretAccessKey: 'pRrOCJFRtCbUxUBs9oKsO6PL3v5qEby75uknHnDg',
  region: 'us-east-2', // Replace with your desired region
});

const pinpoint = new AWS.Pinpoint();
const ses = new AWS.SES();

const kpiNames = ['txn-emails-sent','txn-emails-delivered','txn-emails-opened','txn-emails-clicked'];
const commonParams = {
    ApplicationId: '2ec1e03cc2274792a299069d8757056f',
    //StartTime: '2023-08-01T00:00:00Z',
    //EndTime: '2023-08-10T23:59:59Z',
  };
  const fetchAndStoreMetrics = async () => {
  kpiNames.forEach(kpiName => {
    const params = {
      ...commonParams,
      KpiName: kpiName,
    };

  try {
    pinpoint.getApplicationDateRangeKpi(params, (err, data) => {
     if(data){
        console.log(`Data for KPI '${kpiName}':`);
        //console.log(data);
        const numberOfRows = data.ApplicationDateRangeKpiResponse.KpiResult.Rows.length;
        const rowsArray = data.ApplicationDateRangeKpiResponse.KpiResult.Rows;
        //const client = new MongoClient(databaseUrl);
        //client.connect();
        // const db = client.db('pinpointemail');
        const client = new MongoClient(databaseUrl);
        client.connect();
        const db = client.db('pinpointemail');
         const insertPromises = [];
         if (rowsArray.length > 0) {           
        rowsArray.forEach(row => {
            console.log(row.Values); 
            const value = row.Values[0].Value;
            const key = row.Values[0].Key;
            console.log('value:',value);
            console.log('key:',key);
            const insertPromise = db.collection('emailMetrics').insertOne({ key, value,timestamp: new Date() });
            insertPromises.push(insertPromise);
          });
          //client.close();
       }else{
        console.log(`Data for KPI '${kpiName}' value is :`,numberOfRows);
       const insertPromise = db.collection('emailMetrics').insertOne({ kpiName, numberOfRows,timestamp: new Date() });
       insertPromises.push(insertPromise);
       //client.close();
       }
      }else{
        console.error(`Error fetching data for KPI '${kpiName}':`, err);
      }
    });
  } catch (error) {
    console.error('Error inserting metrics:', error);
  }
  });
}
//fetchAndStoreMetrics();

// Fetch metrics from MongoDB and send email using Amazon SES
const fetchMetricsAndSendEmail = async () => {
  try {
    fetchAndStoreMetrics();
    const client = new MongoClient(databaseUrl);
    await client.connect();
    const db = client.db('pinpointemail');
    const collection = db.collection('emailMetrics');
    const keysToFetch = ['TxnEmailsDelivered', 'TxnEmailsOpened', 'TxnEmailsSent', 'txn-emails-clicked'];

    const metricsRecords = await collection.find({ key: { $in: keysToFetch } }, { sort: { timestamp: -1 }, limit: 4 }).toArray();
    console.log('Fetched Metrics Records:', metricsRecords);
    if (metricsRecords.length > 0) {
      // Prepare email content
      let emailContent = 'Amazon Pinpoint Transactional Email Metrics:\n';
      metricsRecords.forEach(record => {
        emailContent += `${record.key}: ${record.value}\n`;
      });

      // Send email using Amazon SES
      const params = {
        Source: 'rajsomu1988@gmail.com', // Replace with your SES verified email address
        Destination: {
          ToAddresses: ['rajsomu1988@gmail.com'], // Replace with recipient's email address
        },
        Message: {
          Subject: {
            Data: 'Amazon Pinpoint Transactional Email Metrics Report',
          },
          Body: {
            Text: {
              Data: emailContent,
            },
          },
        },
      };

      const sendEmailResponse = await ses.sendEmail(params).promise();
      console.log('Email sent via Amazon SES:', sendEmailResponse.MessageId);
    } else {
      console.log('No metrics data found in MongoDB');
    }

    // Close the MongoDB connection
    client.close();
  } catch (error) {
    console.error('Error fetching or sending email:', error);
  }
};
fetchMetricsAndSendEmail();
//cron.schedule('0 1 * * *', fetchAndStoreMetrics);
//cron.schedule('*/2 * * * *', fetchMetricsAndSendEmail);

