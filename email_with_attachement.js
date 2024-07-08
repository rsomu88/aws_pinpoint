const AWS = require('aws-sdk');
const MongoClient = require('mongodb').MongoClient;
const express = require('express');
const Handlebars = require('handlebars');
const kinesis=new AWS.Kinesis();
require('express-async-await'); 
const fs=require('fs');
const path = require('path'); 
const { PinpointEmailClient, SendEmailCommand } = require("@aws-sdk/client-pinpoint-email");

const pinpoint = new AWS.Pinpoint({
    region: 'us-east-2',
    accessKeyId: '',
    secretAccessKey: ''
}
);

AWS.config.update({
    region: 'us-east-2',
    accessKeyId: '',
    secretAccessKey: ''
});

// Initialize the Pinpoint Email client
const client = new PinpointEmailClient({
    region: 'us-east-2', // Change to your region
    credentials: {
      accessKeyId: '',
      secretAccessKey: ''
    }
  });

  const ses = new AWS.SES({
    region: 'us-east-2', // Change to your region
    accessKeyId: '',
    secretAccessKey: ''
  });


const sendEmail = async () => {
    //const pinpoint = new AWS.PinpointEmail();
  
    const params = {
      Content: {
        Raw: {
          Data: createRawEmail(
            'raja.somu1005@gmail.com',
            'raja.somu1005@gmail.com',
            'Test email with attachment file',
            'Hello, this is a test email with attachment.',
            './test.txt'
          )
        }
      },
      Destination: {
        ToAddresses: ['raja.somu1005@gmail.com'] // Replace with recipient email
      },
      FromEmailAddress: 'raja.somu1005@gmail.com', // Replace with your verified sender email
    };
  
    try {
     // const result = await pinpoint.sendEmail(params).promise();
     const command = new SendEmailCommand(params);
     const result = await client.send(command);
      console.log(result);
    } catch (error) {
      console.error(error);
    }
  };
  
  const createRawEmail = (from, to, subject, body, attachmentPath) => {
    let fileContent;
    try {
      fileContent = fs.readFileSync(attachmentPath);
    } catch (err) {
      console.error(`Error reading file: ${err.message}`);
      return null;
    }
  
    const attachment = Buffer.from(fileContent).toString('base64');
    const fileName = path.basename(attachmentPath);
    const boundary = '----=_Part_0_123456789.123456789';
  
    const rawEmail = [
      `From: ${from}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      'Content-Type: text/plain; charset=UTF-8',
      'Content-Transfer-Encoding: 7bit',
      '',
      body,
      '',
      `--${boundary}`,
      `Content-Type: application/octet-stream; name="${fileName}"`,
      'Content-Transfer-Encoding: base64',
      `Content-Disposition: attachment; filename="${fileName}"`,
      '',
      attachment,
      '',
      `--${boundary}--`
    ].join('\r\n');
  
    return rawEmail;
  };

  const sendEmailWithAttachment = async () => {
    const from = 'raja.somu1005@gmail.com'; // Replace with your verified sender email
    const to = 'raja.somu1005@gmail.com'; // Replace with recipient email
    const subject = 'Test email with attachment with AWS SES';
    const body = 'Hello, this is a test email with attachment with AWS SES.';
    const attachmentPath = './test.txt'; // Replace with your attachment file path
  
    const rawEmailData = createRawEmailWithSES(from, to, subject, body, attachmentPath);
  
    if (!rawEmailData) {
      console.error('Failed to create raw email data.');
      return;
    }
  
    const params = {
      RawMessage: {
        Data: rawEmailData
      }
    };
  
    try {
      const result = await ses.sendRawEmail(params).promise();
      console.log('Email sent successfully:', result);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  const createRawEmailWithSES = (from, to, subject, body, attachmentPath) => {
    let fileContent;
    try {
      fileContent = fs.readFileSync(attachmentPath);
    } catch (err) {
      console.error(`Error reading file: ${err.message}`);
      return null;
    }
  
    const attachment = Buffer.from(fileContent).toString('base64');
    const fileName = path.basename(attachmentPath);
    const boundary = '----=_Part_0_123456789.123456789';
  
    const rawEmail = [
      `From: ${from}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      'Content-Type: text/plain; charset=UTF-8',
      'Content-Transfer-Encoding: 7bit',
      '',
      body,
      '',
      `--${boundary}`,
      `Content-Type: application/octet-stream; name="${fileName}"`,
      'Content-Transfer-Encoding: base64',
      `Content-Disposition: attachment; filename="${fileName}"`,
      '',
      attachment,
      '',
      `--${boundary}--`
    ].join('\r\n');
  
    console.log('Raw email created:', rawEmail);
    return Buffer.from(rawEmail);
  };
  
  sendEmail();
  sendEmailWithAttachment();