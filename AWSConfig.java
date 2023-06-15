package com.awsPinPoint.pushnotification.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.pinpointemail.PinpointEmailClient;

@Configuration
public class AWSConfig {
	
	@Value("${aws.accessKeyId}")
    private String accessKey;

    @Value("${aws.secretKey}")
    private String secretKey;

    @Bean
    public AwsCredentialsProvider awsCredentialsProvider() {
        AwsBasicCredentials credentials = AwsBasicCredentials.create(accessKey, secretKey);
        return StaticCredentialsProvider.create(credentials);
    }

    @Bean
    public PinpointEmailClient pinpointEmailClient(AwsCredentialsProvider credentialsProvider) {
        return PinpointEmailClient.builder()
                .region(Region.US_EAST_2)
                .credentialsProvider(credentialsProvider)
                .build();
    }

}
