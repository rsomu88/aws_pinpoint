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


  const fetchAndStoreMetrics = async () => {
   const kpiNames = ['txn-emails-sent','txn-emails-delivered','txn-emails-opened','txn-emails-clicked'];
const commonParams = {
    ApplicationId: '2ec1e03cc2274792a299069d8757056f',
  };
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
   // fetchAndStoreMetrics();
   getEmailMetrics();
    const client = new MongoClient(databaseUrl);
    await client.connect();
    const db = client.db('pinpointemail');
    const collection = db.collection('emailMetrics');
    const keysToFetch = ['sentCount', 'openCount', 'deliveredCount', 'clickedCount'];

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

const getEmailMetrics = async () => {
    const client = new MongoClient(databaseUrl);
   
    try {
        await client.connect();
       const applicationId = '2ec1e03cc2274792a299069d8757056f';
       let sentCount = 0;
       let openCount = 0;
       let deliveredCount = 0;
       let clickedCount = 0;

       const sentParams = {
           ApplicationId: applicationId, 
           KpiName: 'txn-emails-sent',                       
       };
   
       const deliveredParams = {
           ApplicationId: applicationId, 
           KpiName: 'txn-emails-delivered',                       
       };
   
       const openParams = {
           ApplicationId: applicationId, 
           KpiName: 'txn-emails-opened',                       
       };
   
       const clickedParams = {
           ApplicationId: applicationId, 
           KpiName: 'txn-emails-clicked',                       
       };

       // Fetch sentCount
       pinpoint.getApplicationDateRangeKpi(sentParams, function(err, data) {
           if (!err) {
               const numberOfRows = data.ApplicationDateRangeKpiResponse.KpiResult.Rows.length;
               if (numberOfRows > 0) {
                   sentCount = parseFloat(data.ApplicationDateRangeKpiResponse.KpiResult.Rows[0].Values[0].Value);
               }
           }
       });

       // Fetch deliveredCount
       pinpoint.getApplicationDateRangeKpi(deliveredParams, function(err, data) {
           if (!err) {
               const numberOfRows = data.ApplicationDateRangeKpiResponse.KpiResult.Rows.length;
               if (numberOfRows > 0) {
                   deliveredCount = parseFloat(data.ApplicationDateRangeKpiResponse.KpiResult.Rows[0].Values[0].Value);
               }
           }
       });

       // Fetch openCount
       pinpoint.getApplicationDateRangeKpi(openParams, function(err, data) {
           if (!err) {
               const numberOfRows = data.ApplicationDateRangeKpiResponse.KpiResult.Rows.length;
               if (numberOfRows > 0) {
                   openCount = parseFloat(data.ApplicationDateRangeKpiResponse.KpiResult.Rows[0].Values[0].Value);
               }
           }
       });

       // Fetch clickedCount
       pinpoint.getApplicationDateRangeKpi(clickedParams, function(err, data) {
           if (!err) {
               const numberOfRows = data.ApplicationDateRangeKpiResponse.KpiResult.Rows.length;
               if (numberOfRows > 0) {
                   clickedCount = parseFloat(data.ApplicationDateRangeKpiResponse.KpiResult.Rows[0].Values[0].Value);
               }
           }

           const record = {
               sentCount,
               openCount,
               deliveredCount,
               clickedCount,
               timestamp: new Date()
           };

           const db = client.db('pinpointemail');
           const collection = db.collection('emailMetrics');
           collection.insertOne(record, (err, result) => {
               if (err) {
                   console.error('Error inserting record:', err);
               } else {
                   console.log('Record inserted:', result.ops);
               }

               // Close the MongoDB connection
               client.close();
           });
       });
   } catch (error) {
       console.log('Error in pinpoint connection:', error); 
   }
};


const getLatestRecordAndSendEmail = async () => {
    const client = new MongoClient(databaseUrl);
    try {
        getEmailMetrics();
        await client.connect();

        const db = client.db('pinpointemail');
        const collection = db.collection('emailMetrics');

        // Sort by the "timestamp" field in descending order (latest first)
        const sortOptions = { timestamp: -1 };

        // Find the latest record using findOne() with sort options
        const latestRecord = await collection.findOne({}, { sort: sortOptions });

        if (latestRecord) {
            const { sentCount, openCount, deliveredCount, clickedCount,_id } = latestRecord;

            // Send email using Amazon SES
            const emailParams = {
                Destination: {
                    ToAddresses: ['rajsomu1988@gmail.com'], // Replace with business email address
                },
                Message: {
                    Body: {
                        Text: {
                            Data: `
                                Latest Email Metrics:

                                Sent Count: ${sentCount}
                                Open Count: ${openCount}
                                Delivered Count: ${deliveredCount}
                                Clicked Count: ${clickedCount}
                            `,
                        },
                    },
                    Subject: { Data: 'Latest Email Metrics' },
                },
                Source: 'rajsomu1988@gmail.com', // Replace with your verified SES sender email
            };

            await ses.sendEmail(emailParams).promise();
            console.log('Email sent to business.');
                // Update status in the collection
                await collection.updateOne(
                    { _id :_id},
                    { $set: { emailSent: true,emailService:"sendEmail" } } // Set the field to indicate email has been sent
                );
                console.log('Status updated in the collection.');
        } else {
            console.log('No records found in the collection.');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        client.close();
    }
};

//getLatestRecordAndSendEmail();

getEmailMetrics();

//fetchMetricsAndSendEmail();