const AWS = require('aws-sdk');
const MongoClient = require('mongodb').MongoClient;
const express = require('express');
const Handlebars = require('handlebars');
const kinesis=new AWS.Kinesis();
require('express-async-await'); 
const fs=require('fs');
const path = require('path'); 

// Initialize the Pinpoint client
const pinpoint = new AWS.Pinpoint({
    region: 'us-east-2',
    accessKeyId: '',
    secretAccessKey: ''
}
);

const sendEmail = async () => {
    const rawEmailData = createRawEmail(
      'raja.somu1005@gmail.com',
      'raja.somu1005@gmail.com',
      'Test email with attachment',
      'Hello, this is a test email with attachment in aws pinpoint email service.',
      './test.txt'
    );
  
    if (!rawEmailData) {
      console.error('Failed to create raw email data.');
      return;
    }
  
    const params = {
      ApplicationId: '506cfd16c52d4a5290cc5591c6406617',
      MessageRequest: {
        Addresses: {
          'raja.somu1005@gmail.com': {
            ChannelType: 'EMAIL'
          }
        },
        MessageConfiguration: {
          EmailMessage: {
            FromAddress: 'raja.somu1005@gmail.com',
           /*  SimpleEmail: {
              Subject: {
                Charset: 'UTF-8',
                Data: 'Test email with attachment aws pinpoint'
              },
              HtmlPart: {
                Charset: 'UTF-8',
                Data: rawEmailData
              }
            } */
              RawEmail: {
                Data: rawEmailData.toString('base64') // Convert Buffer to base64 string
            }
          }
        }
      }
    };
  
    try {
      const result = await pinpoint.sendMessages(params).promise();
      console.log('Email sent successfully with attachment:', result);
    } catch (error) {
      console.error('Error sending email with attachment:', error);
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
  
    console.log('Raw email created:', rawEmail);
    return Buffer.from(rawEmail);
  };
  
  sendEmail();