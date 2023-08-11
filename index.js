const AWS = require('aws-sdk');
const { MongoClient } = require('mongodb');
const databaseUrl = 'mongodb://127.0.0.1:27017';

AWS.config.update({
  accessKeyId: 'AKIAX45MY3KT3UWBVEUH',
  secretAccessKey: 'pRrOCJFRtCbUxUBs9oKsO6PL3v5qEby75uknHnDg',
  region: 'us-east-2', // Replace with your desired region
});

const pinpoint = new AWS.Pinpoint();

const kpiNames = ['txn-emails-delivered', 'txn-emails-sent','txn-emails-opened','txn-emails-clicked'];
const commonParams = {
    ApplicationId: '2ec1e03cc2274792a299069d8757056f',
    //StartTime: '2023-08-01T00:00:00Z',
    //EndTime: '2023-08-10T23:59:59Z',
  };

  kpiNames.forEach(kpiName => {
    const params = {
      ...commonParams,
      KpiName: kpiName,
    };
  
    pinpoint.getApplicationDateRangeKpi(params, (err, data) => {
      if (err) {
        console.error(`Error fetching data for KPI '${kpiName}':`, err);
      } else {
        console.log(`Data for KPI '${kpiName}':`);
        //console.log(data);
        const numberOfRows = data.ApplicationDateRangeKpiResponse.KpiResult.Rows.length;
        const rowsArray = data.ApplicationDateRangeKpiResponse.KpiResult.Rows;
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
            const insertPromise = db.collection('emailMetrics').insertOne({ key, value });
            insertPromises.push(insertPromise);
          });

          Promise.all(insertPromises)
          .then(results => {
            console.log('Metrics inserted:', results);
          })
          .catch(err => {
            console.error('Error inserting metrics:', err);
          })
          .finally(() => {
            // Close the MongoDB connection
            client.close();
          });
          
       }else{
        console.log(`Data for KPI '${kpiName}' value is :`,numberOfRows);
       const insertPromise = db.collection('emailMetrics').insertOne({ kpiName, numberOfRows });
       insertPromises.push(insertPromise);
       Promise.all(insertPromises)
       .then(results => {
         console.log('Metrics inserted:', results);
       })
       .catch(err => {
         console.error('Error inserting metrics:', err);
       })
       .finally(() => {
         // Close the MongoDB connection
         client.close();
       });
       }
              // Wait for all insert promises to complete

       
      }
    });
  });

/* var params = {
    ApplicationId: '2ec1e03cc2274792a299069d8757056f', /* required */
    //KpiName: 'txn-emails-sent' /* required */
   // EndTime: new Date || 'Wed Dec 31 1969 16:00:00 GMT-0800 (PST)' || 123456789,
  //  StartTime: new Date || 'Wed Dec 31 1969 16:00:00 GMT-0800 (PST)' || 123456789
 // }; */
 /*  pinpoint.getApplicationDateRangeKpi(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else{
        console.log(data);
        const rowsArray = data.ApplicationDateRangeKpiResponse.KpiResult.Rows;
        console.log(rowsArray);
        rowsArray.forEach(row => {
            console.log(row.Values); 
            const value = row.Values[0].Value;
            const key = row.Values[0].Key;
            console.log('value:',value);
            console.log('key:',key);
          });
    }           
  }); */