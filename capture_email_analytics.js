const AWS = require('aws-sdk');
const express = require('express');
require('express-async-await');
const axios = require('axios');
// Set the region where your Pinpoint project is located
//AWS.config.update({ region: 'us-west-2' });

// Create an instance of the Pinpoint service
//const pinpoint = new AWS.Pinpoint();
const pinpoint = new AWS.Pinpoint({
    region: 'us-east-2',
    accessKeyId: 'AKIAX45MY3KT3UWBVEUH',
    secretAccessKey: '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'
}
);

// Define the Pinpoint project ID
const projectId = '2ec1e03cc2274792a299069d8757056f';

// Define the start and end time for the email events you want to retrieve
const startTime = new Date('2023-05-01T00:00:00Z');
const endTime = new Date('2023-06-08T23:59:59Z');

// Define the event type you're interested in (e.g., 'SENT', 'OPEN', 'CLICK')
const eventType = 'SENT';

// Specify the maximum number of results to retrieve
const pageSize  = 100;

// Define the function to retrieve email event data
/*const getEmailEvents = async () => {
    try {
      const params = {
        ApplicationId: projectId,
        StartTime: startTime.toISOString(),
        EndTime: endTime.toISOString(),
        PageSize: maxResults,
      };
  
      const eventStream = pinpoint.getEventStream(params);
  //console.log("eventStream:"+eventStream);
      // Iterate over the event stream and filter events based on the eventType
      for await (const event of eventStream) {
        console.log("Each Event:"+event);
        if (event.Event.Type === eventType) {
          // Perform analytics on the email event data
          console.log("event:"+event);
        }
      }
    } catch (error) {
      console.error('Error retrieving email events:', error);
    }
  };*/

  // Define the function to retrieve email events
  
const getEmailEvents = async () => {
    try {
      let events = [];
      let token = null;
  
      do {
        const params = {
          ApplicationId: projectId,
          StartTime: startTime.toISOString(),
          EndTime: endTime.toISOString(),
          PageSize: pageSize,
          Token: token,
        };
  
        const respo = await pinpoint.getEventStream(params).promise();
        const response = await pinpoint.getEvents(params).promise();
  
        // Filter events based on the eventType
        const filteredEvents = response.EventsResponse.Results.filter(
          (event) => event.Event.Type === eventType
        );
  
        events.push(...filteredEvents);
        token = response.EventsResponse.NextToken;
      } while (token);
  
      // Perform analytics on the email event data
      console.log(events);
    } catch (error) {
      console.error('Error retrieving email events:', error);
    }
  };


  const getEmailEventsNode = async () => {
    try {
      const params = {
        ApplicationId: projectId
      };
      const respo = await pinpoint.Project(params).promise();
      //const response = await pinpoint.getDeliverabilityTestReport().promise();
      const response = await pinpoint.getDeliverabilityTestReport({ ReportId: '2ec1e03cc2274792a299069d8757056f' }).promise();
      console.log('Email events:', response.Events);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  
 // getEmailEventsNode();

// Call the function to retrieve email events
//getEmailEvents();

const credentials = new AWS.Credentials({
  accessKeyId: 'AKIAX45MY3KT3UWBVEUH',
  secretAccessKey: 'pRrOCJFRtCbUxUBs9oKsO6PL3v5qEby75uknHnDg',
});

// Set the AWS region
const region = 'us-east-2'; // Replace with your desired region

// Create a new service object (Amazon Pinpoint in this example)
const service = new AWS.Pinpoint({
  credentials: credentials,
  region: region,
});

const generateAuthorizationHeader = async (endpoint) => {
  
  try {
    const request = new AWS.HttpRequest(endpoint, region);
    request.method = 'GET';
    request.headers['host'] = new URL(endpoint).host;

    // Sign the request
    const signer = new AWS.Signers.V4(request, 'mobiletargeting');
    signer.addAuthorization(credentials, new Date());

    const authorizationHeader = request.headers['Authorization'];
    return { authorizationHeader, endpoint };
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

const getPinpointData = async () => {
  const endpoint = 'https://pinpoint.us-east-2.amazonaws.com/v1/apps/2ec1e03cc2274792a299069d8757056f/kpis/daterange/txn-emails-sent';

  try {
    const { authorizationHeader } = await generateAuthorizationHeader(endpoint);
console.log("authorizationHeader:",authorizationHeader);
    const response = await axios.get(endpoint, {
      headers: {
        'Authorization': 'AWS4-HMAC-SHA256 Credential=AKIAX45MY3KT3UWBVEUH/20230810/us-east-2/mobiletargeting/aws4_request, SignedHeaders=content-type;host;x-amz-date, Signature=8475793cfd2fddc9a33b1c232eb550f3d78863a053d7078d4599af7d7411a4d4',
        'Content-Type' : 'application/json',
      },
    });

    console.log('Response:', response.data);
  } catch (error) {
    console.error('Error:', error);
  }
};

getPinpointData();