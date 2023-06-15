package com.awsPinPoint.pushnotification.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.awsPinPoint.pushnotification.service.AwsPinpointEmail;

import com.awsPinPoint.pushnotification.config.AWSConfig;

@RestController
@RequestMapping("awsPinpoint")
public class AwsPinpointController {
	
	@Autowired
	AWSConfig aWSConfig;
	@Autowired
	AwsPinpointEmail AwsPinpointEmail;
	
	@GetMapping("/sendEmail")
	public String sendEmail() {
		System.out.println("Email started");
		String messageId=AwsPinpointEmail.sendEmail();
		System.out.println("Email Sent itmessageId:"+messageId);
		return messageId;
	}
	
	@GetMapping("/getTotalEmailsSent")
	public String getEmailAnalytics() {
		System.out.println("Email started");
		String messageId=AwsPinpointEmail.sendEmail();
		System.out.println("Email Sent itmessageId:"+messageId);
		return messageId;
	}

}
