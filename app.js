const AWS = require('aws-sdk');
const express = require('express');
require('express-async-await'); 
const pinpoint = new AWS.Pinpoint({
    region: 'us-east-2',
    accessKeyId: '',
    secretAccessKey: ''
}
);

console.log("pinpoint object:"+pinpoint);
/* const smsParams={
    ApplicationId: '',
  MessageRequest: {
    MessageConfiguration: {
      SMSMessage: {
        Body: 'Hello from Pinpoint!',
        MessageType: 'TRANSACTIONAL',
        SenderId: 'SMS6560041'
      }
    },
    Addresses: {
      '+18326560041': {
        ChannelType: 'SMS'
      }
    }
  }
}; */


const emailParams = {
    ApplicationId: '2ec1e03cc2274792a299069d8757056f',
   // CampaignId: 'YOUR_CAMPAIGN_ID',
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
        /* 'vinaykumarkasam@yahoo.com': {
          ChannelType: 'EMAIL'
        },*/
        'rajsomu1988@gmail.com': {
          ChannelType: 'EMAIL'
        } 
       /*  'rajareddy.somu@gmail.com': {
          ChannelType: 'EMAIL'
        }, 
        'raja.somu1005@gmail.com': {
          ChannelType: 'EMAIL'
        } */
      }
    }
  };
  
 /*  pinpoint.sendMessages(params, function(err, data) {
    if (err) {
      console.log('Error sending email:', err);
    } else {
      console.log('Email sent successfully:', data);
    }
  }); */
  

pinpoint.sendMessages(emailParams,function(err,data){
    if(err){
        console.log("Errors SMS message:"+err);
    }else{
        console.log("Message sent successfully:"+data);
        const { MessageResponse } = data;
        const { Result } = MessageResponse;
        const response = {Result};
        console.log("response:"+response.Result);
        const email = Object.keys(response.Result);
        console.log("email:"+email);

        for (const [key, value] of Object.entries(response)) {
          console.log('Key:', key);
          console.log('email status Values:', value);

        }
    }
});


const emailAnalyticsParams = {
  ApplicationId: '2ec1e03cc2274792a299069d8757056f'
 // CampaignId: '975ab1cba14e40269f13c540b91bb09c'
};
pinpoint.getEmailChannel({ ...emailAnalyticsParams }, (err, data) => {
  if (err) {
    console.error('Error retrieving email analytics:', err);
  } else {
    console.log('Email analytics data:', data);
  }
});

const getUsageReports = async () => {
  const params = {
      ApplicationId: ''
  };

  try {
      const response = await pinpoint.getDeliverabilityDashboardOptions(params).promise();
      const reportsEnabled = response.DeliverabilityDashboardOptions.Enabled;

      if (reportsEnabled) {
          console.log('Amazon Pinpoint Usage Reports are enabled for the application.');
      } else {
          console.log('Amazon Pinpoint Usage Reports are disabled for the application.');
      }
  } catch (error) {
      console.error('Error:', error);
  }
};

// Call the function to retrieve the usage reports
getUsageReports();


