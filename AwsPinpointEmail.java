package com.awsPinPoint.pushnotification.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import software.amazon.awssdk.services.pinpointemail.PinpointEmailClient;
import software.amazon.awssdk.services.pinpointemail.model.Body;
import software.amazon.awssdk.services.pinpointemail.model.Content;
import software.amazon.awssdk.services.pinpointemail.model.Destination;
import software.amazon.awssdk.services.pinpointemail.model.EmailContent;
import software.amazon.awssdk.services.pinpointemail.model.GetAccountRequest;
import software.amazon.awssdk.services.pinpointemail.model.GetAccountResponse;
import software.amazon.awssdk.services.pinpointemail.model.GetDeliverabilityDashboardOptionsRequest;
import software.amazon.awssdk.services.pinpointemail.model.GetDeliverabilityDashboardOptionsResponse;
import software.amazon.awssdk.services.pinpointemail.model.GetEmailIdentityRequest;
import software.amazon.awssdk.services.pinpointemail.model.GetEmailIdentityResponse;
import software.amazon.awssdk.services.pinpointemail.model.Message;
import software.amazon.awssdk.services.pinpointemail.model.PinpointEmailResponseMetadata;
import software.amazon.awssdk.services.pinpointemail.model.SendEmailRequest;
import software.amazon.awssdk.services.pinpointemail.model.SendEmailResponse;
import software.amazon.awssdk.services.pinpointemail.model.GetDeliverabilityDashboardOptionsRequest;
import software.amazon.awssdk.services.pinpointemail.model.GetDeliverabilityDashboardOptionsResponse;

@Service
public class AwsPinpointEmail {
	
	@Autowired
	private PinpointEmailClient pinpointEmailClient;

	public String sendEmail() {
		System.out.println("pinpointEmailClient: "+pinpointEmailClient);
		
        // Prepare the list of recipients
        List<String> toAddresses = new ArrayList<>();
       toAddresses.add("raja.somu1005@gmail.com");
       toAddresses.add("rajsomu1988@gmail.com");
       toAddresses.add("pusapatibharghavi@gmail.com");
       toAddresses.add("raja@test1.com");
		
		// Compose the email
        Destination destination = Destination.builder()
                .toAddresses(toAddresses)
                .build();

        Content subjectContent = Content.builder()
                .data("Hello from AWS Pinpoint")
                .charset("UTF-8")
                .build();

        Content bodyContent = Content.builder()
                .data("This is the email body.")
                .charset("UTF-8")
                .build();

        Body body = Body.builder()
                .text(bodyContent)
                .build();

        Message message = Message.builder()
                .subject(subjectContent)
                .body(body)
                .build();

        EmailContent emailContent = EmailContent.builder()
                .simple(message)
                .build();
        

        // Send the email
        SendEmailRequest request = SendEmailRequest.builder()
                .fromEmailAddress("raja.somu1005@gmail.com")
                .destination(destination)
                .content(emailContent)
                .build();
        
        
        
     // Retrieve the Email Project ID
 /*       String emailIdentity = "pusapatibharghavi@gmail.com"; // Replace with your email identity
        GetEmailIdentityRequest getEmailIdentityRequest = GetEmailIdentityRequest.builder()
                .emailIdentity(emailIdentity)
                .build();

        GetEmailIdentityResponse getEmailIdentityResponse = pinpointEmailClient.getEmailIdentity(getEmailIdentityRequest);
       // String emailProjectId = getEmailIdentityResponse.emailIdentity().identityTypeSpecificAttributes().pinpoint().applicationId();
        String emailProjectId =getEmailIdentityResponse.responseMetadata().requestId();
        System.out.println("Email Project ID: " + emailProjectId); */

        SendEmailResponse response = pinpointEmailClient.sendEmail(request);
        
        System.out.println("Email sent. Message ID: " + response.messageId());
        PinpointEmailResponseMetadata pinpointEmailResponseMetadata= response.responseMetadata();
        System.out.println("Email sent.pinpointEmailResponseMetadata: " + pinpointEmailResponseMetadata);

        // Close the PinpointEmailClient
        pinpointEmailClient.close();
        
        return response.messageId();
	}
	
	public void getTotalEmailsSent() {
	
	}
	
}
